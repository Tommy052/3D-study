# WGSL 버텍스 셰이더

WebGPU에서 정점 데이터를 처리하는 셰이더.

---

## 관련 강의

| | |
|---|---|
| [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | [![Kishimisu — Shader Art Coding](https://img.youtube.com/vi/f4s1h2YETNY/mqdefault.jpg)](https://www.youtube.com/watch?v=f4s1h2YETNY) |
| **CMU 15-462** — 버텍스 처리와 좌표 변환 파이프라인 | **Kishimisu** — 셰이더 입출력 구조 이해 |

> **공식 코드랩**: [Your first WebGPU app (Google)](https://codelabs.developers.google.com/your-first-webgpu-app) · [WebGPU Fundamentals](https://webgpufundamentals.org/)

---

## 구조체로 입출력 정의

```wgsl
struct VertexInput {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
  @location(2) normal: vec3f,
}

struct VertexOutput {
  @builtin(position) clip_position: vec4f,
  @location(0) uv: vec2f,
  @location(1) world_normal: vec3f,
  @location(2) world_pos: vec3f,
}

struct Uniforms {
  model: mat4x4f,
  view: mat4x4f,
  projection: mat4x4f,
  normal_matrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  let world_pos = uniforms.model * vec4f(input.position, 1.0);
  output.world_pos = world_pos.xyz;
  output.clip_position = uniforms.projection * uniforms.view * world_pos;
  output.uv = input.uv;
  output.world_normal = normalize((uniforms.normal_matrix * vec4f(input.normal, 0.0)).xyz);

  return output;
}
```

---

## JavaScript에서 버텍스 버퍼 연결

```typescript
// 버텍스 레이아웃 정의
const vertexBufferLayout: GPUVertexBufferLayout = {
  arrayStride: (3 + 2 + 3) * 4, // position + uv + normal, 각 4바이트
  attributes: [
    { shaderLocation: 0, offset: 0,      format: 'float32x3' }, // position
    { shaderLocation: 1, offset: 3 * 4,  format: 'float32x2' }, // uv
    { shaderLocation: 2, offset: 5 * 4,  format: 'float32x3' }, // normal
  ],
};
```

---

## GLSL vs WGSL 버텍스 셰이더 비교

| 항목 | GLSL (WebGL) | WGSL (WebGPU) |
|------|-------------|---------------|
| 입력 선언 | `attribute vec3 pos` | `@location(0) pos: vec3f` |
| 출력 | `gl_Position = ...` | `return vec4f(...)` |
| Uniform | `uniform mat4 mvp` | `@group(0) @binding(0) var<uniform>` |
| 구조체 | 제한적 | 구조체로 깔끔하게 묶음 |

---

## 다음 단계

→ [03. WGSL 컴퓨트 셰이더](../03-compute-shader)
