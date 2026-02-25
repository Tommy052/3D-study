# 03. 변환 행렬 (Transform Matrix)

3D에서 물체를 이동·회전·스케일하는 것은 모두 행렬 곱으로 표현된다.
이 세 변환을 합친 것이 **TRS 행렬** 또는 **월드 행렬**이다.

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

결과: 점 (x, y, z) → (x*sx, y*sy, z*sz)
```

### 3. 회전 (Rotation)

**X축 회전:**
```
Rx(θ) =
| 1    0       0    0 |
| 0   cos θ  -sin θ  0 |
| 0   sin θ   cos θ  0 |
| 0    0       0    1 |
```

**Y축 회전:**
```
Ry(θ) =
|  cos θ   0   sin θ  0 |
|   0      1    0     0 |
| -sin θ   0   cos θ  0 |
|   0      0    0     1 |
```

**Z축 회전:**
```
Rz(θ) =
| cos θ  -sin θ  0  0 |
| sin θ   cos θ  0  0 |
|  0       0     1  0 |
|  0       0     0  1 |
```

---

## TRS 합성 (순서가 중요!)

```
M = T × R × S

// 적용 순서 (오른쪽부터):
// 1. 먼저 Scale
// 2. 그 다음 Rotate
// 3. 마지막 Translate
```

> **순서가 왜 중요한가?**
> - Scale 후 Translate vs Translate 후 Scale은 다른 결과를 만든다.
> - 일반적으로 `스케일 → 회전 → 이동` 순서를 사용한다.

```typescript
// 예시: 박스를 2배 키우고, Y축 45도 회전, (3, 0, 0)으로 이동
const S = Matrix.Scaling(2, 2, 2);
const R = Matrix.RotationY(Math.PI / 4);
const T = Matrix.Translation(3, 0, 0);

const worldMatrix = S.multiply(R).multiply(T);
```

---

## MVP 행렬 — 3D의 핵심 파이프라인

3D 물체가 2D 화면에 그려지기까지 3단계 변환이 일어난다.

```
클립 좌표 = Projection × View × Model × 로컬 좌표
           (P)         (V)    (M)
```

### Model 행렬 (M)
- 물체의 **월드 공간** 위치/회전/크기
- = TRS 행렬
- Babylon.js: `mesh.getWorldMatrix()`

### View 행렬 (V)
- **카메라 시점**으로의 변환
- 카메라 변환의 역행렬
- Babylon.js: `camera.getViewMatrix()`

### Projection 행렬 (P)
- 3D → 2D **원근 투영**
- 멀리 있는 물체는 작게, 가까운 물체는 크게
- Babylon.js: `camera.getProjectionMatrix()`

---

## 공간 변환 흐름

```
로컬 공간 (Local Space)
  물체 자신의 좌표 기준
        ↓ × Model 행렬
월드 공간 (World Space)
  씬 전체 기준
        ↓ × View 행렬
뷰 공간 (View Space / Camera Space)
  카메라 기준
        ↓ × Projection 행렬
클립 공간 (Clip Space)
  NDC로 변환 (-1 ~ 1)
        ↓ GPU 래스터화
화면 좌표 (Screen Space)
  실제 픽셀 좌표
```

---

## 코드 예제

```typescript
// WebGL에서 MVP 행렬을 셰이더에 전달
const modelMatrix = /* TRS 계산 */;
const viewMatrix = camera.getViewMatrix();
const projMatrix = camera.getProjectionMatrix();

const mvp = modelMatrix.multiply(viewMatrix).multiply(projMatrix);

// 셰이더에서:
// gl_Position = mvpMatrix * vec4(position, 1.0);
```

```glsl
// 버텍스 셰이더
uniform mat4 u_mvp;
attribute vec3 a_position;

void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

---

## 다음 단계

→ [04. 좌표계 (Coordinate System)](../04-coordinate-system)
