# WGSL 기본 문법

WGSL (WebGPU Shading Language) — WebGPU 전용 셰이더 언어.
Rust 문법의 영향을 받았으며, GLSL보다 타입이 엄격하다.

---

## 관련 강의

| | |
|---|---|
| [![Kishimisu — Shader Art Coding](https://img.youtube.com/vi/f4s1h2YETNY/mqdefault.jpg)](https://www.youtube.com/watch?v=f4s1h2YETNY) | [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) |
| **Kishimisu** — GLSL 문법 기초 (WGSL과 비교하며 학습) | **CMU 15-462** — GPU 셰이더 개념 전반 |

> **공식 레퍼런스**: [WGSL Spec (W3C)](https://www.w3.org/TR/WGSL/) · [WebGPU Fundamentals — WGSL](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html)

---

## GLSL vs WGSL 비교

```glsl
// GLSL
uniform mat4 u_mvp;
attribute vec3 a_position;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

```wgsl
// WGSL
struct Uniforms {
  mvp: mat4x4f,
}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@location(0) position: vec3f) -> @builtin(position) vec4f {
  return uniforms.mvp * vec4f(position, 1.0);
}
```

---

## 기본 타입

```wgsl
// 스칼라
var a: f32 = 1.0;    // 32비트 float
var b: i32 = 1;      // 32비트 int
var c: u32 = 1u;     // 32비트 unsigned int
var d: bool = true;

// 벡터
var v2: vec2f = vec2f(1.0, 0.0);
var v3: vec3f = vec3f(1.0, 0.5, 0.0);
var v4: vec4f = vec4f(1.0, 0.5, 0.0, 1.0);

// 행렬
var m: mat4x4f = mat4x4f(/* 16개 값 */);

// 스위즐링 (GLSL과 동일)
let rgb = v4.rgb;
let x   = v4.x;
```

---

## 함수 문법

```wgsl
fn add(a: f32, b: f32) -> f32 {
  return a + b;
}

// 내장 함수 (GLSL과 거의 동일)
let len = length(v3);
let n   = normalize(v3);
let d   = dot(v3, v3);
let m   = mix(a, b, t);
let c   = clamp(x, 0.0, 1.0);
```

---

## 진입점 (Entry Points)

```wgsl
// 버텍스 셰이더 진입점
@vertex
fn vs_main(/* 입력 */) -> /* 출력 */ { ... }

// 프래그먼트 셰이더 진입점
@fragment
fn fs_main(/* 입력 */) -> /* 출력 */ { ... }

// 컴퓨트 셰이더 진입점
@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3u) { ... }
```

---

## 바인딩 (Binding)

CPU에서 GPU로 데이터를 넘기는 방법.

```wgsl
// Uniform Buffer
@group(0) @binding(0) var<uniform> transform: Transform;

// Storage Buffer (읽기/쓰기)
@group(0) @binding(1) var<storage, read_write> data: array<f32>;

// 텍스처
@group(1) @binding(0) var myTexture: texture_2d<f32>;
@group(1) @binding(1) var mySampler: sampler;
```

---

## 완전한 예시 (Hello Triangle)

```wgsl
// 버텍스 셰이더
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
  // 하드코딩된 삼각형 정점
  var positions = array<vec2f, 3>(
    vec2f( 0.0,  0.5),
    vec2f(-0.5, -0.5),
    vec2f( 0.5, -0.5),
  );
  return vec4f(positions[vertexIndex], 0.0, 1.0);
}

// 프래그먼트 셰이더
@fragment
fn fs_main() -> @location(0) vec4f {
  return vec4f(1.0, 0.5, 0.0, 1.0); // 주황색
}
```

---

## 다음 단계

→ [02. WGSL 버텍스 셰이더](../02-vertex-shader)
