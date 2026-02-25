// ============================================================
// 01. Hello Triangle — WebGL2 첫 삼각형
// ============================================================
// 학습 포인트:
//   1. WebGL 초기화 (canvas → context → shader → program)
//   2. 인터리브 VBO (position + color 하나의 버퍼에)
//   3. VAO로 attribute 설정 묶기
//   4. drawArrays로 삼각형 그리기
// ============================================================

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2를 지원하지 않는 브라우저입니다.');

// ── 셰이더 ──────────────────────────────────────────────────

const vsSource = /* glsl */ `#version 300 es
in vec3 a_position;  // 정점 위치 (NDC 직접 사용)
in vec3 a_color;     // 정점 색상

out vec3 v_color;    // 프래그먼트 셰이더로 전달

void main() {
  v_color = a_color;
  gl_Position = vec4(a_position, 1.0);
}`;

const fsSource = /* glsl */ `#version 300 es
precision mediump float;

in vec3 v_color;      // 정점 간 보간된 색상
out vec4 fragColor;

void main() {
  fragColor = vec4(v_color, 1.0);
}`;

// ── 셰이더 컴파일 & 프로그램 링크 ───────────────────────────

function createShader(type: number, source: string): WebGLShader {
  const shader = gl!.createShader(type)!;
  gl!.shaderSource(shader, source);
  gl!.compileShader(shader);
  if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
    throw new Error(`셰이더 컴파일 오류:\n${gl!.getShaderInfoLog(shader)}`);
  }
  return shader;
}

function createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const prog = gl!.createProgram()!;
  gl!.attachShader(prog, vs);
  gl!.attachShader(prog, fs);
  gl!.linkProgram(prog);
  if (!gl!.getProgramParameter(prog, gl!.LINK_STATUS)) {
    throw new Error(`프로그램 링크 오류:\n${gl!.getProgramInfoLog(prog)}`);
  }
  return prog;
}

const program = createProgram(
  createShader(gl.VERTEX_SHADER, vsSource),
  createShader(gl.FRAGMENT_SHADER, fsSource),
);

// ── 정점 데이터 ──────────────────────────────────────────────
//
// 인터리브 버퍼: [x, y, z, r, g, b] × 3개 정점
//
//          (0, 0.6)  ← 빨강
//           /     \
//   초록 ← /       \ → 파랑
//     (-0.6,-0.5)  (0.6,-0.5)

const vertices = new Float32Array([
//   x      y     z      r     g     b
   0.0,  0.6,  0.0,   1.0,  0.3,  0.3,  // 위  — 빨강
  -0.6, -0.5,  0.0,   0.3,  1.0,  0.3,  // 좌하 — 초록
   0.6, -0.5,  0.0,   0.3,  0.3,  1.0,  // 우하 — 파랑
]);

const STRIDE = 6 * Float32Array.BYTES_PER_ELEMENT; // 한 정점 = 6 float = 24 byte

// ── VAO + VBO ────────────────────────────────────────────────

const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);

const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(program, 'a_position');
const colLoc = gl.getAttribLocation(program, 'a_color');

gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, STRIDE, 0);                           // xyz

gl.enableVertexAttribArray(colLoc);
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT); // rgb

gl.bindVertexArray(null);

// ── 렌더 루프 ────────────────────────────────────────────────

gl.clearColor(0.1, 0.1, 0.2, 1.0);
gl.useProgram(program);
gl.bindVertexArray(vao);

function render() {
  gl!.viewport(0, 0, canvas.width, canvas.height);
  gl!.clear(gl!.COLOR_BUFFER_BIT);
  gl!.drawArrays(gl!.TRIANGLES, 0, 3); // 정점 3개 → 삼각형 1개
  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

render();
