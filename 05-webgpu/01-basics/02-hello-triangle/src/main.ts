// ============================================================
// 02. Hello Triangle — 첫 삼각형
// ============================================================
// 학습 포인트:
//   1. WGSL 셰이더 작성 (@builtin(vertex_index) 활용)
//   2. createShaderModule() 로 셰이더 컴파일
//   3. createRenderPipeline() 명시적 파이프라인 생성
//   4. pass.draw(3) — 정점 버퍼 없이 삼각형 그리기
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
  // @builtin(vertex_index) : 현재 정점의 인덱스 (0, 1, 2)
  // 위치 배열을 셰이더 내부에 하드코딩 → 별도 정점 버퍼 없이 그리기
  //
  // NDC 좌표: 중앙 (0,0), 위 +Y, 오른쪽 +X, 범위 [-1, 1]
  const shaderCode = /* wgsl */`
    @vertex
    fn vs_main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(
        vec2f( 0.0,  0.5),   // 위 꼭짓점
        vec2f(-0.5, -0.5),   // 좌하 꼭짓점
        vec2f( 0.5, -0.5),   // 우하 꼭짓점
      );
      return vec4f(pos[i], 0.0, 1.0);
    }

    @fragment
    fn fs_main() -> @location(0) vec4f {
      return vec4f(1.0, 0.5, 0.0, 1.0); // 주황색 (R=1, G=0.5, B=0)
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 렌더 파이프라인 ──────────────────────────────────────────
  //
  // layout: 'auto'     — 셰이더에서 bind group 레이아웃 자동 추론
  // topology: 'triangle-list' — 3개 정점마다 삼각형 1개 생성
  //
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }], // 출력 텍스처 포맷 (화면 포맷과 일치)
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  // ── 렌더 루프 ────────────────────────────────────────────────
  function render() {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(pipeline);
    pass.draw(3); // 정점 3개 → 삼각형 1개
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
