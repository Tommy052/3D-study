# 01. 벡터 (Vector)

3D 그래픽스에서 가장 기본이 되는 개념.
위치, 방향, 힘, 속도 등 모든 것이 벡터로 표현된다.

---

## 개념

### 스칼라 vs 벡터

| 구분 | 설명 | 예시 |
|------|------|------|
| 스칼라 (Scalar) | 크기만 있음 | 온도 20°, 거리 5m |
| 벡터 (Vector) | 크기 + 방향 | 북쪽으로 5m, (1, 0, 0) |

### 벡터 표기

```
2D 벡터: v = (x, y)
3D 벡터: v = (x, y, z)

예:
  (1, 0, 0) → X축 방향 (오른쪽)
  (0, 1, 0) → Y축 방향 (위)
  (0, 0, 1) → Z축 방향 (앞)
```

---

## 핵심 연산

### 1. 덧셈 / 뺄셈

```
a = (1, 2, 3)
b = (4, 5, 6)

a + b = (1+4, 2+5, 3+6) = (5, 7, 9)   // 두 벡터 합치기
b - a = (4-1, 5-2, 6-3) = (3, 3, 3)   // a에서 b로의 방향
```

> **활용**: 두 점 사이의 방향벡터 = `목적지 - 출발지`

### 2. 스칼라 곱 (크기 조절)

```
v = (2, 4, 6)
v * 2  = (4, 8, 12)   // 방향은 같고 2배 크기
v * -1 = (-2, -4, -6) // 반대 방향
```

### 3. 크기 (Magnitude / Length)

```
|v| = √(x² + y² + z²)

예: v = (3, 4, 0)
|v| = √(9 + 16 + 0) = √25 = 5
```

### 4. 정규화 (Normalize) — 가장 중요!

방향만 남기고 크기를 1로 만든다.

```
normalize(v) = v / |v| = (x/|v|, y/|v|, z/|v|)

예: v = (3, 4, 0), |v| = 5
normalize(v) = (0.6, 0.8, 0)
```

> **활용**: 방향만 필요할 때 항상 정규화. 조명 방향, 이동 방향 등.

### 5. 내적 (Dot Product)

```
a · b = ax*bx + ay*by + az*bz

또는

a · b = |a| * |b| * cos(θ)
```

**θ (두 벡터 사이의 각도)를 구할 수 있다:**

| 결과값 | 의미 |
|--------|------|
| > 0 | 같은 방향 (예각) |
| = 0 | 수직 (90°) |
| < 0 | 반대 방향 (둔각) |

> **활용**: 조명 계산 (빛과 면 법선의 각도), 시야각 판단

### 6. 외적 (Cross Product) — 3D 전용

```
a × b = (ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx)
```

결과는 **a와 b 모두에 수직인 벡터**

```
(1,0,0) × (0,1,0) = (0,0,1)   // X × Y = Z
```

> **활용**: 면의 법선벡터(Normal) 계산, 카메라 방향 계산

---

## 코드 예제 (TypeScript)

```typescript
// 벡터 클래스 직접 구현 (학습용)
class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}

  add(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }

  get length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalize(): Vec3 {
    const len = this.length;
    return new Vec3(this.x / len, this.y / len, this.z / len);
  }

  dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
}

// 사용 예시
const a = new Vec3(1, 0, 0); // X축
const b = new Vec3(0, 1, 0); // Y축

console.log(a.dot(b));   // 0 (수직)
console.log(a.cross(b)); // Vec3(0, 0, 1) → Z축
```

## Babylon.js에서의 벡터

```typescript
import { Vector3 } from '@babylonjs/core';

const pos = new Vector3(1, 2, 3);
const dir = new Vector3(0, 1, 0);

// 내적
const dot = Vector3.Dot(pos, dir);

// 외적
const cross = Vector3.Cross(pos, dir);

// 정규화
const normalized = dir.normalize();

// 두 점 사이의 거리
const dist = Vector3.Distance(pos, Vector3.Zero());
```

---

## 시각적으로 이해하기

```
외적 (Cross Product):

      Y
      |   b
      |  /
      | /
      |/_____ X
      /
     /
    Z

a = X축 (1,0,0)
b = Y축 (0,1,0)
a × b = Z축 (0,0,1) ← 두 벡터에 수직, 오른손 법칙
```

---

## 실습

1. Vec3 클래스를 직접 구현해보기
2. Canvas 2D에 두 벡터와 내적값을 시각화해보기
3. 두 점 사이의 방향벡터 계산해보기

---

## 다음 단계

→ [02. 행렬 (Matrix)](../02-matrix)
