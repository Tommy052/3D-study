// ============================================================
// 04. 텍스처 — 체커보드 텍스처를 입힌 회전 큐브
// ============================================================
// 학습 포인트:
//   1. 텍스처 생성 및 GPU 업로드
//   2. UV 좌표 (텍스처 매핑)
//   3. 필터링 (LINEAR) & 래핑 (REPEAT)
//   4. Mipmap 자동 생성
// ============================================================

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2를 지원하지 않는 브라우저입니다.');

// ── 셰이더 ──────────────────────────────────────────────────

const vsSource = /* glsl */ `#version 300 es
in vec3 a_position;
in vec2 a_uv;

out vec2 v_uv;

uniform mat4 u_mvp;

void main() {
  v_uv = a_uv;
  gl_Position = u_mvp * vec4(a_position, 1.0);
}`;

const fsSource = /* glsl */ `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_texture;

void main() {
  fragColor = texture(u_texture, v_uv);
}`;

// ── mat4 유틸 ────────────────────────────────────────────────

type Mat4 = Float32Array;
const mat4Mul = (a: Mat4, b: Mat4): Mat4 => {
  const m = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++)
        m[c*4+r] += a[k*4+r] * b[c*4+k];
  return m;
};
const mat4Identity = (): Mat4 => { const m = new Float32Array(16); m[0]=m[5]=m[10]=m[15]=1; return m; };
const mat4RotateY = (a: number): Mat4 => { const m=mat4Identity(),c=Math.cos(a),s=Math.sin(a); m[0]=c; m[2]=-s; m[8]=s; m[10]=c; return m; };
const mat4RotateX = (a: number): Mat4 => { const m=mat4Identity(),c=Math.cos(a),s=Math.sin(a); m[5]=c; m[6]=s; m[9]=-s; m[10]=c; return m; };
const mat4Perspective = (fov: number, asp: number, n: number, f: number): Mat4 => {
  const t=1/Math.tan(fov/2), m=new Float32Array(16);
  m[0]=t/asp; m[5]=t; m[10]=(f+n)/(n-f); m[11]=-1; m[14]=2*f*n/(n-f); return m;
};
const mat4LookAt = (eye: number[], at: number[], up: number[]): Mat4 => {
  const sub=(a:number[],b:number[])=>a.map((v,i)=>v-b[i]);
  const dot=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+v*b[i],0);
  const norm=(v:number[])=>{const l=Math.sqrt(dot(v,v));return v.map(x=>x/l);};
  const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const f=norm(sub(at,eye)), s=norm(cross(f,up)), u=cross(s,f);
  const m=new Float32Array(16);
  m[0]=s[0]; m[4]=s[1]; m[8]=s[2];  m[12]=-dot(s,eye);
  m[1]=u[0]; m[5]=u[1]; m[9]=u[2];  m[13]=-dot(u,eye);
  m[2]=-f[0];m[6]=-f[1];m[10]=-f[2];m[14]=dot(f,eye);
  m[15]=1; return m;
};

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

// ── 텍스처 생성 (체커보드 패턴) ──────────────────────────────
//
// 이미지 파일 없이 코드로 직접 픽셀 데이터 생성.
// 각 픽셀 = RGBA 4바이트

function createCheckerTexture(size: number, squares: number): WebGLTexture {
  const cellSize = size / squares;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = Math.floor(x / cellSize);
      const cy = Math.floor(y / cellSize);
      const isWhite = (cx + cy) % 2 === 0;

      const i = (y * size + x) * 4;
      data[i + 0] = isWhite ? 240 : 30;   // R
      data[i + 1] = isWhite ? 220 : 100;  // G
      data[i + 2] = isWhite ? 200 : 180;  // B
      data[i + 3] = 255;                   // A
    }
  }

  const tex = gl!.createTexture()!;
  gl!.bindTexture(gl!.TEXTURE_2D, tex);
  gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, size, size, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, data);
  gl!.generateMipmap(gl!.TEXTURE_2D);

  // 필터링: 선형 + Mipmap
  gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
  gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
  // 래핑: 반복
  gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.REPEAT);
  gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.REPEAT);

  return tex;
}

const texture = createCheckerTexture(256, 8);

// ── 큐브 정점 데이터 (24정점, UV 포함) ───────────────────────

function face(
  p0: number[], p1: number[], p2: number[], p3: number[],
): number[] {
  // UV: (0,0) → (1,0) → (1,1) → (0,1)
  return [
    ...p0, 0, 0,
    ...p1, 1, 0,
    ...p2, 1, 1,
    ...p3, 0, 1,
  ];
}

const H = 0.5;
const vertices = new Float32Array([
  ...face([-H,-H, H], [ H,-H, H], [ H, H, H], [-H, H, H]),  // 앞
  ...face([ H,-H,-H], [-H,-H,-H], [-H, H,-H], [ H, H,-H]),  // 뒤
  ...face([ H,-H, H], [ H,-H,-H], [ H, H,-H], [ H, H, H]),  // 오른
  ...face([-H,-H,-H], [-H,-H, H], [-H, H, H], [-H, H,-H]),  // 왼
  ...face([-H, H, H], [ H, H, H], [ H, H,-H], [-H, H,-H]),  // 위
  ...face([-H,-H,-H], [ H,-H,-H], [ H,-H, H], [-H,-H, H]),  // 아래
]);

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

const STRIDE = 5 * Float32Array.BYTES_PER_ELEMENT; // xyz + uv
const posLoc = gl.getAttribLocation(program, 'a_position');
const uvLoc  = gl.getAttribLocation(program, 'a_uv');

gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, STRIDE, 0);

gl.enableVertexAttribArray(uvLoc);
gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.bindVertexArray(null);

const mvpLoc = gl.getUniformLocation(program, 'u_mvp');
const texLoc = gl.getUniformLocation(program, 'u_texture');

// ── 렌더 루프 ────────────────────────────────────────────────

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.clearColor(0.1, 0.1, 0.2, 1.0);
gl.useProgram(program);
gl.bindVertexArray(vao);

// 텍스처 유닛 0에 바인딩
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.uniform1i(texLoc, 0);

function render(time: number) {
  const t = time * 0.001;

  gl!.viewport(0, 0, canvas.width, canvas.height);
  gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

  const model = mat4Mul(mat4RotateY(t * 0.7), mat4RotateX(t * 0.3));
  const view  = mat4LookAt([2, 1.5, 3], [0, 0, 0], [0, 1, 0]);
  const proj  = mat4Perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

  gl!.uniformMatrix4fv(mvpLoc, false, mat4Mul(proj, mat4Mul(view, model)));
  gl!.drawElements(gl!.TRIANGLES, 36, gl!.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

requestAnimationFrame(render);
