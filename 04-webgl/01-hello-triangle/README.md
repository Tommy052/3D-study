# Hello Triangle — WebGL 첫 삼각형

WebGL의 "Hello World". 화면에 삼각형 하나를 그리는 전체 과정.

---

## 전체 코드 흐름

```typescript
// src/main.ts

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;

if (!gl) throw new Error('WebGL2 미지원');

// 1. 셰이더 소스
const vsSource = `
  attribute vec3 a_position;
  void main() {
    gl_Position = vec4(a_position, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0); // 주황색
  }
`;

// 2. 셰이더 컴파일 함수
function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`셰이더 컴파일 실패: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

// 3. 프로그램 생성 함수
function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`링크 실패: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

// 4. 셰이더 & 프로그램 생성
const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
const program = createProgram(gl, vs, fs);

// 5. 정점 데이터 (NDC 좌표 직접 사용)
const vertices = new Float32Array([
   0.0,  0.5,  0.0,  // 위
  -0.5, -0.5,  0.0,  // 좌하
   0.5, -0.5,  0.0,  // 우하
]);

// 6. VBO 생성 및 데이터 업로드
const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// 7. attribute 연결
const posLoc = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

// 8. 렌더
gl.clearColor(0.1, 0.1, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

---

## NDC 좌표 기억하기

```
화면 중앙 = (0, 0)
우상단   = (1, 1)
좌하단   = (-1, -1)
```

---

## 실행 방법

```bash
cp -r ../../_template .
npm install
npm run dev
```

---

## 다음 단계

→ [02. 버퍼 (VBO, EBO)](../02-buffer)
