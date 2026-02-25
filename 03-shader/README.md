# 03. 셰이더 (Shader)

셰이더는 GPU에서 실행되는 프로그램이다.
각 정점(Vertex)과 픽셀(Fragment)의 색상·위치를 직접 제어할 수 있다.

---

## 추천 강의

| | |
|---|---|
| [![Kishimisu — Shader Art Coding](https://img.youtube.com/vi/f4s1h2YETNY/mqdefault.jpg)](https://www.youtube.com/watch?v=f4s1h2YETNY) | [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) |
| **Kishimisu** — GLSL 셰이더 아트 코딩 입문 | **CMU 15-462** — 컴퓨터 그래픽스 전체 커리큘럼 |

> **추천 순서**: Kishimisu 영상으로 GLSL 감각을 익힌 뒤, 직접 Shadertoy에서 실험하며 CMU 강의로 이론을 보완한다.

---

## 목차

### GLSL — WebGL 셰이더 언어
| # | 주제 |
|---|------|
| [01](./01-glsl-basics/01-vertex-shader) | 버텍스 셰이더 |
| [02](./01-glsl-basics/02-fragment-shader) | 프래그먼트 셰이더 |
| [03](./01-glsl-basics/03-uniforms-varyings) | Uniform, Varying, Attribute |

### WGSL — WebGPU 셰이더 언어
| # | 주제 |
|---|------|
| [01](./02-wgsl-basics/01-syntax) | 기본 문법 |
| [02](./02-wgsl-basics/02-vertex-shader) | 버텍스 셰이더 |
| [03](./02-wgsl-basics/03-compute-shader) | 컴퓨트 셰이더 |

---

## GLSL vs WGSL 비교

| 항목 | GLSL | WGSL |
|------|------|------|
| 사용처 | WebGL | WebGPU |
| 타입 시스템 | 약함 | 강함 |
| 컴퓨트 셰이더 | 미지원 (WebGL 2 제한적) | 지원 |
| 문법 | C 계열 | Rust 영향 |

---

## 최소 GLSL 예시

```glsl
// 버텍스 셰이더
attribute vec3 position;
uniform mat4 mvpMatrix;

void main() {
  gl_Position = mvpMatrix * vec4(position, 1.0);
}

// 프래그먼트 셰이더
precision mediump float;
uniform vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

## 최소 WGSL 예시

```wgsl
@vertex
fn vs_main(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return vec4f(pos, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4f {
  return vec4f(1.0, 0.5, 0.0, 1.0);
}
```


---
