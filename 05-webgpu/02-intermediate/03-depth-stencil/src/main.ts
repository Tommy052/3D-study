// ============================================================
// 03. Depth & Stencil — 깊이 버퍼로 3D 겹침 처리
// ============================================================
// 학습 포인트:
//   1. GPUTexture (depth24plus) — 깊이 버퍼 생성
//   2. depthStencil 파이프라인 설정 (depthCompare: 'less')
//   3. depthStencilAttachment — 렌더 패스에 연결
//   4. 두 큐브의 올바른 깊이 정렬 확인
// ============================================================

type Mat4 = Float32Array;
type Vec3 = [number, number, number];

function mat4Create(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}
function mat4Mul(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k*4+r] * b[c*4+k];
      out[c*4+r] = s;
    }
  return out;
}
function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0]=f/aspect; m[5]=f; m[10]=far*nf; m[11]=-1; m[14]=near*far*nf;
  return m;
}
function normalize(v: Vec3): Vec3 { const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2); return [v[0]/l,v[1]/l,v[2]/l]; }
function cross(a: Vec3, b: Vec3): Vec3 { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
function dot(a: Vec3, b: Vec3): number { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function mat4LookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const f=normalize([center[0]-eye[0],center[1]-eye[1],center[2]-eye[2]]);
  const r=normalize(cross(f,up)), u=cross(r,f);
  const m=new Float32Array(16);
  m[0]=r[0];m[4]=r[1];m[8]=r[2];m[12]=-dot(r,eye);
  m[1]=u[0];m[5]=u[1];m[9]=u[2];m[13]=-dot(u,eye);
  m[2]=-f[0];m[6]=-f[1];m[10]=-f[2];m[14]=dot(f,eye);
  m[15]=1;
  return m;
}
function mat4RotateY(a: number): Mat4 {
  const c=Math.cos(a),s=Math.sin(a),m=mat4Create();
  m[0]=c;m[8]=s;m[2]=-s;m[10]=c; return m;
}
function mat4Translate(tx: number, ty: number, tz: number): Mat4 {
  const m=mat4Create();
  m[12]=tx; m[13]=ty; m[14]=tz;
  return m;
}
function mat4Scale(sx: number, sy: number, sz: number): Mat4 {
  const m=mat4Create();
  m[0]=sx; m[5]=sy; m[10]=sz;
  return m;
}

// ── 큐브 메쉬 생성 함수 ──────────────────────────────────────
// position(xyz) + color(rgb) = 6 floats per vertex
function makeCubeVertices(r: number, g: number, b: number): Float32Array {
  const c = [r, g, b];
  const faces = [
    // 앞, 뒤, 왼, 오른, 위, 아래
    [[-0.5,-0.5,0.5],[0.5,-0.5,0.5],[0.5,0.5,0.5],[-0.5,0.5,0.5]],
    [[0.5,-0.5,-0.5],[-0.5,-0.5,-0.5],[-0.5,0.5,-0.5],[0.5,0.5,-0.5]],
    [[-0.5,-0.5,-0.5],[-0.5,-0.5,0.5],[-0.5,0.5,0.5],[-0.5,0.5,-0.5]],
    [[0.5,-0.5,0.5],[0.5,-0.5,-0.5],[0.5,0.5,-0.5],[0.5,0.5,0.5]],
    [[-0.5,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,-0.5],[-0.5,0.5,-0.5]],
    [[-0.5,-0.5,-0.5],[0.5,-0.5,-0.5],[0.5,-0.5,0.5],[-0.5,-0.5,0.5]],
  ];
  const data: number[] = [];
  for (const face of faces) {
    for (const v of face) {
      data.push(v[0], v[1], v[2], ...c);
    }
  }
  return new Float32Array(data);
}

const indices = new Uint16Array(
  Array.from({ length: 6 }, (_, i) => {
    const b = i * 4;
    return [b, b+1, b+2, b, b+2, b+3];
  }).flat()
);

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

  const STRIDE = 6 * 4;

  // ── 두 큐브 버퍼 ─────────────────────────────────────────
  // 큰 파란 큐브 (뒤), 작은 주황 큐브 (앞)
  const blueCubeVerts   = makeCubeVertices(0.3, 0.4, 1.0);
  const orangeCubeVerts = makeCubeVertices(1.0, 0.5, 0.1);

  function makeVertexBuffer(data: Float32Array): GPUBuffer {
    const buf = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(buf, 0, data);
    return buf;
  }

  const blueVB   = makeVertexBuffer(blueCubeVerts);
  const orangeVB = makeVertexBuffer(orangeCubeVerts);

  const indexBuffer = device.createBuffer({ size: indices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(indexBuffer, 0, indices);

  // MVP는 큐브마다 다르므로 별도 uniform buffer
  const makeUniformBuffer = () => device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const blueUB   = makeUniformBuffer();
  const orangeUB = makeUniformBuffer();

  // ── WGSL ────────────────────────────────────────────────
  const shaderCode = /* wgsl */`
    struct Uniforms { mvp: mat4x4f };
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
      out.pos   = u.mvp * vec4f(in.position, 1.0);
      out.color = in.color;
      return out;
    }

    @fragment
    fn fs_main(in: VertexOut) -> @location(0) vec4f {
      return vec4f(in.color, 1.0);
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // ── 파이프라인 (Depth Test 활성화) ───────────────────────
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [{
        arrayStride: STRIDE,
        attributes: [
          { shaderLocation: 0, offset: 0,     format: 'float32x3' },
          { shaderLocation: 1, offset: 3 * 4, format: 'float32x3' },
        ],
      }],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list', cullMode: 'back' },
    depthStencil: {
      format: 'depth24plus',
      depthWriteEnabled: true,
      depthCompare: 'less', // 더 가까운 것만 렌더 (깊이 테스트)
    },
  });

  // ── Bind Groups ──────────────────────────────────────────
  const makeBindGroup = (ub: GPUBuffer) => device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: ub } }],
  });
  const blueBG   = makeBindGroup(blueUB);
  const orangeBG = makeBindGroup(orangeUB);

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

    const aspect = canvas.width / canvas.height;
    const proj = mat4Perspective(Math.PI / 4, aspect, 0.1, 100);
    const view = mat4LookAt([0, 2, 5], [0, 0, 0], [0, 1, 0]);

    // 파란 큐브: 뒤쪽(z=-0.5), 크게
    const blueModel = mat4Mul(mat4Translate(0, 0, -0.5), mat4Mul(mat4RotateY(time * 0.5), mat4Scale(1.4, 1.4, 1.4)));
    device.queue.writeBuffer(blueUB, 0, mat4Mul(proj, mat4Mul(view, blueModel)));

    // 주황 큐브: 앞쪽(z=+0.5), 작게
    const orangeModel = mat4Mul(mat4Translate(0, 0, 0.5), mat4RotateY(-time));
    device.queue.writeBuffer(orangeUB, 0, mat4Mul(proj, mat4Mul(view, orangeModel)));

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.08, g: 0.08, b: 0.15, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,  // 깊이 버퍼를 1.0 (최대 깊이) 으로 초기화
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    pass.setPipeline(pipeline);
    pass.setIndexBuffer(indexBuffer, 'uint16');

    // 파란 큐브 먼저 그려도 깊이 테스트가 순서에 관계없이 처리
    pass.setBindGroup(0, blueBG);
    pass.setVertexBuffer(0, blueVB);
    pass.drawIndexed(36);

    // 주황 큐브
    pass.setBindGroup(0, orangeBG);
    pass.setVertexBuffer(0, orangeVB);
    pass.drawIndexed(36);

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
