# WebGL 조명 직접 구현

Phong 조명 모델을 GLSL 셰이더로 직접 구현한다.

---

## 관련 강의

| | |
|---|---|
| [![CMU 15-462 — Lighting & Shading](https://img.youtube.com/vi/tFx1MaIb9cg/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | [![Kishimisu — Shader Art Coding](https://img.youtube.com/vi/f4s1h2YETNY/mqdefault.jpg)](https://www.youtube.com/watch?v=f4s1h2YETNY) |
| **CMU 15-462** — Phong/Blinn-Phong 조명 모델 수학 | **Kishimisu** — GLSL로 조명과 색상을 직접 계산하는 실습 |

> **참고**: [LearnOpenGL — Basic Lighting](https://learnopengl.com/Lighting/Basic-Lighting) · [WebGL2 Fundamentals — Point Lights](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-lighting-point.html)

---

## 버텍스 셰이더

```glsl
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_normalMatrix;

varying vec3 v_worldPos;
varying vec3 v_normal;

void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  v_normal = normalize(mat3(u_normalMatrix) * a_normal);

  gl_Position = u_projection * u_view * worldPos;
}
```

---

## 프래그먼트 셰이더 (Phong)

```glsl
precision mediump float;

uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform vec3 u_objectColor;

varying vec3 v_worldPos;
varying vec3 v_normal;

void main() {
  vec3 norm = normalize(v_normal);
  vec3 lightDir = normalize(u_lightPos - v_worldPos);
  vec3 viewDir = normalize(u_cameraPos - v_worldPos);

  // Ambient
  vec3 ambient = 0.1 * vec3(1.0);

  // Diffuse
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * vec3(1.0);

  // Specular (Blinn-Phong)
  vec3 halfway = normalize(lightDir + viewDir);
  float spec = pow(max(dot(norm, halfway), 0.0), 64.0);
  vec3 specular = 0.5 * spec * vec3(1.0);

  vec3 result = (ambient + diffuse + specular) * u_objectColor;
  gl_FragColor = vec4(result, 1.0);
}
```

---

## 법선 행렬 (Normal Matrix)

스케일/비균등 변환 시 법선이 틀어지는 것을 보정.

```typescript
// model 행렬의 역전치행렬 (3x3)
const normalMatrix = mat3.create();
mat3.fromMat4(normalMatrix, modelMatrix);
mat3.invert(normalMatrix, normalMatrix);
mat3.transpose(normalMatrix, normalMatrix);
```

---

## Phong vs Blinn-Phong

| 항목 | Phong | Blinn-Phong |
|------|-------|-------------|
| Specular 계산 | `dot(reflect(-L, N), V)` | `dot(N, halfwayDir)` |
| 성능 | 느림 | 빠름 |
| 품질 | 유사 | 더 자연스러움 |
| 현재 표준 | 거의 안 씀 | 기본값 |

---

## 다음 단계

→ [05. WebGPU](../../05-webgpu)
