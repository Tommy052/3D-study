# 06. Babylon.js

앞 단계에서 배운 수학·이론·저수준 API를 바탕으로,
Babylon.js가 얼마나 많은 것을 추상화해주는지 체감하며 배운다.

---

## 목차

### 기초 (Basics)
| # | 주제 | 설명 |
|---|------|------|
| [01](./01-basics/01-scene-setup) | Scene 셋업 | Engine, Scene, Camera, Light |
| [02](./01-basics/02-mesh) | 메쉬 (Mesh) | 기본 도형, 커스텀 메쉬 |
| [03](./01-basics/03-material) | 머티리얼 | StandardMaterial, PBRMaterial |
| [04](./01-basics/04-animation) | 애니메이션 | 키프레임, 렌더 루프 |

### 중급 (Intermediate)
| # | 주제 | 설명 |
|---|------|------|
| [01](./02-intermediate/01-physics) | 물리 엔진 | Havok 물리, 충돌 감지 |
| [02](./02-intermediate/02-particle) | 파티클 시스템 | 불, 연기, 파티클 이펙트 |
| [03](./02-intermediate/03-model-loading) | 모델 로딩 | glTF / GLB 파일 로드 |
| [04](./02-intermediate/04-gui) | GUI | Babylon GUI, 2D/3D UI |

### 고급 (Advanced)
| # | 주제 | 설명 |
|---|------|------|
| [01](./03-advanced/01-custom-shader) | 커스텀 셰이더 | ShaderMaterial, GLSL |
| [02](./03-advanced/02-webgpu-engine) | WebGPU 엔진 | Babylon.js + WebGPU 백엔드 |
| [03](./03-advanced/03-optimization) | 성능 최적화 | Instancing, LOD, Frustum Culling |

---

## 최소 Scene 구성

```typescript
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// 카메라
const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 5, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// 조명
new HemisphericLight('light', new Vector3(0, 1, 0), scene);

// 메쉬
MeshBuilder.CreateBox('box', { size: 1 }, scene);

// 렌더 루프
engine.runRenderLoop(() => scene.render());
window.addEventListener('resize', () => engine.resize());
```

---

## Babylon.js + WebGPU 엔진 사용

```typescript
import { WebGPUEngine } from '@babylonjs/core';

const engine = new WebGPUEngine(canvas);
await engine.initAsync(); // WebGPU 초기화

const scene = new Scene(engine);
// 이후 동일
```
