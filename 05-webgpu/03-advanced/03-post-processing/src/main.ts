// ============================================================
// 03. 포스트 프로세싱 — Render-to-Texture + 전체화면 쿼드
// ============================================================
// 학습 포인트:
//   1. Offscreen 텍스처 (RENDER_ATTACHMENT | TEXTURE_BINDING)
//   2. 1패스: 씬 → offscreen 텍스처
//   3. 2패스: offscreen 텍스처 → 화면 (효과 적용)
//   4. 비네팅(Vignette) + 색수차(Chromatic Aberration) 효과
// ============================================================

async function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (!navigator.gpu) throw new Error('WebGPU not supported');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('No adapter');
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu')!;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format });

  // ── Uniform (시간) ────────────────────────────────────────────
  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── 씬 셰이더 (1패스용) ──────────────────────────────────────
  // 회전하는 컬러 삼각형들을 그린다
  const sceneShaderCode = /* wgsl */`
    struct Uniforms { time: f32 };
    @group(0) @binding(0) var<uniform> u: Uniforms;

    const NUM_TRIANGLES = 5u;

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) color: vec3f,
    };

    @vertex
    fn vs_main(
      @builtin(vertex_index)   vi: u32,
      @builtin(instance_index) ti: u32,
    ) -> VertexOut {
      var tips = array<vec2f, 3>(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.4),
        vec2f( 0.5, -0.4),
      );

      let hue   = f32(ti) / f32(NUM_TRIANGLES);
      let speed = 0.4 + hue * 0.6;
      let angle = u.time * speed + hue * 6.28318;
      let c = cos(angle); let s = sin(angle);
      let scale = 0.3 + hue * 0.2;

      let local = tips[vi] * scale;
      let rotated = vec2f(local.x*c - local.y*s, local.x*s + local.y*c);
      let center = vec2f(
        cos(hue * 6.28318 + u.time * 0.2) * 0.35,
        sin(hue * 6.28318 + u.time * 0.2) * 0.35,
      );

      var out: VertexOut;
      out.pos   = vec4f(center + rotated, 0.0, 1.0);
      out.color = vec3f(
        0.5 + 0.5 * sin(hue * 6.28 + 0.0),
        0.5 + 0.5 * sin(hue * 6.28 + 2.09),
        0.5 + 0.5 * sin(hue * 6.28 + 4.18),
      );
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      return vec4f(in.color, 1.0);
    }
  `;

  // ── 포스트 프로세싱 셰이더 (2패스용) ─────────────────────────
  //
  // 두 가지 효과:
  //   1. 비네팅(Vignette)     — 화면 가장자리를 어둡게
  //   2. 색수차(Chromatic Aberration) — R/G/B 채널을 살짝 다른 UV로 샘플링
  //
  const postShaderCode = /* wgsl */`
    struct Uniforms { time: f32 };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    @group(0) @binding(1) var sceneTex: texture_2d<f32>;
    @group(0) @binding(2) var sceneSampler: sampler;

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) uv: vec2f,
    };

    // 전체 화면 쿼드 (6정점)
    @vertex
    fn vs_main(@builtin(vertex_index) i: u32) -> VertexOut {
      var pos = array<vec2f, 6>(
        vec2f(-1.0, -1.0), vec2f( 1.0, -1.0), vec2f(-1.0,  1.0),
        vec2f(-1.0,  1.0), vec2f( 1.0, -1.0), vec2f( 1.0,  1.0),
      );
      var uv = array<vec2f, 6>(
        vec2f(0.0, 1.0), vec2f(1.0, 1.0), vec2f(0.0, 0.0),
        vec2f(0.0, 0.0), vec2f(1.0, 1.0), vec2f(1.0, 0.0),
      );
      var out: VertexOut;
      out.pos = vec4f(pos[i], 0.0, 1.0);
      out.uv  = uv[i];
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      let uv = in.uv;

      // 색수차: R/G/B를 미세하게 다른 UV로 샘플링
      let strength = 0.004 + sin(u.time * 0.7) * 0.002;
      let center = vec2f(0.5, 0.5);
      let dir = normalize(uv - center);

      let r = textureSample(sceneTex, sceneSampler, uv + dir * strength * 1.5).r;
      let g = textureSample(sceneTex, sceneSampler, uv).g;
      let b = textureSample(sceneTex, sceneSampler, uv - dir * strength * 1.0).b;

      var color = vec3f(r, g, b);

      // 비네팅: 중심에서 멀수록 어두워짐
      let d = length(uv - center);
      let vignette = 1.0 - smoothstep(0.4, 0.9, d);
      color *= vignette;

      return vec4f(color, 1.0);
    }
  `;

  const sceneModule = device.createShaderModule({ code: sceneShaderCode });
  const postModule  = device.createShaderModule({ code: postShaderCode });

  // ── Sampler ───────────────────────────────────────────────────
  const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

  // ── 씬 파이프라인 ─────────────────────────────────────────────
  const scenePipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: sceneModule, entryPoint: 'vs_main' },
    fragment: {
      module: sceneModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  // ── 포스트 파이프라인 ─────────────────────────────────────────
  const postPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: postModule, entryPoint: 'vs_main' },
    fragment: {
      module: postModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  const sceneBindGroup = device.createBindGroup({
    layout: scenePipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  // ── Offscreen 텍스처 + BindGroup 생성 함수 ────────────────────
  //
  // 캔버스 크기가 바뀌면 offscreen 텍스처도 재생성해야 한다
  //
  let offscreenTexture: GPUTexture;
  let postBindGroup: GPUBindGroup;

  function createOffscreenResources() {
    offscreenTexture?.destroy();
    offscreenTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      format,
      // RENDER_ATTACHMENT — 1패스의 렌더 타겟
      // TEXTURE_BINDING   — 2패스에서 샘플링
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    postBindGroup = device.createBindGroup({
      layout: postPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: offscreenTexture.createView() },
        { binding: 2, resource: sampler },
      ],
    });
  }

  createOffscreenResources();

  // ── 렌더 루프 ────────────────────────────────────────────────
  const startTime = performance.now();

  function render() {
    const time = (performance.now() - startTime) / 1000;
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time]));

    const encoder = device.createCommandEncoder();

    // 1패스 — 씬 → offscreen 텍스처
    {
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: offscreenTexture.createView(),
          clearValue: { r: 0.05, g: 0.03, b: 0.08, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      pass.setPipeline(scenePipeline);
      pass.setBindGroup(0, sceneBindGroup);
      pass.draw(3, 5); // 3 정점 × 5 삼각형 인스턴스
      pass.end();
    }

    // 2패스 — offscreen 텍스처 → 화면 (포스트 프로세싱)
    {
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      pass.setPipeline(postPipeline);
      pass.setBindGroup(0, postBindGroup);
      pass.draw(6); // 전체화면 쿼드
      pass.end();
    }

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createOffscreenResources();
  });

  render();
}

main().catch(console.error);
