# 애니메이션 (Animation)

Babylon.js에서 물체를 움직이는 방법.

---

## 관련 강의

| | |
|---|---|
| [![Wael Yasmina — Babylon.js for Absolute Beginners](https://img.youtube.com/vi/e6EkrLr8g_o/mqdefault.jpg)](https://www.youtube.com/watch?v=e6EkrLr8g_o) | [![CMU 15-462 — Animation](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) |
| **Wael Yasmina** — 렌더 루프·키프레임 애니메이션 실습 | **CMU 15-462** — 보간·이징·애니메이션 이론 |

> **공식 문서**: [Babylon.js — Animations](https://doc.babylonjs.com/features/featuresDeepDive/animation) · [AnimationGroup API](https://doc.babylonjs.com/typedoc/classes/BABYLON.AnimationGroup)

---

## 렌더 루프를 이용한 애니메이션

```typescript
let angle = 0;

scene.onBeforeRenderObservable.add(() => {
  angle += engine.getDeltaTime() * 0.001; // 프레임 독립적
  box.rotation.y = angle;
});
```

---

## 키프레임 애니메이션

```typescript
import { Animation } from '@babylonjs/core';

// 애니메이션 정의
const anim = new Animation(
  'rotateY',              // 이름
  'rotation.y',          // 대상 속성
  30,                    // FPS
  Animation.ANIMATIONTYPE_FLOAT,
  Animation.ANIMATIONLOOPMODE_CYCLE, // 반복
);

// 키프레임 설정
anim.setKeys([
  { frame: 0,  value: 0 },
  { frame: 30, value: Math.PI },
  { frame: 60, value: Math.PI * 2 },
]);

// 메쉬에 적용
mesh.animations.push(anim);
scene.beginAnimation(mesh, 0, 60, true); // 루프 재생
```

---

## Easing (이징)

```typescript
import { CubicEase, EasingFunction } from '@babylonjs/core';

const easing = new CubicEase();
easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
anim.setEasingFunction(easing);
```

---

## Animation Groups

여러 메쉬의 애니메이션을 동시 제어.

```typescript
const group = new AnimationGroup('myGroup', scene);
group.addTargetedAnimation(anim1, mesh1);
group.addTargetedAnimation(anim2, mesh2);

group.play(true); // 루프 재생
group.pause();
group.stop();
```

---

## glTF 모델 내장 애니메이션 재생

```typescript
import { SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // glTF 로더 등록

const result = await SceneLoader.ImportMeshAsync('', '/models/', 'character.glb', scene);

// 모델에 포함된 애니메이션 그룹
const animGroups = result.animationGroups;
animGroups[0].play(true); // 첫 번째 애니메이션 루프 재생
```

---

## 다음 단계

→ [02. 중급 — 물리 엔진](../../02-intermediate/01-physics)
