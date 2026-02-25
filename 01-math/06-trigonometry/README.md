# 06. 삼각함수 (Trigonometry)

sin, cos, tan — 3D에서 주기적인 움직임, 방향 계산, 각도 변환에 필수다.

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
  270° = 3π/2 ≈ 4.7124
  360° = 2π   ≈ 6.2832
```

```typescript
// TypeScript에서
const toRad = (deg: number) => deg * (Math.PI / 180);
const toDeg = (rad: number) => rad * (180 / Math.PI);

mesh.rotation.y = toRad(45); // 45도 회전
```

---

## sin / cos — 원운동의 기본

```
단위원에서:
  x = cos(θ)
  y = sin(θ)

θ가 0 → 2π로 변할 때:
  cos: 1 → 0 → -1 → 0 → 1  (x 좌표)
  sin: 0 → 1 → 0 → -1 → 0  (y 좌표)
```

**원운동 예시:**
```typescript
let angle = 0;

engine.runRenderLoop(() => {
  angle += 0.02; // 매 프레임 증가

  // 반지름 5인 원 위를 돌기
  mesh.position.x = Math.cos(angle) * 5;
  mesh.position.z = Math.sin(angle) * 5;

  scene.render();
});
```

---

## tan / atan2 — 각도 계산

```
tan(θ) = sin(θ) / cos(θ) = y / x

역함수:
  Math.atan(y/x)    → -π/2 ~ π/2 (4사분면 구분 못함)
  Math.atan2(y, x)  → -π ~ π    (4사분면 모두 구분)
```

**atan2 활용:**
```typescript
// 두 점 사이의 각도 (적을 향해 바라보기)
const enemy = new Vector3(3, 0, 5);
const player = new Vector3(0, 0, 0);

const direction = enemy.subtract(player);
const angle = Math.atan2(direction.x, direction.z);

player.rotation.y = angle;
```

---

## 3D에서 자주 쓰는 패턴

### 진자 운동 (Pendulum)
```typescript
let t = 0;
engine.runRenderLoop(() => {
  t += 0.05;
  mesh.rotation.z = Math.sin(t) * 0.5; // ±0.5 라디안 진동
  scene.render();
});
```

### 호흡 효과 (Breathing / Pulsing)
```typescript
let t = 0;
engine.runRenderLoop(() => {
  t += 0.03;
  const scale = 1 + Math.sin(t) * 0.1; // 0.9 ~ 1.1 사이 진동
  mesh.scaling.setAll(scale);
  scene.render();
});
```

### 나선형 이동 (Spiral)
```typescript
let t = 0;
engine.runRenderLoop(() => {
  t += 0.02;
  mesh.position.x = Math.cos(t) * t * 0.1;
  mesh.position.z = Math.sin(t) * t * 0.1;
  mesh.position.y = t * 0.05;
  scene.render();
});
```

### 카메라 방향 → 이동 벡터
```typescript
// 캐릭터가 바라보는 방향으로 이동
const angle = mesh.rotation.y;
const speed = 0.1;

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
| 거리 | `Math.sqrt(dx²+dy²+dz²)` | 두 점 거리 |

---

## 다음 단계

→ [02. 그래픽스 이론](../../02-graphics-theory)
