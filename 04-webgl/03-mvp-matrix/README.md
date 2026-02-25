# MVP 행렬 직접 구현

Model × View × Projection 행렬을 직접 계산해 WebGL로 넘기는 예제.

---

## 관련 강의

| | |
|---|---|
| [![CMU 15-462 — Transforms](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | [![Branch Education — Graphics Pipeline](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) |
| **CMU 15-462** — 좌표 변환과 투영 행렬 이론 | **Branch Education** — MVP가 실제 GPU에서 처리되는 흐름 |

> **참고**: [WebGL2 Fundamentals — 3D Perspective](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective.html) · [gl-matrix 라이브러리](https://glmatrix.net/)

---

## 목표

```typescript
// 버텍스 셰이더
uniform mat4 u_mvp;
attribute vec3 a_position;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

---

## 행렬 계산

```typescript
import { mat4 } from 'gl-matrix'; // gl-matrix 라이브러리 사용 (npm i gl-matrix)

// Model 행렬 (물체의 월드 변환)
const model = mat4.create();
mat4.rotateY(model, model, rotation);
mat4.translate(model, model, [0, 0, 0]);

// View 행렬 (카메라)
const view = mat4.create();
mat4.lookAt(
  view,
  [0, 2, 5],  // 카메라 위치
  [0, 0, 0],  // 바라볼 대상
  [0, 1, 0],  // 위쪽 방향 (Up 벡터)
);

// Projection 행렬 (원근 투영)
const projection = mat4.create();
mat4.perspective(
  projection,
  Math.PI / 4,              // FOV (45도)
  canvas.width / canvas.height, // 종횡비
  0.1,                      // Near plane
  100.0,                    // Far plane
);

// MVP 합성
const mvp = mat4.create();
mat4.multiply(mvp, view, model);
mat4.multiply(mvp, projection, mvp);

// 셰이더에 전달
gl.uniformMatrix4fv(mvpLoc, false, mvp);
```

---

## 각 행렬의 역할

| 행렬 | 변환 | 좌표계 |
|------|------|--------|
| **Model** | 로컬 → 월드 | 물체의 위치·회전·크기 |
| **View** | 월드 → 뷰 | 카메라 기준으로 재배치 |
| **Projection** | 뷰 → 클립 | 원근감 적용 (NDC로 압축) |

---

## FOV (Field of View)

```
FOV = 60° → 자연스러운 시야
FOV = 90° → 넓은 시야 (물고기눈 느낌)
FOV = 45° → 좁고 집중된 시야
```

---

## 다음 단계

→ [04. 텍스처](../04-texture)
