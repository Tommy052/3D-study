# 버텍스 셰이더 (Vertex Shader)

렌더링 파이프라인의 첫 번째 프로그래밍 단계.
메쉬의 각 정점(Vertex)마다 한 번씩 실행되며, 최종 화면 위치를 결정한다.

---

## 역할

```
입력: 정점의 로컬 좌표 (x, y, z)
출력: 클립 공간 좌표 (gl_Position)

주요 작업:
  - MVP 행렬을 곱해 좌표 변환
  - 프래그먼트 셰이더로 데이터 전달 (varying)
```

---

## GLSL 기본 문법

```glsl
// 데이터 타입
float  f = 1.0;
int    i = 1;
bool   b = true;
vec2   v2 = vec2(1.0, 0.0);
vec3   v3 = vec3(1.0, 0.5, 0.0);
vec4   v4 = vec4(1.0, 0.5, 0.0, 1.0);
mat4   m  = mat4(1.0); // 단위행렬

// 스위즐링 (Swizzling) — GLSL의 강력한 기능
vec4 color = vec4(1.0, 0.5, 0.2, 1.0);
vec3 rgb = color.rgb;     // (1.0, 0.5, 0.2)
vec2 xy  = color.xy;      // (1.0, 0.5)
float r  = color.r;       // 1.0
vec3 bgr = color.bgr;     // (0.2, 0.5, 1.0) 순서 변경도 가능
```

---

## 최소 버텍스 셰이더

```glsl
// 변수 한정자 (Qualifier)
attribute vec3 a_position; // CPU에서 정점마다 전달 (WebGL 1.0)
// in vec3 a_position;    // WebGL 2.0 / WebGPU 스타일

uniform mat4 u_mvp;        // 모든 정점에 동일한 값 (CPU에서 한 번 전달)

// 프래그먼트 셰이더로 전달할 값
varying vec2 v_uv;          // WebGL 1.0
// out vec2 v_uv;           // WebGL 2.0

void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

---

## MVP 변환이 있는 버텍스 셰이더

```glsl
attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_normalMatrix; // Model 역전치행렬 (법선 변환용)

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_worldPos;

void main() {
  // 월드 좌표 계산
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;

  // UV 전달
  v_uv = a_uv;

  // 법선 변환 (스케일/회전은 있고 이동은 없는 행렬로 변환)
  v_normal = normalize(mat3(u_normalMatrix) * a_normal);

  // 클립 좌표
  gl_Position = u_projection * u_view * worldPos;
}
```

---

## 내장 변수

```glsl
gl_Position  : 출력 — 정점의 클립 공간 좌표 (필수)
gl_PointSize : 점(POINTS) 렌더링 시 크기
gl_VertexID  : 현재 정점의 인덱스 (WebGL 2.0)
```

---

## 다음 단계

→ [02. 프래그먼트 셰이더](../02-fragment-shader)
