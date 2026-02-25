# 03. 변환 행렬 (Transform Matrix)

3D에서 물체를 이동·회전·스케일하는 것은 모두 행렬 곱으로 표현된다.
이 세 변환을 합친 것이 **TRS 행렬** 또는 **월드 행렬**이다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![Ch3. Linear transformations](https://img.youtube.com/vi/kYB8IZa5AuE/mqdefault.jpg)](https://www.youtube.com/watch?v=kYB8IZa5AuE) | **Ch3. Linear transformations and matrices**<br>행렬이 공간을 변형하는 방식 시각화<br>⏱ 10분 · 🎓 3Blue1Brown |
| [![Ch4. Matrix multiplication](https://img.youtube.com/vi/XkY2DOUCWMU/mqdefault.jpg)](https://www.youtube.com/watch?v=XkY2DOUCWMU) | **Ch4. Matrix multiplication as composition**<br>TRS 합성 = 행렬 곱의 합성<br>⏱ 10분 · 🎓 3Blue1Brown |
| [![MIT L3](https://img.youtube.com/vi/FX4C-JpTFgY/mqdefault.jpg)](https://www.youtube.com/watch?v=FX4C-JpTFgY) | **MIT L3. Multiplication and inverse matrices**<br>행렬 곱과 역행렬 (카메라 View 행렬 계산 원리)<br>⏱ 46분 · 🎓 MIT |

---

## 3가지 기본 변환

### 1. 이동 (Translation)

```
T(tx, ty, tz) =
| 1  0  0  tx |
| 0  1  0  ty |
| 0  0  1  tz |
| 0  0  0   1 |

결과: 점 (x, y, z) → (x+tx, y+ty, z+tz)
```

### 2. 스케일 (Scale)

```
S(sx, sy, sz) =
| sx  0   0   0 |
|  0  sy  0   0 |
|  0  0   sz  0 |
|  0  0   0   1 |
```

### 3. 회전 (Rotation)

**Y축 회전 (가장 자주 사용):**
```
Ry(θ) =
|  cos θ   0   sin θ  0 |
|   0      1    0     0 |
| -sin θ   0   cos θ  0 |
|   0      0    0     1 |
```

---

## TRS 합성 (순서가 중요!)

```
M = T × R × S

// 적용 순서 (오른쪽부터):
// 1. Scale → 2. Rotate → 3. Translate
```

> Scale 후 Translate ≠ Translate 후 Scale

```typescript
const S = Matrix.Scaling(2, 2, 2);
const R = Matrix.RotationY(Math.PI / 4);
const T = Matrix.Translation(3, 0, 0);

const worldMatrix = S.multiply(R).multiply(T);
```

---

## MVP 행렬 — 3D의 핵심 파이프라인

```
클립 좌표 = Projection × View × Model × 로컬 좌표

Model      → 물체의 월드 변환 (TRS)
View       → 카메라 시점 변환 (카메라 행렬의 역행렬)
Projection → 원근 투영 (3D → 2D)
```

### 공간 변환 흐름

```
로컬 공간  →(× Model)→  월드 공간  →(× View)→  뷰 공간  →(× Projection)→  클립 공간  →  NDC  →  화면
```

---

## 셰이더에서 MVP

```glsl
// 버텍스 셰이더
uniform mat4 u_mvp;
attribute vec3 a_position;

void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

```typescript
// MVP 합성 후 셰이더에 전달
const mvp = modelMatrix.multiply(viewMatrix).multiply(projMatrix);
gl.uniformMatrix4fv(mvpLoc, false, mvp.toArray());
```

---

## 다음 단계

→ [04. 좌표계 (Coordinate System)](../04-coordinate-system)
