// ============================================================
// 01. Uniform Buffer — MVP 행렬 전달 (3D 큐브 회전)
// ============================================================
// 학습 포인트:
//   1. Uniform Buffer로 mat4×4 (MVP 행렬, 64 bytes) 전달
//   2. Index Buffer (EBO) — 큐브 36개 인덱스
//   3. 인라인 mat4 연산 (열 우선, 의존성 없음)
//   4. BindGroup + BindGroupLayout
// ============================================================

// ── 인라인 mat4 유틸리티 ─────────────────────────────────────
// WebGPU / WGSL은 열 우선(column-major) mat4를 사용한다
// m[col * 4 + row] 인덱싱

type Mat4 = Float32Array;
type Vec3 = [number, number, number];

function mat4Create(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1; // identity
  return m;
}

function mat4Mul(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

// WebGPU depth range: 0 ~ 1 (Vulkan 스타일, WebGL의 -1~1과 다름)
function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0]  = f / aspect;
  m[5]  = f;
  m[10] = far * nf;
  m[11] = -1;
  m[14] = near * far * nf;
  return m;
}

function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  return [v[0] / len, v[1] / len, v[2] / len];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function dot(a: Vec3, b: Vec3): number { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }

function mat4LookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const f = normalize([center[0]-eye[0], center[1]-eye[1], center[2]-eye[2]]);
  const r = normalize(cross(f, up));
  const u = cross(r, f);
  const m = new Float32Array(16);
  m[0]=r[0]; m[4]=r[1]; m[8] =r[2];  m[12]=-dot(r,eye);
  m[1]=u[0]; m[5]=u[1]; m[9] =u[2];  m[13]=-dot(u,eye);
  m[2]=-f[0];m[6]=-f[1];m[10]=-f[2]; m[14]= dot(f,eye);
  m[15]=1;
  return m;
}

function mat4RotateY(a: number): Mat4 {
  const c=Math.cos(a), s=Math.sin(a), m=mat4Create();
  m[0]=c; m[8]=s; m[2]=-s; m[10]=c;
  return m;
}

function mat4RotateX(a: number): Mat4 {
  const c=Math.cos(a), s=Math.sin(a), m=mat4Create();
  m[5]=c; m[6]=s; m[9]=-s; m[10]=c;
  return m;
}

// ── 큐브 메쉬 ────────────────────────────────────────────────
//
// 6면 × 4정점 = 24정점. 각 면마다 고유한 색.
// 각 정점: position(xyz) + color(rgb) = 6 floats = 24 bytes
//
//  면    색
//  앞    빨강
//  뒤    시안
//  왼    초록
//  오른  마젠타
//  위    파랑
//  아래  노랑

const vertices = new Float32Array([
//   x      y      z      r     g     b
  // 앞면 (z = +0.5) — 빨강
  -0.5, -0.5,  0.5,   1.0, 0.3, 0.3,
   0.5, -0.5,  0.5,   1.0, 0.3, 0.3,
   0.5,  0.5,  0.5,   1.0, 0.3, 0.3,
  -0.5,  0.5,  0.5,   1.0, 0.3, 0.3,
  // 뒷면 (z = -0.5) — 시안
   0.5, -0.5, -0.5,   0.3, 1.0, 1.0,
  -0.5, -0.5, -0.5,   0.3, 1.0, 1.0,
  -0.5,  0.5, -0.5,   0.3, 1.0, 1.0,
   0.5,  0.5, -0.5,   0.3, 1.0, 1.0,
  // 왼면 (x = -0.5) — 초록
  -0.5, -0.5, -0.5,   0.3, 1.0, 0.3,
  -0.5, -0.5,  0.5,   0.3, 1.0, 0.3,
  -0.5,  0.5,  0.5,   0.3, 1.0, 0.3,
  -0.5,  0.5, -0.5,   0.3, 1.0, 0.3,
  // 오른면 (x = +0.5) — 마젠타
   0.5, -0.5,  0.5,   1.0, 0.3, 1.0,
   0.5, -0.5, -0.5,   1.0, 0.3, 1.0,
   0.5,  0.5, -0.5,   1.0, 0.3, 1.0,
   0.5,  0.5,  0.5,   1.0, 0.3, 1.0,
  // 윗면 (y = +0.5) — 파랑
  -0.5,  0.5,  0.5,   0.3, 0.3, 1.0,
   0.5,  0.5,  0.5,   0.3, 0.3, 1.0,
   0.5,  0.5, -0.5,   0.3, 0.3, 1.0,
  -0.5,  0.5, -0.5,   0.3, 0.3, 1.0,
  // 아랫면 (y = -0.5) — 노랑
  -0.5, -0.5, -0.5,   1.0, 1.0, 0.3,
   0.5, -0.5, -0.5,   1.0, 1.0, 0.3,
   0.5, -0.5,  0.5,   1.0, 1.0, 0.3,
  -0.5, -0.5,  0.5,   1.0, 1.0, 0.3,
]);

// 6면 × 6인덱스 = 36인덱스 (면당 삼각형 2개)
const indexData: number[] = [];
for (let i = 0; i < 6; i++) {
  const b = i * 4;
  indexData.push(b, b+1, b+2, b, b+2, b+3);
}
const indices = new Uint16Array(indexData);

// ── 메인 ────────────────────────────────────────────────────

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

  // ── GPU 버퍼 ─────────────────────────────────────────────
  const STRIDE = 6 * 4; // 6 floats × 4 bytes

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(indexBuffer, 0, indices);

  // MVP 행렬 = 4×4 float32 = 64 bytes
  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── WGSL 셰이더 ─────────────────────────────────────────
  const shaderCode = /* wgsl */`
    struct Uniforms {
      mvp: mat4x4f,
    };

    @group(0) @binding(0) var<uniform> u: Uniforms;

    struct VertexIn {
      @location(0) position: vec3f,
      @location(1) color: vec3f,
    };

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) color: vec3f,
    };

    @vertex
    fn vs_main(in: VertexIn) -> VertexOut {
      var out: VertexOut;
      out.pos = u.mvp * vec4f(in.position, 1.0); // MVP 변환
      out.color = in.color;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      return vec4f(in.color, 1.0);
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 파이프라인 ───────────────────────────────────────────
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: STRIDE,
        attributes: [
          { shaderLocation: 0, offset: 0,     format: 'float32x3' }, // position
          { shaderLocation: 1, offset: 3 * 4, format: 'float32x3' }, // color
        ],
      }],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back', // 뒷면 컬링
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  // ── Bind Group ───────────────────────────────────────────
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  // ── Depth Texture ─────────────────────────────────────────
  let depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  // ── 렌더 루프 ────────────────────────────────────────────
  let time = 0;

  function render() {
    time += 0.016;

    // MVP 행렬 계산
    const aspect = canvas.width / canvas.height;
    const proj  = mat4Perspective(Math.PI / 4, aspect, 0.1, 100);
    const view  = mat4LookAt([0, 1.5, 4], [0, 0, 0], [0, 1, 0]);
    const model = mat4Mul(mat4RotateY(time), mat4RotateX(time * 0.5));
    const mvp   = mat4Mul(proj, mat4Mul(view, model));

    device.queue.writeBuffer(uniformBuffer, 0, mvp);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setIndexBuffer(indexBuffer, 'uint16');
    pass.drawIndexed(36); // 36 인덱스 → 삼각형 12개 → 큐브 6면
    pass.end();

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    depthTexture.destroy();
    depthTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  });

  render();
}

main().catch(console.error);
