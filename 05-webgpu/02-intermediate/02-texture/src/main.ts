// ============================================================
// 02. 텍스처 — GPUTexture + GPUSampler + BindGroup
// ============================================================
// 학습 포인트:
//   1. device.createTexture() — 텍스처 생성 (usage 플래그)
//   2. device.queue.writeTexture() — CPU 픽셀 데이터 → GPU
//   3. device.createSampler() — 필터링 & 래핑 설정
//   4. WGSL: texture_2d<f32>, sampler, textureSample()
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

  // ── 절차적 체커보드 텍스처 ────────────────────────────────
  //
  // 이미지 파일 없이 CPU에서 픽셀 데이터를 직접 생성
  // 256×256 pixels, RGBA (4 bytes per pixel)
  //
  const TEX_SIZE = 256;
  const SQUARES  = 8;
  const pixelData = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const cx = Math.floor(x / (TEX_SIZE / SQUARES));
      const cy = Math.floor(y / (TEX_SIZE / SQUARES));
      const white = (cx + cy) % 2 === 0;
      const i = (y * TEX_SIZE + x) * 4;
      pixelData[i + 0] = white ? 240 : 30;  // R
      pixelData[i + 1] = white ? 240 : 80;  // G (약간 색조)
      pixelData[i + 2] = white ? 240 : 30;  // B
      pixelData[i + 3] = 255;               // A
    }
  }

  // ── GPUTexture 생성 ──────────────────────────────────────────
  //
  // usage:
  //   TEXTURE_BINDING — 셰이더에서 읽기 (sampled texture)
  //   COPY_DST        — writeTexture()로 데이터 업로드 허용
  //
  const texture = device.createTexture({
    size: [TEX_SIZE, TEX_SIZE],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  // CPU → GPU 텍스처 데이터 복사
  device.queue.writeTexture(
    { texture },
    pixelData,
    { bytesPerRow: TEX_SIZE * 4 }, // 한 행의 바이트 수
    [TEX_SIZE, TEX_SIZE],          // 복사할 영역 크기
  );

  // ── GPUSampler ───────────────────────────────────────────────
  //
  // magFilter: 확대 필터 (텍셀 하나가 여러 픽셀 차지할 때)
  // minFilter: 축소 필터 (여러 텍셀이 한 픽셀 차지할 때)
  // addressMode: UV가 [0,1] 범위 밖일 때 처리 방식
  //
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    addressModeU: 'repeat',
    addressModeV: 'repeat',
  });

  // ── 정점 버퍼 (텍스처 쿼드) ──────────────────────────────────
  // position(xy) + uv(uv) = 4 floats per vertex
  // 쿼드 = 삼각형 2개 = 6개 정점
  const STRIDE = 4 * 4;
  const vertices = new Float32Array([
  //   x      y      u     v
    -0.7, -0.7,   0.0, 1.0,
     0.7, -0.7,   1.0, 1.0,
     0.7,  0.7,   1.0, 0.0,
    -0.7, -0.7,   0.0, 1.0,
     0.7,  0.7,   1.0, 0.0,
    -0.7,  0.7,   0.0, 0.0,
  ]);

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  // ── Uniform Buffer (시간 → 회전) ─────────────────────────────
  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── WGSL 셰이더 ─────────────────────────────────────────────
  //
  // texture_2d<f32>  — 2D 텍스처 (float 채널)
  // sampler          — 필터링 규칙
  // textureSample()  — UV 좌표로 텍스처 샘플링
  //
  const shaderCode = /* wgsl */`
    struct Uniforms { time: f32 };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    @group(0) @binding(1) var myTexture: texture_2d<f32>;
    @group(0) @binding(2) var mySampler: sampler;

    struct VertexIn {
      @location(0) position: vec2f,
      @location(1) uv: vec2f,
    };

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) uv: vec2f,
    };

    @vertex
    fn vs_main(in: VertexIn) -> VertexOut {
      let angle = u.time * 0.8;
      let c = cos(angle);
      let s = sin(angle);
      // 2D 회전 행렬 적용
      let rotated = vec2f(
        in.position.x * c - in.position.y * s,
        in.position.x * s + in.position.y * c,
      );
      var out: VertexOut;
      out.pos = vec4f(rotated, 0.0, 1.0);
      out.uv  = in.uv;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      return textureSample(myTexture, mySampler, in.uv);
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 파이프라인 ───────────────────────────────────────────────
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: STRIDE,
        attributes: [
          { shaderLocation: 0, offset: 0,     format: 'float32x2' }, // position
          { shaderLocation: 1, offset: 2 * 4, format: 'float32x2' }, // uv
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

  // ── Bind Group ───────────────────────────────────────────────
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: texture.createView() },
      { binding: 2, resource: sampler },
    ],
  });

  // ── 렌더 루프 ────────────────────────────────────────────────
  const startTime = performance.now();

  function render() {
    const time = (performance.now() - startTime) / 1000;
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time]));

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
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(6);
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
