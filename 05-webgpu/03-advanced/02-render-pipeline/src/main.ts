// ============================================================
// 02. 렌더 파이프라인 — 블렌드 모드 / 토폴로지 / 컬 모드
// ============================================================
// 학습 포인트:
//   1. blend.color: srcFactor / dstFactor / operation 설정
//   2. 알파 블렌딩 vs 가산 블렌딩(Additive) 비교
//   3. topology: 'triangle-list' vs 'line-list' 비교
//   4. cullMode: 'none' | 'back' | 'front'
// ============================================================
//
// [1] 알파 블렌딩: out = src.rgba * src.a + dst.rgba * (1 - src.a)
//     → 일반적인 투명도 처리
//
// [2] 가산 블렌딩: out = src.rgba * src.a + dst.rgba * 1
//     → 색이 더해져 밝아짐, 발광/파티클 효과에 사용
//
// 화면 왼쪽: 알파 블렌딩 / 오른쪽: 가산 블렌딩
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

  // ── WGSL 셰이더 ─────────────────────────────────────────────
  //
  // 정점 셰이더: 원 중심(cx, cy) 주변에 삼각형들을 생성
  // 프래그먼트 셰이더: 원 경계를 부드럽게 처리 (SDF)
  //
  const shaderCode = /* wgsl */`
    struct Uniforms { time: f32 };
    @group(0) @binding(0) var<uniform> u: Uniforms;

    // 원 N개 × 삼각형 M개 = N×M×3 정점
    // vertex_index로 어느 원, 어느 삼각형인지 계산
    const NUM_CIRCLES = 6u;
    const SEGS = 32u;          // 원 1개 = 32 삼각형 (부채꼴)

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) uv: vec2f,   // 원 중심 기준 상대 좌표
      @location(1) color: vec4f,
    };

    @vertex
    fn vs_main(
      @builtin(vertex_index) vi: u32,
      @builtin(instance_index) ci: u32, // 원 인덱스
    ) -> VertexOut {
      let seg   = vi / 3u;   // 어느 삼각형 (부채꼴)
      let local = vi % 3u;   // 삼각형 내 정점 인덱스

      let pi2 = 6.28318;
      let angle1 = f32(seg)   / f32(SEGS) * pi2;
      let angle2 = f32(seg+1) / f32(SEGS) * pi2;
      let r = 0.12;

      // 원 중심 위치 (왼쪽 3개 / 오른쪽 3개 — 각 패널에)
      let panelX = select(-0.5, 0.5, ci >= 3u); // 오른쪽이면 +0.5
      let localIdx = ci % 3u;
      let cx = panelX + cos(f32(localIdx) / 3.0 * pi2 + u.time * 0.3) * 0.22;
      let cy = sin(f32(localIdx) / 3.0 * pi2 + u.time * 0.3) * 0.22;

      var lpos = vec2f(0.0);
      if (local == 0u) { lpos = vec2f(0.0, 0.0); }           // 중심
      if (local == 1u) { lpos = vec2f(cos(angle1), sin(angle1)) * r; }
      if (local == 2u) { lpos = vec2f(cos(angle2), sin(angle2)) * r; }

      // 원 색상 (원마다 다름)
      let hue = f32(localIdx) / 3.0;
      let color = vec4f(
        0.5 + 0.5 * sin(hue * 6.28 + 0.0),
        0.5 + 0.5 * sin(hue * 6.28 + 2.09),
        0.5 + 0.5 * sin(hue * 6.28 + 4.18),
        0.6, // alpha
      );

      var out: VertexOut;
      out.pos   = vec4f(cx + lpos.x, cy + lpos.y, 0.0, 1.0);
      out.uv    = lpos / r; // -1~1 범위 정규화
      out.color = color;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      // 원 내부는 1, 경계는 부드럽게 0으로 (SDF 소프트 엣지)
      let d = length(in.uv);
      let alpha = in.color.a * smoothstep(1.0, 0.85, d);
      return vec4f(in.color.rgb, alpha);
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 공통 파이프라인 설정 ─────────────────────────────────────
  const basePipelineDesc: GPURenderPipelineDescriptor = {
    layout: 'auto',
    vertex: { module: shaderModule, entryPoint: 'vs_main' },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format, blend: undefined }], // blend는 아래에서 설정
    },
    primitive: { topology: 'triangle-list' },
  };

  // ── 알파 블렌딩 파이프라인 ───────────────────────────────────
  // dst = src * src.a + dst * (1 - src.a)  — 투명도 혼합
  const alphaPipeline = device.createRenderPipeline({
    ...basePipelineDesc,
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{
        format,
        blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one',       dstFactor: 'zero',                operation: 'add' },
        },
      }],
    },
  });

  // ── 가산 블렌딩 파이프라인 ───────────────────────────────────
  // dst = src * src.a + dst * 1  — 색이 더해져 밝아짐 (발광 효과)
  const additivePipeline = device.createRenderPipeline({
    ...basePipelineDesc,
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{
        format,
        blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
          alpha: { srcFactor: 'one',       dstFactor: 'zero', operation: 'add' },
        },
      }],
    },
  });

  // ── Bind Groups ──────────────────────────────────────────────
  const alphaBindGroup = device.createBindGroup({
    layout: alphaPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });
  const additiveBindGroup = device.createBindGroup({
    layout: additivePipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  // ── 렌더 루프 ────────────────────────────────────────────────
  const startTime = performance.now();

  function render() {
    const time = (performance.now() - startTime) / 1000;
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time]));

    const encoder = device.createCommandEncoder();
    const view = context.getCurrentTexture().createView();

    // 두 패스를 분리하여 다른 블렌드 모드로 그림
    // (clearValue가 다르므로 별도 패스로 분리)

    // 패스 1 — 전체 화면 지우기
    {
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      pass.end();
    }

    // 패스 2 — 왼쪽 3개 원: 알파 블렌딩
    {
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          loadOp: 'load', // 이전 패스 결과 유지
          storeOp: 'store',
        }],
      });
      pass.setPipeline(alphaPipeline);
      pass.setBindGroup(0, alphaBindGroup);
      // instance 0~2 (왼쪽 패널)
      pass.draw(32 * 3, 3, 0, 0); // SEGS*3 정점, 3 인스턴스, offset 0
      pass.end();
    }

    // 패스 3 — 오른쪽 3개 원: 가산 블렌딩
    {
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          loadOp: 'load',
          storeOp: 'store',
        }],
      });
      pass.setPipeline(additivePipeline);
      pass.setBindGroup(0, additiveBindGroup);
      // instance 3~5 (오른쪽 패널)
      pass.draw(32 * 3, 3, 0, 3); // SEGS*3 정점, 3 인스턴스, instanceOffset 3
      pass.end();
    }

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  render();
}

main().catch(console.error);
