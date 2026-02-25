# 05. 쿼터니언 (Quaternion)

회전을 표현하는 방식 중 가장 강력하고 실용적인 방법.
오일러 각의 짐벌락 문제를 해결하고, 두 회전 사이의 보간이 자연스럽다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![Quaternions 3Blue1Brown](https://img.youtube.com/vi/zjMuIxRvygQ/mqdefault.jpg)](https://www.youtube.com/watch?v=zjMuIxRvygQ) | **Quaternions and 3D rotation (visualized)**<br>쿼터니언의 4D 시각화 · 직관적 설명<br>⏱ 31분 · 🎓 3Blue1Brown |
| [![Quaternions interactive](https://img.youtube.com/vi/d4EgbgTm0Bg/mqdefault.jpg)](https://www.youtube.com/watch?v=d4EgbgTm0Bg) | **Visualizing quaternions (4D numbers) with stereographic projection**<br>쿼터니언 인터랙티브 시각화<br>⏱ 30분 · 🎓 3Blue1Brown |
| [![Gimbal Lock](https://img.youtube.com/vi/zc8b2Jo7mno/mqdefault.jpg)](https://www.youtube.com/watch?v=zc8b2Jo7mno) | **Gimbal Lock Explained**<br>짐벌락이 실제로 어떻게 발생하는지<br>⏱ 7분 |

---

## 왜 쿼터니언인가?

### 오일러 각 (Euler Angles)의 문제

```typescript
mesh.rotation = new Vector3(xDeg, yDeg, zDeg); // 직관적이지만...
```

**짐벌락 (Gimbal Lock)**:
- 특정 각도에서 두 축이 겹치는 현상
- 자유도가 3개 → 2개로 줄어듦

### 비교

| 항목 | 오일러 각 | 쿼터니언 |
|------|----------|---------|
| 짐벌락 | 발생 | 없음 |
| 보간 | 부자연스러움 | SLERP으로 자연스러움 |
| 직관성 | 높음 | 낮음 |

---

## 쿼터니언 구조

```
q = (x, y, z, w)

w = cos(θ/2)          ← 스칼라 부분
x,y,z = axis * sin(θ/2) ← 벡터 부분

의미: 축 (x,y,z) 기준으로 각도 θ 만큼 회전
```

```typescript
// Y축으로 45도 회전
const q = Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.PI / 4);
// q.w = cos(22.5°) ≈ 0.924
// q.y = sin(22.5°) ≈ 0.383
```

---

## SLERP (구면 선형 보간)

```typescript
const start = Quaternion.RotationAxis(Vector3.Up(), 0);
const end   = Quaternion.RotationAxis(Vector3.Up(), Math.PI);

// 매 프레임 부드럽게 보간
let t = 0;
scene.onBeforeRenderObservable.add(() => {
  t = Math.min(t + 0.01, 1);
  mesh.rotationQuaternion = Quaternion.Slerp(start, end, t);
});
```

---

## 실전 팁

```typescript
// rotation과 rotationQuaternion 동시에 쓰면 안 됨!
// rotationQuaternion이 설정되면 rotation은 무시됨

mesh.rotationQuaternion = Quaternion.Identity();

// 매 프레임 회전
const delta = Quaternion.RotationAxis(Vector3.Up(), 0.01);
mesh.rotationQuaternion = mesh.rotationQuaternion!.multiply(delta);
```

---

## 다음 단계

→ [06. 삼각함수 (Trigonometry)](../06-trigonometry)
