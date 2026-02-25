// ============================================================
// 03. MVP 행렬 — 회전하는 3D 큐브
// ============================================================
// 학습 포인트:
//   1. Model(회전) × View(카메라) × Projection(원근) 행렬
//   2. 깊이 테스트 (Depth Test) — 앞뒤 순서
//   3. 후면 제거 (Backface Culling)
//   4. 인라인 mat4 구현 (gl-matrix 없이 이해)
// ============================================================

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2를 지원하지 않는 브라우저입니다.');

// ── 셰이더 ──────────────────────────────────────────────────

const vsSource = /* glsl */ `#version 300 es
in vec3 a_position;
in vec3 a_color;

out vec3 v_color;

uniform mat4 u_mvp;  // Model × View × Projection

void main() {
  v_color = a_color;
  gl_Position = u_mvp * vec4(a_position, 1.0);
}`;

const fsSource = /* glsl */ `#version 300 es
precision mediump float;

in vec3 v_color;
out vec4 fragColor;

void main() {
  fragColor = vec4(v_color, 1.0);
}`;

// ── mat4 유틸 (column-major, WebGL 표준) ─────────────────────

type Mat4 = Float32Array;

/** 단위 행렬 */
function mat4Identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** 행렬 곱: C = A × B (column-major) */
function mat4Mul(a: Mat4, b: Mat4): Mat4 {
  const m = new Float32Array(16);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++)
      for (let k = 0; k < 4; k++)
        m[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
  return m;
}

/** 원근 투영 행렬 */
function mat4Perspective(fovRad: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovRad / 2);
  const m = new Float32Array(16);
  m[0]  = f / aspect;
  m[5]  = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

/** LookAt 뷰 행렬 */
function mat4LookAt(
  eye: [number, number, number],
  center: [number, number, number],
  up: [number, number, number],
): Mat4 {
  const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]);
  const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
  const norm = (v: number[]) => { const l = Math.sqrt(dot(v, v)); return v.map(x => x / l); };
  const cross = (a: number[], b: number[]) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];

  const f = norm(sub([...center], [...eye]));
  const s = norm(cross(f, [...up]));
  const u = cross(s, f);

  const m = new Float32Array(16);
  m[0] = s[0];  m[4] = s[1];  m[8]  = s[2];  m[12] = -dot(s, [...eye]);
  m[1] = u[0];  m[5] = u[1];  m[9]  = u[2];  m[13] = -dot(u, [...eye]);
  m[2] = -f[0]; m[6] = -f[1]; m[10] = -f[2]; m[14] =  dot(f, [...eye]);
  m[15] = 1;
  return m;
}

/** Y축 회전 행렬 */
function mat4RotateY(angle: number): Mat4 {
  const c = Math.cos(angle), s = Math.sin(angle);
  const m = mat4Identity();
  m[0] = c;  m[8]  = s;
  m[2] = -s; m[10] = c;
  return m;
}

/** X축 회전 행렬 */
function mat4RotateX(angle: number): Mat4 {
  const c = Math.cos(angle), s = Math.sin(angle);
  const m = mat4Identity();
  m[5] = c;  m[9]  = -s;
  m[6] = s;  m[10] = c;
  return m;
}

// ── 셰이더 유틸 ─────────────────────────────────────────────

function createShader(type: number, src: string): WebGLShader {
  const s = gl!.createShader(type)!;
  gl!.shaderSource(s, src);
  gl!.compileShader(s);
  if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
    throw new Error(gl!.getShaderInfoLog(s)!);
  return s;
}

function createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = gl!.createProgram()!;
  gl!.attachShader(p, vs);
  gl!.attachShader(p, fs);
  gl!.linkProgram(p);
  if (!gl!.getProgramParameter(p, gl!.LINK_STATUS))
    throw new Error(gl!.getProgramInfoLog(p)!);
  return p;
}

