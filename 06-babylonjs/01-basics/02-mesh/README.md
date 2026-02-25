# 메쉬 (Mesh)

Babylon.js에서 3D 물체를 만드는 방법.

---

## 관련 강의

| | |
|---|---|
| [![Wael Yasmina — Babylon.js for Absolute Beginners](https://img.youtube.com/vi/e6EkrLr8g_o/mqdefault.jpg)](https://www.youtube.com/watch?v=e6EkrLr8g_o) | [![Branch Education — How do Graphics Cards Work?](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) |
| **Wael Yasmina** — MeshBuilder로 도형 생성, 위치·회전·크기 제어 | **Branch Education** — 메쉬 데이터가 GPU에서 처리되는 원리 |

> **공식 문서**: [Babylon.js — Meshes](https://doc.babylonjs.com/features/featuresDeepDive/mesh) · [MeshBuilder API](https://doc.babylonjs.com/typedoc/classes/BABYLON.MeshBuilder)

---

## 기본 도형 (MeshBuilder)

```typescript
import { MeshBuilder, Vector3 } from '@babylonjs/core';

// 박스
const box = MeshBuilder.CreateBox('box', {
  width: 1, height: 2, depth: 1,
}, scene);

// 구
const sphere = MeshBuilder.CreateSphere('sphere', {
  diameter: 2,
  segments: 32, // 세그먼트 수 (높을수록 매끄러움)
}, scene);

// 지면
const ground = MeshBuilder.CreateGround('ground', {
  width: 10, height: 10,
  subdivisions: 4,
}, scene);

// 원기둥
const cylinder = MeshBuilder.CreateCylinder('cyl', {
  height: 2, diameter: 1,
  tessellation: 24, // 측면 분할 수
}, scene);

// 토러스 (도넛)
const torus = MeshBuilder.CreateTorus('torus', {
  diameter: 2, thickness: 0.5,
  tessellation: 32,
}, scene);

// 선
const lines = MeshBuilder.CreateLines('lines', {
  points: [
    new Vector3(0, 0, 0),
    new Vector3(1, 1, 0),
    new Vector3(2, 0, 0),
  ],
}, scene);
```

---

## 메쉬 Transform

```typescript
// 위치
mesh.position = new Vector3(1, 2, 3);
mesh.position.x = 5;

// 회전 (라디안)
mesh.rotation = new Vector3(0, Math.PI / 4, 0);
mesh.rotation.y += 0.01; // 매 프레임 회전

// 쿼터니언 회전
mesh.rotationQuaternion = Quaternion.RotationAxis(Vector3.Up(), Math.PI / 4);

// 크기
mesh.scaling = new Vector3(2, 1, 2);
mesh.scaling.setAll(3); // 균등 스케일
```

---

## 메쉬 복제 (Clone / Instance)

```typescript
// Clone: 독립적인 복사본 (머티리얼도 복사)
const clone = mesh.clone('clone');
clone.position.x = 3;

// Instance: GPU Instancing (성능 최적화)
const instance1 = mesh.createInstance('inst1');
const instance2 = mesh.createInstance('inst2');
instance1.position.x = 3;
instance2.position.x = -3;
```

> `createInstance()`는 내부적으로 WebGL의 `drawElementsInstanced()`를 사용 — 같은 메쉬 수백 개를 Draw Call 1번으로 처리

---

## 부모-자식 관계

```typescript
const parent = MeshBuilder.CreateBox('parent', {}, scene);
const child  = MeshBuilder.CreateBox('child', { size: 0.5 }, scene);

child.parent = parent;
child.position = new Vector3(1.5, 0, 0); // 부모 기준 로컬 좌표

// 부모를 움직이면 자식도 같이 움직임
parent.rotation.y += 0.01;
```

---

## 다음 단계

→ [03. 머티리얼 (Material)](../03-material)
