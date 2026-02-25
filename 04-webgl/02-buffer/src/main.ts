// ============================================================
// 02. 버퍼 (VBO, EBO, VAO) — 회전하는 컬러 사각형
// ============================================================
// 학습 포인트:
//   1. EBO(Index Buffer)로 정점 재사용 (6개 → 4개)
//   2. VAO에 VBO + EBO 설정을 묶어 재사용
//   3. drawElements vs drawArrays
//   4. uniform으로 CPU → GPU 값 전달 (회전 각도)
// ============================================================

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2를 지원하지 않는 브라우저입니다.');

// ── 셰이더 ──────────────────────────────────────────────────

const vsSource = /* glsl */ `#version 300 es
in vec2 a_position;
in vec3 a_color;

out vec3 v_color;

uniform float u_angle;   // 회전 각도 (라디안)
uniform float u_aspect;  // 화면 종횡비 보정

void main() {
  float c = cos(u_angle);
  float s = sin(u_angle);

  // 2D 회전 행렬 적용
  vec2 rotated = vec2(
    c * a_position.x - s * a_position.y,
    s * a_position.x + c * a_position.y
  );

  // 종횡비 보정 (X축 압축)
  rotated.x /= u_aspect;

  v_color = a_color;
  gl_Position = vec4(rotated, 0.0, 1.0);
}`;

const fsSource = /* glsl */ `#version 300 es
precision mediump float;

in vec3 v_color;
out vec4 fragColor;

void main() {
  fragColor = vec4(v_color, 1.0);
}`;

// ── 유틸 ────────────────────────────────────────────────────

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

// ── 정점 데이터 ──────────────────────────────────────────────
//
//  0 ────── 1      각 꼭짓점은 고유한 색상을 가짐
//  │  \     │      보간으로 내부가 그라디언트가 됨
//  │    \   │
//  3 ────── 2
//
//  인덱스: [0,3,2] + [0,2,1]  → 삼각형 2개로 사각형 구성

const vertices = new Float32Array([
//   x      y      r     g     b
  -0.5,  0.5,   1.0,  0.2,  0.2,  // 0 좌상 — 빨강
   0.5,  0.5,   0.2,  1.0,  0.2,  // 1 우상 — 초록
   0.5, -0.5,   0.2,  0.2,  1.0,  // 2 우하 — 파랑
  -0.5, -0.5,   1.0,  1.0,  0.2,  // 3 좌하 — 노랑
]);

// 정점 4개로 삼각형 2개 (6 indices)
const indices = new Uint16Array([
  0, 3, 2,  // 삼각형 1
  0, 2, 1,  // 삼각형 2
]);

// ── VAO + VBO + EBO ──────────────────────────────────────────

const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);

// VBO
const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// EBO (VAO에 바인딩된 상태에서 설정해야 VAO가 기억함)
const ebo = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const STRIDE = 5 * Float32Array.BYTES_PER_ELEMENT;
const posLoc = gl.getAttribLocation(program, 'a_position');
const colLoc = gl.getAttribLocation(program, 'a_color');

gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, STRIDE, 0);

gl.enableVertexAttribArray(colLoc);
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, STRIDE, 2 * Float32Array.BYTES_PER_ELEMENT);

gl.bindVertexArray(null);

// ── Uniform 위치 ─────────────────────────────────────────────

const angleLoc  = gl.getUniformLocation(program, 'u_angle');
const aspectLoc = gl.getUniformLocation(program, 'u_aspect');

// ── 렌더 루프 ────────────────────────────────────────────────

gl.clearColor(0.1, 0.1, 0.2, 1.0);
gl.useProgram(program);
gl.bindVertexArray(vao);

function render(time: number) {
  gl!.viewport(0, 0, canvas.width, canvas.height);
  gl!.clear(gl!.COLOR_BUFFER_BIT);

  gl!.uniform1f(angleLoc,  time * 0.001);                          // 회전 각도
  gl!.uniform1f(aspectLoc, canvas.width / canvas.height);          // 종횡비

  // drawElements: EBO의 인덱스를 사용해 정점을 재사용
  gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

requestAnimationFrame(render);
