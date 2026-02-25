// ============================================================
// 01. GPU Instancing — 같은 메쉬 수천 개 효율적 렌더링
// ============================================================
// 학습 포인트:
//   1. stepMode: 'instance' — 정점 버퍼를 인스턴스 단위로 전진
//   2. @builtin(instance_index) — 현재 인스턴스 번호
//   3. 인스턴스별 위치, 크기, 회전, 색상 다르게 적용
//   4. 단 1번의 draw call로 N개 메쉬 렌더링
// ============================================================

const NUM_INSTANCES = 800;

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

  // ── 삼각형 정점 (메쉬 템플릿) ───────────────────────────────
  // 모든 인스턴스가 공유하는 로컬 좌표계 삼각형 (정규화)
  const triangleVerts = new Float32Array([
  //   x      y
     0.0,  0.8,   // 위
    -0.7, -0.6,   // 좌하
     0.7, -0.6,   // 우하
  ]);

  const meshBuffer = device.createBuffer({
    size: triangleVerts.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(meshBuffer, 0, triangleVerts);

  // ── 인스턴스 데이터 ──────────────────────────────────────────
  // 각 인스턴스: [x, y, scale, angle, r, g, b] = 7 floats = 28 bytes
  const INST_STRIDE = 7 * 4;
  const instanceData = new Float32Array(NUM_INSTANCES * 7);
  for (let i = 0; i < NUM_INSTANCES; i++) {
    const off = i * 7;
    instanceData[off + 0] = (Math.random() - 0.5) * 1.9;  // x
    instanceData[off + 1] = (Math.random() - 0.5) * 1.9;  // y
    instanceData[off + 2] = 0.02 + Math.random() * 0.06;  // scale
    instanceData[off + 3] = Math.random() * Math.PI * 2;  // angle
    instanceData[off + 4] = 0.3 + Math.random() * 0.7;   // r
    instanceData[off + 5] = 0.3 + Math.random() * 0.7;   // g
    instanceData[off + 6] = 0.3 + Math.random() * 0.7;   // b
  }

  const instanceBuffer = device.createBuffer({
    size: instanceData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(instanceBuffer, 0, instanceData);

  // ── Uniform (시간) ────────────────────────────────────────────
  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── WGSL 셰이더 ─────────────────────────────────────────────
  //
  // 정점 셰이더는 두 가지 버퍼를 받는다:
  //   - @location(0) localPos — 메쉬 버퍼 (stepMode: 'vertex')
  //   - @location(1~4)        — 인스턴스 버퍼 (stepMode: 'instance')
  //
  const shaderCode = /* wgsl */`
    struct Uniforms { time: f32 };
    @group(0) @binding(0) var<uniform> u: Uniforms;

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) color: vec3f,
    };

    @vertex
    fn vs_main(
      @location(0) localPos:  vec2f,  // 메쉬 버퍼 (vertex step)
      @location(1) offset:    vec2f,  // 인스턴스 위치 (instance step)
      @location(2) scale:     f32,    // 크기
      @location(3) angle:     f32,    // 초기 회전각
      @location(4) color:     vec3f,  // 색상
      @builtin(instance_index) ii: u32,
    ) -> VertexOut {
      // 시간에 따라 각 인스턴스를 다른 속도로 회전
      let speed = 0.3 + f32(ii % 8) * 0.1;
      let a = angle + u.time * speed;
      let c = cos(a);
      let s = sin(a);

      // 2D 회전 + 스케일 적용
      let rotated = vec2f(
        localPos.x * c - localPos.y * s,
        localPos.x * s + localPos.y * c,
      ) * scale;

      var out: VertexOut;
      out.pos   = vec4f(offset + rotated, 0.0, 1.0);
      out.color = color;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      return vec4f(in.color, 0.85); // 약간 투명
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 파이프라인 ───────────────────────────────────────────────
  //
  // buffers[0]: 메쉬 버퍼, stepMode: 'vertex' (기본값) — 정점마다 전진
  // buffers[1]: 인스턴스 버퍼, stepMode: 'instance'  — 인스턴스마다 전진
  //
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [
        {
          // 메쉬 버퍼 (삼각형 정점, vertex step)
          arrayStride: 2 * 4,
          stepMode: 'vertex',
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' }, // localPos
          ],
        },
        {
          // 인스턴스 버퍼 (인스턴스별 데이터, instance step)
          arrayStride: INST_STRIDE,
          stepMode: 'instance',
          attributes: [
            { shaderLocation: 1, offset: 0,      format: 'float32x2' }, // offset
            { shaderLocation: 2, offset: 2 * 4,  format: 'float32' },   // scale
            { shaderLocation: 3, offset: 3 * 4,  format: 'float32' },   // angle
            { shaderLocation: 4, offset: 4 * 4,  format: 'float32x3' }, // color
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{
        format,
        blend: {
          // 알파 블렌딩 (반투명)
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one',       dstFactor: 'zero',                operation: 'add' },
        },
      }],
    },
    primitive: { topology: 'triangle-list' },
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
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
        clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, meshBuffer);     // slot 0 — 메쉬
    pass.setVertexBuffer(1, instanceBuffer); // slot 1 — 인스턴스
    // 3 정점/인스턴스 × NUM_INSTANCES 인스턴스 → 단 1번의 draw call!
    pass.draw(3, NUM_INSTANCES);
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
