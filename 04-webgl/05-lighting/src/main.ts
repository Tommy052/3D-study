// ============================================================
// 05. 조명 — Phong 조명을 구현한 UV 구(Sphere)
// ============================================================
// 학습 포인트:
//   1. UV 구 메쉬 생성 (삼각형 분할)
//   2. 법선 벡터 (Normal) — 조명 계산의 핵심
//   3. Blinn-Phong 조명: Ambient + Diffuse + Specular
//   4. 월드 좌표에서의 조명 계산
//   5. 법선 행렬 (Normal Matrix) — 비균등 스케일 보정
// ============================================================

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2를 지원하지 않는 브라우저입니다.');

// ── 셰이더 ──────────────────────────────────────────────────

const vsSource = /* glsl */ `#version 300 es
in vec3 a_position;
in vec3 a_normal;

out vec3 v_worldPos;
out vec3 v_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_proj;
uniform mat3 u_normalMatrix;  // model 역전치행렬 (3x3)

void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  v_normal   = normalize(u_normalMatrix * a_normal);

  gl_Position = u_proj * u_view * worldPos;
}`;

const fsSource = /* glsl */ `#version 300 es
precision mediump float;

in vec3 v_worldPos;
in vec3 v_normal;

out vec4 fragColor;

uniform vec3 u_lightPos;    // 빛 위치 (월드)
uniform vec3 u_cameraPos;   // 카메라 위치 (월드)
uniform vec3 u_objectColor; // 물체 색상

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_lightPos - v_worldPos);   // 빛 방향
  vec3 V = normalize(u_cameraPos - v_worldPos);  // 시선 방향
  vec3 H = normalize(L + V);                     // 하프웨이 벡터 (Blinn-Phong)

  // Ambient: 전체적인 기본 밝기
  vec3 ambient = 0.1 * u_objectColor;

  // Diffuse: 빛이 표면에 닿는 각도에 비례
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = diff * u_objectColor;

  // Specular: 거울 반사 하이라이트 (Blinn-Phong)
  float spec = pow(max(dot(N, H), 0.0), 64.0);
  vec3 specular = 0.6 * spec * vec3(1.0);  // 흰색 하이라이트

  fragColor = vec4(ambient + diffuse + specular, 1.0);
}`;

// ── mat4 / mat3 유틸 ─────────────────────────────────────────

type Mat4 = Float32Array;
type Mat3 = Float32Array;

const mat4Mul = (a: Mat4, b: Mat4): Mat4 => {
  const m = new Float32Array(16);
  for (let c=0;c<4;c++) for (let r=0;r<4;r++) for (let k=0;k<4;k++) m[c*4+r]+=a[k*4+r]*b[c*4+k];
  return m;
};
const mat4Identity = (): Mat4 => { const m=new Float32Array(16); m[0]=m[5]=m[10]=m[15]=1; return m; };
const mat4RotateY = (a:number): Mat4 => { const m=mat4Identity(),c=Math.cos(a),s=Math.sin(a); m[0]=c;m[2]=-s;m[8]=s;m[10]=c; return m; };
const mat4Perspective = (fov:number,asp:number,n:number,f:number): Mat4 => {
  const t=1/Math.tan(fov/2),m=new Float32Array(16);
  m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f); return m;
};
const mat4LookAt = (eye:number[],at:number[],up:number[]): Mat4 => {
  const sub=(a:number[],b:number[])=>a.map((v,i)=>v-b[i]);
  const dot=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+v*b[i],0);
  const norm=(v:number[])=>{const l=Math.sqrt(dot(v,v));return v.map(x=>x/l);};
  const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const f=norm(sub(at,eye)),s=norm(cross(f,up)),u=cross(s,f);
  const m=new Float32Array(16);
  m[0]=s[0];m[4]=s[1];m[8]=s[2];m[12]=-dot(s,eye);
  m[1]=u[0];m[5]=u[1];m[9]=u[2];m[13]=-dot(u,eye);
  m[2]=-f[0];m[6]=-f[1];m[10]=-f[2];m[14]=dot(f,eye);
  m[15]=1; return m;
};

/** mat4의 좌상 3x3을 추출하여 mat3로 반환 (column-major) */
function mat4ToMat3(m: Mat4): Mat3 {
  return new Float32Array([
    m[0], m[1], m[2],
    m[4], m[5], m[6],
    m[8], m[9], m[10],
  ]);
}

/** 3x3 행렬의 역행렬 (column-major) */
function mat3Invert(m: Mat3): Mat3 {
  const [a,b,c, d,e,f, g,h,k] = m;
  const det = a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g);
  const inv = 1 / det;
  return new Float32Array([
    (e*k-f*h)*inv, (c*h-b*k)*inv, (b*f-c*e)*inv,
    (f*g-d*k)*inv, (a*k-c*g)*inv, (c*d-a*f)*inv,
    (d*h-e*g)*inv, (b*g-a*h)*inv, (a*e-b*d)*inv,
  ]);
}

