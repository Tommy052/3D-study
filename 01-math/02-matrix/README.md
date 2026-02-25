# 02. 행렬 (Matrix)

행렬은 3D에서 **변환(이동, 회전, 스케일)을 하나의 수식으로 표현**하는 도구다.
여러 변환을 행렬 곱 하나로 합칠 수 있어서 GPU가 극도로 효율적으로 처리할 수 있다.

---

## 개념

### 행렬이란?

숫자를 격자 형태로 배열한 것.

```
2x2 행렬:
| a  b |
| c  d |

4x4 행렬 (3D에서 주로 사용):
| a  b  c  d |
| e  f  g  h |
| i  j  k  l |
| m  n  o  p |
```

> 3D에서 **4x4 행렬**을 쓰는 이유: 이동(Translation)을 행렬 곱으로 표현하려면 차원이 하나 더 필요하다 (동차좌표계).

---

## 핵심 연산

### 1. 행렬 × 벡터 (변환 적용)

```
| a  b  c  d |   | x |   | ax + by + cz + dw |
| e  f  g  h | × | y | = | ex + fy + gz + hw |
| i  j  k  l |   | z |   | ix + jy + kz + lw |
| m  n  o  p |   | w |   | mx + ny + oz + pw |
```

> 4D 벡터 `(x, y, z, w)` 에서 w = 1 이면 위치, w = 0 이면 방향

### 2. 행렬 × 행렬 (변환 합성)

```
// 여러 변환을 하나의 행렬로 합치기
M = 스케일 × 회전 × 이동

// 한 번의 곱으로 모든 변환 적용
최종위치 = M × 원래위치
```

> **주의**: 행렬 곱은 교환법칙이 성립하지 않는다 (A×B ≠ B×A)

### 3. 단위 행렬 (Identity Matrix)

아무 변환도 하지 않는 행렬. 숫자의 `1`과 같은 역할.

```
| 1  0  0  0 |
| 0  1  0  0 |
| 0  0  1  0 |
| 0  0  0  1 |
```

### 4. 전치 행렬 (Transpose)

행과 열을 뒤집음.

```
     | 1  2  3 |        | 1  4  7 |
A  = | 4  5  6 |  Aᵀ = | 2  5  8 |
     | 7  8  9 |        | 3  6  9 |
```

### 5. 역행렬 (Inverse)

`A × A⁻¹ = I (단위행렬)`

> **활용**: 카메라의 View 행렬 계산 (카메라 변환의 역행렬)

---

## 3D에서 4x4 행렬을 쓰는 이유

```
// 이동을 행렬로 표현하려면 w 성분이 필요하다
| 1  0  0  tx |   | x |   | x + tx |
| 0  1  0  ty | × | y | = | y + ty |
| 0  0  1  tz |   | z |   | z + tz |
| 0  0  0   1 |   | 1 |   |   1    |

// w=0이면 방향벡터 (이동 영향 없음)
| 1  0  0  tx |   | x |   | x |
| 0  1  0  ty | × | y | = | y |
| 0  0  1  tz |   | z |   | z |
| 0  0  0   1 |   | 0 |   | 0 |
```

---

## 코드 예제 (TypeScript)

```typescript
// 4x4 행렬 (열 우선 배열 — WebGL/GPU 표준)
class Mat4 {
  // 16개 원소 (column-major order)
  data: Float32Array;

  constructor() {
    this.data = new Float32Array(16);
    this.identity();
  }

  identity(): this {
    this.data.fill(0);
    this.data[0]  = 1;
    this.data[5]  = 1;
    this.data[10] = 1;
    this.data[15] = 1;
    return this;
  }

  multiply(b: Mat4): Mat4 {
    const result = new Mat4();
    const a = this.data;
    const bv = b.data;
    const r = result.data;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        r[i * 4 + j] =
          a[0 * 4 + j] * bv[i * 4 + 0] +
          a[1 * 4 + j] * bv[i * 4 + 1] +
          a[2 * 4 + j] * bv[i * 4 + 2] +
          a[3 * 4 + j] * bv[i * 4 + 3];
      }
    }
    return result;
  }
}
```

## Babylon.js에서의 행렬

```typescript
import { Matrix, Vector3 } from '@babylonjs/core';

// 단위 행렬
const identity = Matrix.Identity();

// 이동 행렬
const translation = Matrix.Translation(1, 2, 3);

// 회전 행렬 (Y축으로 45도)
const rotation = Matrix.RotationY(Math.PI / 4);

// 스케일 행렬
const scale = Matrix.Scaling(2, 2, 2);

// 합성 (스케일 → 회전 → 이동 순서)
const combined = scale.multiply(rotation).multiply(translation);

// 벡터에 행렬 적용
const pos = new Vector3(1, 0, 0);
const transformed = Vector3.TransformCoordinates(pos, combined);
```

---

## Column-Major vs Row-Major

```
// Row-Major (수학 교과서 표준)
행렬을 행(Row) 순서로 메모리에 저장

// Column-Major (OpenGL, WebGL, Babylon.js 표준)
행렬을 열(Column) 순서로 메모리에 저장

이동 행렬 예시:
  수학: m[0][3], m[1][3], m[2][3] 에 tx, ty, tz
  GPU:  data[12], data[13], data[14] 에 tx, ty, tz
```

---

## 다음 단계

→ [03. 변환 행렬 (Transform Matrix)](../03-transform-matrix)
