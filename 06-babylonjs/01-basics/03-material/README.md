# 머티리얼 (Material)

메쉬의 겉모습을 정의하는 컴포넌트.

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

```typescript
import { PBRMaterial, Texture } from '@babylonjs/core';

const pbr = new PBRMaterial('pbr', scene);
pbr.albedoColor = new Color3(0.5, 0.5, 0.5);
pbr.metallic    = 0.0;  // 0: 비금속, 1: 금속
pbr.roughness   = 0.5;  // 0: 매끄러움, 1: 거침

pbr.albedoTexture      = new Texture('/textures/albedo.png', scene);
pbr.bumpTexture        = new Texture('/textures/normal.png', scene);
pbr.metallicTexture    = new Texture('/textures/metallic.png', scene);
pbr.ambientTexture     = new Texture('/textures/ao.png', scene);

mesh.material = pbr;
```

---

## 와이어프레임

```typescript
mat.wireframe = true;
```

---

## 다음 단계

→ [04. 애니메이션](../04-animation)
