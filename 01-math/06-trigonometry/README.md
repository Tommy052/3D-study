# 06. 삼각함수 (Trigonometry)

sin, cos, tan — 3D에서 주기적인 움직임, 방향 계산, 각도 변환에 필수다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![Unit circle](https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg)](https://www.youtube.com/watch?v=yBw67Fb31Cs) | **Unit Circle Trigonometry**<br>단위원과 sin/cos의 관계<br>⏱ 14분 |
| [![Trig for game dev](https://img.youtube.com/vi/qeyp-YSPp7c/mqdefault.jpg)](https://www.youtube.com/watch?v=qeyp-YSPp7c) | **Trigonometry for Game Developers**<br>게임 개발 맥락에서 삼각함수 실전 활용<br>⏱ 20분 |

---

## 라디안 vs 도 (Degree)

3D 그래픽스는 **라디안(radian)**을 사용한다.

```
라디안 = 도 × (π / 180)
도 = 라디안 × (180 / π)

주요 값:
  0°   = 0
  90°  = π/2  ≈ 1.5708
  180° = π    ≈ 3.1416
  360° = 2π   ≈ 6.2832
```

```typescript
const toRad = (deg: number) => deg * (Math.PI / 180);
const toDeg = (rad: number) => rad * (180 / Math.PI);

mesh.rotation.y = toRad(45);
```

---

## sin / cos — 원운동의 기본

```
단위원에서:
  x = cos(θ)
  y = sin(θ)
```

**원운동 예시:**
```typescript
let angle = 0;

engine.runRenderLoop(() => {
  angle += engine.getDeltaTime() * 0.001;

  mesh.position.x = Math.cos(angle) * 5; // 반지름 5
  mesh.position.z = Math.sin(angle) * 5;

  scene.render();
});
```

---

## atan2 — 각도 계산

```
Math.atan2(y, x) → -π ~ π 범위로 모든 사분면 구분
```

```typescript
// 적을 향해 바라보기
const direction = enemy.subtract(player);
const angle = Math.atan2(direction.x, direction.z);
player.rotation.y = angle;
```

---

## 3D에서 자주 쓰는 패턴

### 진자 운동
```typescript
mesh.rotation.z = Math.sin(t) * 0.5;
```

### 호흡 효과
```typescript
const scale = 1 + Math.sin(t) * 0.1; // 0.9 ~ 1.1
mesh.scaling.setAll(scale);
```

### 카메라 방향으로 이동
```typescript
const angle = mesh.rotation.y;
mesh.position.x += Math.sin(angle) * speed;
mesh.position.z += Math.cos(angle) * speed;
```

---

## 핵심 공식 정리

| 공식 | 코드 | 설명 |
|------|------|------|
| 라디안 변환 | `deg * Math.PI / 180` | 도 → 라디안 |
| 원운동 | `cos(t), sin(t)` | 원 위의 점 |
| 진동 | `sin(t) * amplitude` | 진자, 파동 |
| 각도 계산 | `Math.atan2(y, x)` | 방향 각도 |

---

## 다음 단계

→ [02. 그래픽스 이론](../../02-graphics-theory)
