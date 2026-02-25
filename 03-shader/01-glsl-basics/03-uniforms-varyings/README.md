# Uniform, Varying, Attribute

CPU(JavaScript)와 GPU(GLSL) 사이에서 데이터를 주고받는 방법.

---

## 관련 강의

| | |
|---|---|
| [![Kishimisu — Shader Art Coding](https://img.youtube.com/vi/f4s1h2YETNY/mqdefault.jpg)](https://www.youtube.com/watch?v=f4s1h2YETNY) | [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) |
| **Kishimisu** — uniform으로 시간·마우스 값 전달하는 실습 패턴 | **CMU 15-462** — GPU 데이터 흐름과 셰이더 인터페이스 |

> **참고**: [WebGL2 Fundamentals — How It Works](https://webgl2fundamentals.org/webgl/lessons/webgl-how-it-works.html)

---

## 변수 종류

| 한정자 | 방향 | 업데이트 | 설명 |
|--------|------|---------|------|
| `attribute` | CPU → VS | 정점마다 | 각 정점의 고유 데이터 |
| `uniform` | CPU → 셰이더 | Draw Call마다 | 모든 정점/픽셀에 동일 |
| `varying` | VS → FS | 보간됨 | 정점 → 픽셀로 전달 |

---

## Attribute — 정점별 데이터

```javascript
// CPU에서 VBO에 데이터 올리기
const vertices = new Float32Array([
//  x      y     z     u    v    nx   ny   nz
   0.0,  0.5,  0.0,  0.5, 1.0, 0.0, 0.0, 1.0,
  -0.5, -0.5,  0.0,  0.0, 0.0, 0.0, 0.0, 1.0,
   0.5, -0.5,  0.0,  1.0, 0.0, 0.0, 0.0, 1.0,
]);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// attribute 위치 가져오기
const posLoc = gl.getAttribLocation(program, 'a_position');
const uvLoc  = gl.getAttribLocation(program, 'a_uv');

// attribute 활성화 및 포인터 설정
const stride = 8 * 4; // 8개 float, 각 4바이트
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0);      // xyz
gl.enableVertexAttribArray(uvLoc);
gl.vertexAttribPointer(uvLoc,  2, gl.FLOAT, false, stride, 3 * 4);  // uv
```

---

## Uniform — 공통 데이터

```javascript
// MVP 행렬 전달
const mvpLoc = gl.getUniformLocation(program, 'u_mvp');
gl.uniformMatrix4fv(mvpLoc, false, mvpMatrix);

// 벡터 전달
const lightLoc = gl.getUniformLocation(program, 'u_lightPos');
gl.uniform3f(lightLoc, 0.0, 5.0, 5.0);

// 스칼라 전달
const timeLoc = gl.getUniformLocation(program, 'u_time');
gl.uniform1f(timeLoc, performance.now() / 1000);

// 텍스처 전달
const texLoc = gl.getUniformLocation(program, 'u_texture');
gl.uniform1i(texLoc, 0); // 텍스처 유닛 0
```

```glsl
// 셰이더에서
uniform mat4 u_mvp;
uniform vec3 u_lightPos;
uniform float u_time;
uniform sampler2D u_texture;
```

---

## Varying — 정점 → 픽셀 보간

```glsl
// 버텍스 셰이더
attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec3 a_color;

varying vec2 v_uv;
varying vec3 v_color;

void main() {
  v_uv = a_uv;
  v_color = a_color;
  gl_Position = vec4(a_position, 1.0);
}

// -------------------------------------------

// 프래그먼트 셰이더
precision mediump float;

varying vec2 v_uv;
varying vec3 v_color;

void main() {
  // 정점 A의 v_color = (1,0,0) 빨강
  // 정점 B의 v_color = (0,0,1) 파랑
  // 중간 픽셀: 자동으로 보간됨 → 보라색 그라디언트
  gl_FragColor = vec4(v_color, 1.0);
}
```

---

## WebGL 2.0 스타일 (in/out)

```glsl
// 버텍스 셰이더 (WebGL 2.0)
#version 300 es

in vec3 a_position;  // attribute 대신 in
in vec2 a_uv;

out vec2 v_uv;       // varying 대신 out

void main() { ... }

// 프래그먼트 셰이더 (WebGL 2.0)
#version 300 es
precision mediump float;

in vec2 v_uv;         // varying 대신 in
out vec4 fragColor;   // gl_FragColor 대신 out 변수

void main() {
  fragColor = vec4(1.0);
}
```

---

## 다음 단계

→ [WGSL 기초](../../02-wgsl-basics/01-syntax)
