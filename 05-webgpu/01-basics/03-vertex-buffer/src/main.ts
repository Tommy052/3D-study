// ============================================================
// 03. Vertex Buffer — GPU 메모리에 정점 데이터 업로드
// ============================================================
// 학습 포인트:
//   1. device.createBuffer() — GPUBuffer 생성 (usage 플래그)
//   2. device.queue.writeBuffer() — CPU → GPU 데이터 복사
//   3. pipeline.vertex.buffers[] — 정점 레이아웃 기술 (stride + attributes)
//   4. pass.setVertexBuffer() + pass.draw()
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

  // ── 정점 데이터 ──────────────────────────────────────────────
  //
  // 인터리브 버퍼: [x, y, r, g, b] × 3개 정점
  //
  //          (0, 0.5)  ← 빨강
  //           /     \
  //   초록 ← /       \ → 파랑
  //     (-0.5,-0.5)  (0.5,-0.5)
  //
  const vertices = new Float32Array([
  //   x      y      r     g     b
     0.0,  0.5,   1.0,  0.3,  0.3,  // 위   — 빨강
    -0.5, -0.5,   0.3,  1.0,  0.3,  // 좌하 — 초록
     0.5, -0.5,   0.3,  0.3,  1.0,  // 우하 — 파랑
  ]);

  // ── GPUBuffer 생성 ───────────────────────────────────────────
  //
  // usage 플래그:
  //   VERTEX   — 정점 버퍼로 사용
  //   COPY_DST — writeBuffer()로 데이터 쓰기 허용
  //
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices); // CPU → GPU 복사

  // ── WGSL 셰이더 ─────────────────────────────────────────────
  //
  // struct VertexIn  — 각 정점에서 받아오는 데이터 (@location ↔ attribute)
  // struct VertexOut — 프래그먼트 셰이더로 전달하는 데이터
  // rasterizer가 VertexOut.color를 정점 간 보간(interpolate)한다
  //
  const shaderCode = /* wgsl */`
    struct VertexIn {
      @location(0) position: vec2f,
      @location(1) color: vec3f,
    };

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) color: vec3f,
    };

    @vertex
    fn vs_main(in: VertexIn) -> VertexOut {
      var out: VertexOut;
      out.pos = vec4f(in.position, 0.0, 1.0);
      out.color = in.color;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      return vec4f(in.color, 1.0); // 보간된 색상 출력
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 렌더 파이프라인 (정점 레이아웃 포함) ─────────────────────
  //
  // arrayStride: 정점 1개의 바이트 수 (5 floats × 4 bytes = 20 bytes)
  // attributes[].shaderLocation: WGSL @location(N) 과 대응
  // attributes[].offset: 정점 시작부터 해당 속성까지의 바이트 오프셋
  // attributes[].format: GPU에서 해석하는 데이터 타입
  //
  const STRIDE = 5 * 4; // 5 floats × 4 bytes
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: STRIDE,
        attributes: [
          { shaderLocation: 0, offset: 0,     format: 'float32x2' }, // position (xy)
          { shaderLocation: 1, offset: 2 * 4, format: 'float32x3' }, // color (rgb)
        ],
      }],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
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
    pass.setVertexBuffer(0, vertexBuffer); // slot 0 ↔ buffers[0]
    pass.draw(3);                          // 3 정점 → 삼각형 1개
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
