# 04. PBR (Physically Based Rendering)

물리 법칙에 기반한 렌더링 모델.
어떤 조명 환경에서도 일관된 결과를 만들고, Phong보다 훨씬 현실적이다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![CMU 15-462 PBR](https://img.youtube.com/vi/tFx1MaIb9cg/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Material Modeling & PBR**<br>BRDF, 에너지 보존, 미세면 이론<br>⏱ 80분 · 🎓 Carnegie Mellon University |
| [![Branch Education](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) | **How do Video Game Graphics Work?**<br>PBR이 게임 그래픽에서 어떻게 쓰이는지<br>⏱ 23분 · 🎓 Branch Education |

> 📖 텍스트 레퍼런스: [LearnOpenGL — PBR Theory](https://learnopengl.com/PBR/Theory) · [Marmoset — Basic Theory of PBR](https://marmoset.co/posts/basic-theory-of-physically-based-rendering/) · [PBRT Book](https://pbr-book.org/)

---

## 핵심 파라미터

### Metallic (금속성) — 0 ~ 1
```
0 = 비금속 (플라스틱, 나무, 피부)
    → 빛이 산란됨, 반사 색상 = 흰색/회색

1 = 금속 (철, 금, 알루미늄)
    → 빛이 거의 반사됨, 반사 색상 = 베이스 색상 그대로
```

### Roughness (거칠기) — 0 ~ 1
```
0 = 매우 매끄러움 (거울, 유리)
    → 하이라이트 작고 선명

1 = 매우 거칠음 (시멘트, 돌)
    → 하이라이트 크고 퍼짐
```

---

## 머티리얼 파라미터 예시

| 재질 | Metallic | Roughness |
|------|----------|-----------|
| 금 | 1.0 | 0.1 |
| 녹슨 철 | 0.7 | 0.8 |
| 플라스틱 | 0.0 | 0.3 |
| 나무 | 0.0 | 0.9 |
| 거울 | 0.0 | 0.0 |
| 피부 | 0.0 | 0.6 |

---

## BRDF 개요

```
f(l, v) = 산란항(Diffuse) + 반사항(Specular)

반사항 = (D × F × G) / (4 × (n·l) × (n·v))

D = 법선 분포 함수  → 거칠기에 따라 하이라이트 분포
F = 프레넬 방정식  → 각도에 따른 반사율 변화
G = 기하학 함수    → 미세면의 자기 그림자 처리
```

### 프레넬 효과 (Fresnel)
```
물체를 비스듬히 볼수록 반사율이 높아지는 현상

물 표면:
  - 정면 → 투명 (낮은 반사)
  - 측면 → 거울처럼 반사 (높은 반사)
```

---

## Babylon.js에서 PBR

```typescript
import { PBRMaterial, Texture, Color3 } from '@babylonjs/core';

const pbr = new PBRMaterial('pbr', scene);

pbr.albedoColor    = new Color3(0.8, 0.2, 0.2);
pbr.metallic       = 0.0;
pbr.roughness      = 0.5;
pbr.albedoTexture  = new Texture('/textures/albedo.png', scene);
pbr.bumpTexture    = new Texture('/textures/normal.png', scene);

// IBL — 환경 반사
scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
  '/textures/environment.env', scene
);

mesh.material = pbr;
```

---

## 다음 단계

→ [05. 그림자 (Shadow)](../05-shadow)