const program = createProgram(
  createShader(gl.VERTEX_SHADER, vsSource),
  createShader(gl.FRAGMENT_SHADER, fsSource),
);

// ── 큐브 정점 데이터 (24정점 — 면마다 4개, 총 6면) ───────────
//
// 면마다 고유 색상:
//   앞 빨강 / 뒤 청록 / 우 초록 / 좌 자홍 / 위 파랑 / 아래 노랑

function face(
  p0: number[], p1: number[], p2: number[], p3: number[],
  r: number, g: number, b: number,
): number[] {
  return [
    ...p0, r, g, b,
    ...p1, r, g, b,
    ...p2, r, g, b,
    ...p3, r, g, b,
  ];
}

const H = 0.5;
const vertices = new Float32Array([
  // 앞면 (z+)  빨강
  ...face([-H,-H, H], [ H,-H, H], [ H, H, H], [-H, H, H], 1.0, 0.3, 0.3),
  // 뒷면 (z-)  청록
  ...face([ H,-H,-H], [-H,-H,-H], [-H, H,-H], [ H, H,-H], 0.3, 1.0, 1.0),
  // 오른면 (x+)  초록
  ...face([ H,-H, H], [ H,-H,-H], [ H, H,-H], [ H, H, H], 0.3, 1.0, 0.3),
  // 왼면 (x-)  자홍
  ...face([-H,-H,-H], [-H,-H, H], [-H, H, H], [-H, H,-H], 1.0, 0.3, 1.0),
  // 윗면 (y+)  파랑
  ...face([-H, H, H], [ H, H, H], [ H, H,-H], [-H, H,-H], 0.3, 0.3, 1.0),
  // 아랫면 (y-)  노랑
  ...face([-H,-H,-H], [ H,-H,-H], [ H,-H, H], [-H,-H, H], 1.0, 1.0, 0.3),
]);

// 각 면의 2개 삼각형 인덱스 패턴: 0,1,2, 0,2,3
const indices = new Uint16Array(
  Array.from({ length: 6 }, (_, f) => {
    const b = f * 4;
    return [b, b+1, b+2, b, b+2, b+3];
  }).flat(),
);

// ── VAO + VBO + EBO ──────────────────────────────────────────

const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);

const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const ebo = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const STRIDE = 6 * Float32Array.BYTES_PER_ELEMENT;
const posLoc = gl.getAttribLocation(program, 'a_position');
const colLoc = gl.getAttribLocation(program, 'a_color');

gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, STRIDE, 0);

gl.enableVertexAttribArray(colLoc);
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.bindVertexArray(null);

const mvpLoc = gl.getUniformLocation(program, 'u_mvp');

// ── WebGL 상태 설정 ──────────────────────────────────────────

gl.enable(gl.DEPTH_TEST);     // 깊이 테스트: 앞에 있는 것이 뒤를 가림
gl.enable(gl.CULL_FACE);      // 후면 제거: 보이지 않는 뒷면 스킵
gl.clearColor(0.1, 0.1, 0.2, 1.0);
gl.useProgram(program);
gl.bindVertexArray(vao);

// ── 렌더 루프 ────────────────────────────────────────────────

function render(time: number) {
  const t = time * 0.001;

  gl!.viewport(0, 0, canvas.width, canvas.height);
  gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

  // Model: Y축 + X축 회전
  const model = mat4Mul(mat4RotateY(t), mat4RotateX(t * 0.4));

  // View: 카메라를 (2, 1.5, 3) 위치에서 원점을 바라봄
  const view = mat4LookAt([2, 1.5, 3], [0, 0, 0], [0, 1, 0]);

  // Projection: FOV 45°, Near 0.1, Far 100
  const proj = mat4Perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

  // MVP = Projection × View × Model
  const mvp = mat4Mul(proj, mat4Mul(view, model));

  gl!.uniformMatrix4fv(mvpLoc, false, mvp);
  gl!.drawElements(gl!.TRIANGLES, 36, gl!.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

requestAnimationFrame(render);
