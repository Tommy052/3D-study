# 05. 쿼터니언 (Quaternion)

회전을 표현하는 방식 중 가장 강력하고 실용적인 방법.
오일러 각의 짐벌락 문제를 해결하고, 두 회전 사이의 보간이 자연스럽다.

---

## 왜 쿼터니언인가?

### 오일러 각 (Euler Angles)의 문제

```typescript
// 직관적이지만...
mesh.rotation = new Vector3(xDeg, yDeg, zDeg);
```

**짐벌락 (Gimbal Lock)**:
- X, Y, Z 순서로 회전할 때, 특정 각도에서 두 축이 겹쳐버리는 현상
- 자유도가 3개에서 2개로 줄어듦
- 항공기, 카메라, 애니메이션에서 치명적

```
예: X축을 90도 회전하면
    Y축과 Z축이 같은 방향을 가리킴
    → Y로 회전이나 Z로 회전이나 동일하게 동작
```

### 쿼터니언의 장점

| 항목 | 오일러 각 | 쿼터니언 |
|------|----------|---------|
| 짐벌락 | 발생 | 없음 |
| 보간 | 부자연스러움 | SLERP으로 자연스러움 |
| 연산 | 느림 | 빠름 |
| 직관성 | 높음 | 낮음 |

---

## 쿼터니언 구조

```
q = (x, y, z, w)

  또는

q = w + xi + yj + zk

w = 스칼라 부분 (cos(θ/2))
x, y, z = 벡터 부분 (axis * sin(θ/2))
```

**의미**: 축 `(x, y, z)`를 기준으로 각도 `θ`만큼 회전

```typescript
// 축-각도 → 쿼터니언
const axis = new Vector3(0, 1, 0); // Y축
const angle = Math.PI / 4;          // 45도

const q = Quaternion.RotationAxis(axis, angle);
// q.w = cos(22.5°) ≈ 0.924
// q.y = sin(22.5°) ≈ 0.383
// q.x = q.z = 0
```

---

## SLERP (Spherical Linear Interpolation)

두 회전 사이를 구면 선형 보간.
애니메이션에서 자연스러운 회전 전환에 사용.

```typescript
const start = Quaternion.RotationAxis(Vector3.Up(), 0);
const end   = Quaternion.RotationAxis(Vector3.Up(), Math.PI);

// t = 0.0 → start, t = 1.0 → end
const mid = Quaternion.Slerp(start, end, 0.5);
// 정확히 90도 회전된 상태

// 애니메이션 루프에서:
let t = 0;
scene.onBeforeRenderObservable.add(() => {
  t += 0.01;
  mesh.rotationQuaternion = Quaternion.Slerp(start, end, Math.min(t, 1));
});
```

---

## 오일러 ↔ 쿼터니언 변환

```typescript
import { Quaternion, Vector3 } from '@babylonjs/core';

// 오일러 → 쿼터니언
const euler = new Vector3(0, Math.PI / 4, 0); // Y축 45도
const quat = Quaternion.FromEulerAngles(euler.x, euler.y, euler.z);

// 쿼터니언 → 오일러
const backToEuler = quat.toEulerAngles();

// Babylon.js에서 쿼터니언으로 회전 설정
mesh.rotationQuaternion = Quaternion.RotationAxis(
  new Vector3(0, 1, 0), // Y축
  Math.PI / 2           // 90도
);
```

---

## 쿼터니언 곱 (회전 합성)

```typescript
// q1 회전 후 q2 회전 = q2 * q1 (순서 주의!)
const q1 = Quaternion.RotationAxis(Vector3.Up(), Math.PI / 4);   // Y 45도
const q2 = Quaternion.RotationAxis(Vector3.Right(), Math.PI / 4); // X 45도

// X 먼저 → Y 나중
const combined = q1.multiply(q2);
mesh.rotationQuaternion = combined;
```

---

## 실전 팁

```typescript
// mesh.rotation과 mesh.rotationQuaternion은 동시에 쓰면 안 됨!
// rotationQuaternion이 설정되면 rotation은 무시됨

// 초기화:
mesh.rotationQuaternion = Quaternion.Identity();

// 매 프레임 회전:
const deltaRotation = Quaternion.RotationAxis(Vector3.Up(), 0.01);
mesh.rotationQuaternion = mesh.rotationQuaternion!.multiply(deltaRotation);
```

---

## 다음 단계

→ [06. 삼각함수 (Trigonometry)](../06-trigonometry)
