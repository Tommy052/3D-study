# 04. PBR (Physically Based Rendering)

물리 법칙에 기반한 렌더링 모델.
Phong 조명보다 훨씬 현실적인 결과를 만든다.

---

## PBR이 필요한 이유

Phong 조명의 한계:
- 메탈과 플라스틱이 비슷하게 보임
- 조명 환경이 바뀌면 머티리얼을 다시 튜닝해야 함
- 에너지 보존 법칙 위반 (반사가 입사보다 밝아질 수 있음)

PBR의 장점:
- 어떤 조명 환경에서도 일관성 있게 보임
- 직관적인 파라미터 (Metallic, Roughness)
- 에너지 보존 보장

---

## 핵심 파라미터

### Metallic (금속성) — 0 ~ 1

```
0 = 비금속 (플라스틱, 나무, 피부)
    빛이 표면을 투과하고 산란됨
    반사 색상 = 흰색/회색

1 = 금속 (철, 금, 알루미늄)
    빛이 거의 반사됨 (흡수 없음)
    반사 색상 = 베이스 색상 그대로
```

### Roughness (거칠기) — 0 ~ 1

```
0 = 매우 매끄러움 (거울, 유리)
    하이라이트가 작고 선명

1 = 매우 거칠음 (시멘트, 돌)
    하이라이트가 크고 퍼짐 (or 없음)
```

### Albedo (기본 색상)

물체의 고유 색상 (조명 영향 받기 전).

---

## PBR 수식 개요

### BRDF (Bidirectional Reflectance Distribution Function)

```
f(l, v) = 산란항 + 반사항

산란항 (Diffuse):  f_d = albedo / π
반사항 (Specular): f_s = (D * F * G) / (4 * (n·l) * (n·v))

D = 법선 분포 함수 (Normal Distribution Function) → 거칠기 기반
F = 프레넬 방정식 (Fresnel Equation) → 각도에 따른 반사율
G = 기하학 함수 (Geometry Function) → 자기 그림자
```

### 프레넬 효과 (Fresnel Effect)

```
물체를 비스듬히 볼수록 반사율이 높아지는 현상

예: 물 표면
  - 정면에서 보면 투명 (낮은 반사율)
  - 옆에서 보면 거울처럼 반사 (높은 반사율)

F = F0 + (1 - F0) * (1 - dot(viewDir, halfwayDir))^5
```

---

## Babylon.js에서 PBR 사용

```typescript
import { PBRMaterial, Texture, Color3 } from '@babylonjs/core';

const mat = new PBRMaterial('pbr', scene);

// 기본 색상 (Albedo)
mat.albedoColor = new Color3(0.8, 0.2, 0.2);
// 또는 텍스처
mat.albedoTexture = new Texture('/textures/albedo.png', scene);

// 금속성 (0: 비금속, 1: 금속)
mat.metallic = 0.0;

// 거칠기 (0: 매끄러움, 1: 거침)
mat.roughness = 0.5;

// 노멀맵 (표면 굴곡)
mat.bumpTexture = new Texture('/textures/normal.png', scene);

// 환경 반사 (IBL — Image Based Lighting)
scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
  '/textures/environment.env', scene
);

mesh.material = mat;
```

---

## IBL (Image Based Lighting)

PBR의 환경 조명은 HDR 큐브맵을 사용해 주변 환경을 반사에 반영한다.

```typescript
// HDR 환경맵 로드
const envTexture = CubeTexture.CreateFromPrefilteredData(
  'environment.env',
  scene
);
scene.environmentTexture = envTexture;
scene.environmentIntensity = 1.0;
```

---

## 머티리얼 예시

| 재질 | Metallic | Roughness |
|------|----------|-----------|
| 금 | 1.0 | 0.1 |
| 철 (녹슨) | 0.7 | 0.8 |
| 플라스틱 | 0.0 | 0.3 |
| 나무 | 0.0 | 0.9 |
| 거울 | 0.0 | 0.0 |
| 피부 | 0.0 | 0.6 |

---

## 다음 단계

→ [05. 그림자 (Shadow)](../05-shadow)
