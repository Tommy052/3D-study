// ============================================================
// 04. Compute Shader — GPU 파티클 시뮬레이션
// ============================================================
// 학습 포인트:
//   1. createComputePipeline() — compute 전용 파이프라인
//   2. var<storage, read_write> — 컴퓨트에서 읽고 쓰는 버퍼
//   3. @compute @workgroup_size(64) — GPU 병렬 실행 단위
//   4. encoder.beginComputePass() — 같은 커맨드 버퍼에 compute + render
//   5. 같은 GPUBuffer를 STORAGE + VERTEX 로 두 패스에서 재사용
// ============================================================

const NUM_PARTICLES = 1024;

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

  // ── 파티클 초기 데이터 ────────────────────────────────────
  // 각 파티클: [x, y, vx, vy] = 4 × f32 = 16 bytes
  const initialData = new Float32Array(NUM_PARTICLES * 4);
  for (let i = 0; i < NUM_PARTICLES; i++) {
    initialData[i * 4 + 0] = (Math.random() - 0.5) * 1.8; // x
    initialData[i * 4 + 1] = (Math.random() - 0.5) * 1.8; // y
    initialData[i * 4 + 2] = (Math.random() - 0.5) * 0.01; // vx
    initialData[i * 4 + 3] = (Math.random() - 0.5) * 0.01; // vy
  }

  // ── 파티클 버퍼 ──────────────────────────────────────────────
  //
  // STORAGE  — 컴퓨트 셰이더에서 read_write
  // VERTEX   — 렌더 셰이더에서 instance 데이터로 사용
  // COPY_DST — 초기 데이터 업로드
  //
  const particleBuffer = device.createBuffer({
    size: initialData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(particleBuffer, 0, initialData);

  // ── 컴퓨트 셰이더 ────────────────────────────────────────────
  //
  // @workgroup_size(64): 워크그룹당 64 스레드 병렬 실행
  // dispatchWorkgroups(N/64): N개 파티클을 64개씩 묶어 처리
  // read_write: 읽고 쓰기 모두 가능
  //
  const computeShaderCode = /* wgsl */`
    struct Particle {
      pos: vec2f,
      vel: vec2f,
    };

    @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;

    @compute @workgroup_size(64)
    fn cs_main(@builtin(global_invocation_id) gid: vec3u) {
      let idx = gid.x;
      if (idx >= arrayLength(&particles)) { return; }

      var p = particles[idx];

      // 위치 갱신
      p.pos = p.pos + p.vel;

      // 벽 반사 ([-1, 1] 범위 밖이면 속도 반전)
      if (p.pos.x < -1.0 || p.pos.x > 1.0) { p.vel.x = -p.vel.x; }
      if (p.pos.y < -1.0 || p.pos.y > 1.0) { p.vel.y = -p.vel.y; }

      particles[idx] = p;
    }
  `;

  // ── 렌더 셰이더 ──────────────────────────────────────────────
  //
  // @builtin(instance_index): 현재 파티클 인덱스
  // storage 버퍼를 read-only로 읽어 파티클 위치를 가져옴
  // 각 파티클을 작은 사각형(6정점)으로 그린다
  //
  const renderShaderCode = /* wgsl */`
    struct Particle {
      pos: vec2f,
      vel: vec2f,
    };

    @group(0) @binding(0) var<storage, read> particles: array<Particle>;

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) speed: f32,
    };

    @vertex
    fn vs_main(
      @builtin(vertex_index)   vi: u32,
      @builtin(instance_index) ii: u32,
    ) -> VertexOut {
      // 파티클 하나당 작은 사각형 (2 삼각형 = 6 정점)
      var offsets = array<vec2f, 6>(
        vec2f(-0.006, -0.006), vec2f(0.006, -0.006), vec2f(-0.006, 0.006),
        vec2f(-0.006,  0.006), vec2f(0.006, -0.006), vec2f( 0.006, 0.006),
      );
      let p = particles[ii];
      let speed = length(p.vel);
      var out: VertexOut;
      out.pos   = vec4f(p.pos + offsets[vi], 0.0, 1.0);
      out.speed = speed;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      // 속도에 따라 색상 변화: 느리면 파랑, 빠르면 흰색-노랑
      let t = clamp(in.speed / 0.015, 0.0, 1.0);
      let r = t;
      let g = 0.6 + t * 0.4;
      let b = 1.0 - t * 0.5;
      return vec4f(r, g, b, 1.0);
    }
  `;

  // ── 파이프라인 생성 ──────────────────────────────────────────
  const computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({ code: computeShaderCode }),
      entryPoint: 'cs_main',
    },
  });

  const renderPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({ code: renderShaderCode }),
      entryPoint: 'vs_main',
    },
    fragment: {
      module: device.createShaderModule({ code: renderShaderCode }),
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  // ── Bind Groups ──────────────────────────────────────────────
  // 같은 particleBuffer를 두 파이프라인에서 다른 방식으로 사용
  const computeBindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: particleBuffer } }],
  });

  const renderBindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: particleBuffer } }],
  });

  // ── 렌더 루프 ────────────────────────────────────────────────
  // 하나의 CommandEncoder에 컴퓨트 패스 → 렌더 패스 순서로 인코딩
  function render() {
    const encoder = device.createCommandEncoder();

    // 1. 컴퓨트 패스 — 파티클 위치 갱신
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, computeBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(NUM_PARTICLES / 64));
    computePass.end();

    // 2. 렌더 패스 — 갱신된 파티클 그리기
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, renderBindGroup);
    renderPass.draw(6, NUM_PARTICLES); // 6 vertices/instance × NUM_PARTICLES instances
    renderPass.end();

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
