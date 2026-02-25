# Babylon.js Scene 셋업

Babylon.js의 기본 구성 요소: Engine, Scene, Camera, Light.

---

## 관련 강의

| | |
|---|---|
| [![Wael Yasmina — Babylon.js for Absolute Beginners](https://img.youtube.com/vi/e6EkrLr8g_o/mqdefault.jpg)](https://www.youtube.com/watch?v=e6EkrLr8g_o) | [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) |
| **Wael Yasmina** — Engine·Scene·Camera·Light 전체 셋업 실습 | **CMU 15-462** — 카메라 모델·조명 이론 |

> **공식 가이드**: [Babylon.js — Getting Started](https://doc.babylonjs.com/features/introductionToFeatures/chap1/first_app) · [Playground 예제](https://playground.babylonjs.com/)

---

## 필수 구성 요소

```
Engine  → WebGL/WebGPU 렌더링 컨텍스트 관리
Scene   → 모든 3D 객체의 컨테이너
Camera  → 시점 정의
Light   → 조명 (없으면 모든 것이 검음)
Mesh    → 3D 물체
```

---

## 설치

```bash
npm install @babylonjs/core
```

---

## 기본 씬 구성

```typescript
// src/main.ts
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  Vector3,
  Color3,
  ShadowGenerator,
} from '@babylonjs/core';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// 1. Engine 생성
const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

// 2. Scene 생성
const scene = new Scene(engine);
scene.clearColor.set(0.1, 0.1, 0.2, 1); // 배경색

// 3. Camera 생성
// ArcRotateCamera: 대상을 중심으로 공전하는 카메라
const camera = new ArcRotateCamera(
  'camera',
  -Math.PI / 2,  // 수평 각도 (알파)
  Math.PI / 3,   // 수직 각도 (베타)
  8,             // 거리 (반지름)
  Vector3.Zero(), // 바라볼 대상
  scene
);
camera.attachControl(canvas, true); // 마우스로 조작 가능

// 카메라 거리 제한
camera.lowerRadiusLimit = 2;
camera.upperRadiusLimit = 20;

// 4. 조명 생성
const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
hemiLight.intensity = 0.4;
hemiLight.groundColor = new Color3(0.2, 0.2, 0.2);

const dirLight = new DirectionalLight('dir', new Vector3(-2, -3, -1), scene);
dirLight.intensity = 0.8;
dirLight.position = new Vector3(5, 10, 5);

// 5. 메쉬 생성
const box = MeshBuilder.CreateBox('box', { size: 1 }, scene);
box.position.y = 0.5;

const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene);

// 6. 그림자 설정
const shadowGen = new ShadowGenerator(1024, dirLight);
shadowGen.addShadowCaster(box);
ground.receiveShadows = true;

// 7. 렌더 루프 시작
engine.runRenderLoop(() => {
  scene.render();
});

// 8. 리사이즈 대응
window.addEventListener('resize', () => engine.resize());
```

---

## 카메라 종류

| 카메라 | 설명 | 사용 사례 |
|--------|------|---------|
| `ArcRotateCamera` | 대상 중심 공전 | 3D 뷰어, 상품 전시 |
| `FreeCamera` | 자유 이동 (WASD) | FPS 게임, 탐험 |
| `FollowCamera` | 대상을 따라다님 | TPS 게임 |
| `UniversalCamera` | 터치/마우스/키보드 통합 | 모바일 게임 |

---

## Scene의 주요 이벤트

```typescript
// 매 프레임 전에 실행
scene.onBeforeRenderObservable.add(() => {
  box.rotation.y += 0.01;
});

// 메쉬 클릭
scene.onPointerObservable.add((pointerInfo) => {
  if (pointerInfo.type === PointerEventTypes.POINTERPICK) {
    console.log('클릭된 메쉬:', pointerInfo.pickInfo?.pickedMesh?.name);
  }
});
```

---

## 실행 방법

```bash
cp -r ../../_template ./
npm install @babylonjs/core
npm run dev
```

---

## 다음 단계

→ [02. 메쉬 (Mesh)](../02-mesh)
