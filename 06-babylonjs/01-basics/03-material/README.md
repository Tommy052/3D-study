# 머티리얼 (Material)

메쉬의 겉모습을 정의하는 컴포넌트.

---

## 관련 강의

| | |
|---|---|
| [![Wael Yasmina — Babylon.js for Absolute Beginners](https://img.youtube.com/vi/e6EkrLr8g_o/mqdefault.jpg)](https://www.youtube.com/watch?v=e6EkrLr8g_o) | [![Inigo Quilez — Painting a Character with Maths](https://img.youtube.com/vi/8--5LwHRhjk/mqdefault.jpg)](https://www.youtube.com/watch?v=8--5LwHRhjk) |
| **Wael Yasmina** — StandardMaterial·PBRMaterial 실습 | **Inigo Quilez** — PBR이 표현하는 빛·재질·색의 수학적 원리 |

> **공식 문서**: [Babylon.js — Materials](https://doc.babylonjs.com/features/featuresDeepDive/materials) · [PBR 가이드](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/masterPBR)

---

## StandardMaterial

```typescript
import { StandardMaterial, Color3, Texture } from '@babylonjs/core';

const mat = new StandardMaterial('mat', scene);

// 색상
mat.diffuseColor  = new Color3(1, 0, 0);  // 주색 (빨강)
mat.specularColor = new Color3(1, 1, 1);  // 하이라이트
mat.emissiveColor = new Color3(0, 0, 0);  // 자체 발광
mat.ambientColor  = new Color3(0.1, 0.1, 0.1);

// 텍스처
mat.diffuseTexture  = new Texture('/textures/wood.png', scene);
mat.bumpTexture     = new Texture('/textures/normal.png', scene);
mat.specularTexture = new Texture('/textures/spec.png', scene);

// 투명도
mat.alpha = 0.8;
mat.backFaceCulling = false; // 양면 렌더링

mesh.material = mat;
```

---

## PBRMaterial (권장)

물리 기반 렌더링 — 실제 빛의 물리 법칙을 시뮬레이션한다.

```typescript
import { PBRMaterial, Texture } from '@babylonjs/core';

const pbr = new PBRMaterial('pbr', scene);
pbr.albedoColor = new Color3(0.5, 0.5, 0.5);
pbr.metallic    = 0.0;  // 0: 비금속, 1: 금속
pbr.roughness   = 0.5;  // 0: 매끄러움, 1: 거침

pbr.albedoTexture      = new Texture('/textures/albedo.png', scene);
pbr.bumpTexture        = new Texture('/textures/normal.png', scene);
pbr.metallicTexture    = new Texture('/textures/metallic.png', scene);
pbr.ambientTexture     = new Texture('/textures/ao.png', scene);  // Ambient Occlusion

mesh.material = pbr;
```

---

## Metallic / Roughness 조합 예시

| 재질 | metallic | roughness |
|------|----------|-----------|
| 거친 나무 | 0.0 | 0.9 |
| 플라스틱 | 0.0 | 0.4 |
| 닦은 금속 | 1.0 | 0.1 |
| 녹슨 쇠 | 0.8 | 0.8 |
| 유리 | 0.0 | 0.05 |

---

## 와이어프레임

```typescript
mat.wireframe = true;
```

---

## 다음 단계

→ [04. 애니메이션](../04-animation)