/** 3x3 전치 */
function mat3Transpose(m: Mat3): Mat3 {
  return new Float32Array([
    m[0], m[3], m[6],
    m[1], m[4], m[7],
    m[2], m[5], m[8],
  ]);
}

// ── 셰이더 유틸 ─────────────────────────────────────────────

function createShader(type: number, src: string): WebGLShader {
  const s = gl!.createShader(type)!;
  gl!.shaderSource(s, src); gl!.compileShader(s);
  if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s)!);
  return s;
}
function createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = gl!.createProgram()!;
  gl!.attachShader(p, vs); gl!.attachShader(p, fs); gl!.linkProgram(p);
  if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(p)!);
  return p;
}

const program = createProgram(
  createShader(gl.VERTEX_SHADER, vsSource),
  createShader(gl.FRAGMENT_SHADER, fsSource),
);

// ── UV 구 메쉬 생성 ──────────────────────────────────────────
//
// latitude 분할(lat) × longitude 분할(lon)
// 각 정점: position(3) + normal(3) = 6 floats
// 구에서 단위 구의 법선 = 정점 위치 = (x, y, z)

function createSphere(radius: number, latSegs: number, lonSegs: number) {
  const verts: number[] = [];
  const idxs: number[] = [];

  for (let lat = 0; lat <= latSegs; lat++) {
    const theta = (lat / latSegs) * Math.PI;         // 0 ~ π (위 → 아래)
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let lon = 0; lon <= lonSegs; lon++) {
      const phi = (lon / lonSegs) * 2 * Math.PI;    // 0 ~ 2π
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      const x = cosP * sinT;
      const y = cosT;
      const z = sinP * sinT;

      verts.push(x * radius, y * radius, z * radius); // position
      verts.push(x, y, z);                             // normal (단위벡터)
    }
  }

  for (let lat = 0; lat < latSegs; lat++) {
    for (let lon = 0; lon < lonSegs; lon++) {
      const a = lat * (lonSegs + 1) + lon;
      const b = a + lonSegs + 1;
      idxs.push(a, b, a + 1);
      idxs.push(b, b + 1, a + 1);
    }
  }

  return {
    vertices: new Float32Array(verts),
    indices:  new Uint16Array(idxs),
    count:    idxs.length,
  };
}

const sphere = createSphere(1.0, 32, 32);

// ── VAO + VBO + EBO ──────────────────────────────────────────

const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);

const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

const ebo = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

const STRIDE = 6 * Float32Array.BYTES_PER_ELEMENT;
const posLoc = gl.getAttribLocation(program, 'a_position');
const norLoc = gl.getAttribLocation(program, 'a_normal');

gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, STRIDE, 0);

gl.enableVertexAttribArray(norLoc);
gl.vertexAttribPointer(norLoc, 3, gl.FLOAT, false, STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.bindVertexArray(null);

// ── Uniform 위치 ─────────────────────────────────────────────

const modelLoc        = gl.getUniformLocation(program, 'u_model');
const viewLoc         = gl.getUniformLocation(program, 'u_view');
const projLoc         = gl.getUniformLocation(program, 'u_proj');
const normalMatrixLoc = gl.getUniformLocation(program, 'u_normalMatrix');
const lightPosLoc     = gl.getUniformLocation(program, 'u_lightPos');
const cameraPosLoc    = gl.getUniformLocation(program, 'u_cameraPos');
const objectColorLoc  = gl.getUniformLocation(program, 'u_objectColor');

// ── 렌더 루프 ────────────────────────────────────────────────

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.clearColor(0.05, 0.05, 0.1, 1.0);
gl.useProgram(program);

// 물체 색상 (부드러운 주황빛)
gl.uniform3f(objectColorLoc, 0.9, 0.6, 0.3);

// 카메라 (고정)
const eye: [number, number, number] = [0, 0, 3];
const view = mat4LookAt([...eye], [0, 0, 0], [0, 1, 0]);
gl.uniformMatrix4fv(viewLoc, false, view);
gl.uniform3fv(cameraPosLoc, new Float32Array(eye));

function render(time: number) {
  const t = time * 0.001;

  gl!.viewport(0, 0, canvas.width, canvas.height);
  gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

  // 투영 (매 프레임 — 창 크기 변화 대응)
  const proj = mat4Perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
  gl!.uniformMatrix4fv(projLoc, false, proj);

  // 구 천천히 Y축 회전
  const model = mat4RotateY(t * 0.3);
  gl!.uniformMatrix4fv(modelLoc, false, model);

  // 법선 행렬 = model 역전치 (3x3)
  const normalMatrix = mat3Transpose(mat3Invert(mat4ToMat3(model)));
  gl!.uniformMatrix3fv(normalMatrixLoc, false, normalMatrix);

  // 빛이 구 주위를 공전
  const lightX = Math.cos(t) * 3;
  const lightY = 2;
  const lightZ = Math.sin(t) * 3;
  gl!.uniform3f(lightPosLoc, lightX, lightY, lightZ);

  gl!.bindVertexArray(vao);
  gl!.drawElements(gl!.TRIANGLES, sphere.count, gl!.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

requestAnimationFrame(render);
