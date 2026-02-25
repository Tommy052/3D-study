// ============================================================
// 04. WGSL 연동 — Uniform Buffer + 색상 웨이브 애니메이션
// ============================================================
// 학습 포인트:
//   1. WGSL 핵심 문법: struct, var<uniform>, @group, @binding
//   2. Uniform Buffer로 시간(u_time) 전달
//   3. BindGroup — uniform buffer를 셰이더에 연결
//   4. 전체 화면 쿼드 (삼각형 2개, vertex_index만 사용)
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

  // ── WGSL 셰이더 ─────────────────────────────────────────────
  //
  // 핵심 WGSL 문법 정리:
  //
  //   struct Uniforms { ... }
  //     — 여러 값을 하나의 타입으로 묶기
  //
  //   @group(0) @binding(0) var<uniform> u: Uniforms;
  //     — @group(N): BindGroup 인덱스
  //     — @binding(N): 그 안에서의 binding 슬롯
  //     — var<uniform>: 모든 invocation에서 동일한 값 (읽기 전용)
  //
  //   @builtin(vertex_index): GPU 내장 값
  //   @location(N): 사용자 정의 입출력
  //
  const shaderCode = /* wgsl */`
    // Uniform 구조체 — CPU에서 매 프레임 갱신
    struct Uniforms {
      time: f32,   // 경과 시간 (초)
    };

    @group(0) @binding(0) var<uniform> u: Uniforms;

    // Vertex → Fragment 전달 구조체
    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) uv: vec2f,  // [0,1] 범위의 화면 UV
    };

    // 전체 화면을 덮는 두 삼각형 (6개 정점)
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

    // 시간 + UV 기반 RGB 웨이브
    // sin() 함수가 -1~1 사이로 진동 → 0.5 + 0.5 * sin() 으로 0~1 변환
    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      let t = u.time;
      let x = in.uv.x;
      let y = in.uv.y;

      let r = 0.5 + 0.5 * sin(t        + x * 6.283);
      let g = 0.5 + 0.5 * sin(t * 0.7  + y * 6.283 + 2.094);
      let b = 0.5 + 0.5 * sin(t * 1.3  + (x + y) * 3.141 + 4.188);

      return vec4f(r, g, b, 1.0);
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── Uniform Buffer ───────────────────────────────────────────
  //
  // f32 하나 = 4 bytes
  // WebGPU uniform buffer는 최소 크기가 16 bytes여야 함
  //
  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── 파이프라인 ───────────────────────────────────────────────
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shaderModule, entryPoint: 'vs_main' },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  // ── Bind Group ───────────────────────────────────────────────
  //
  // pipeline.getBindGroupLayout(0) — @group(0) 레이아웃을 파이프라인에서 가져옴
  // entries[].binding: @binding(N) 과 대응
  // entries[].resource: 어떤 GPU 리소스를 연결할지
  //
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: { buffer: uniformBuffer },
    }],
  });

  // ── 렌더 루프 ────────────────────────────────────────────────
  const startTime = performance.now();

  function render() {
    const time = (performance.now() - startTime) / 1000; // 초 단위
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time]));

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup); // @group(0) 바인딩
    pass.draw(6);                    // 전체 화면 쿼드 (삼각형 2개)
    pass.end();

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
