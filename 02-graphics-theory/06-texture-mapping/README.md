# 06. 텍스처 매핑 (Texture Mapping)

2D 이미지를 3D 표면에 붙이는 기술.
UV 좌표로 이미지의 어느 부분이 메쉬의 어느 부분에 매핑될지 정의한다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![CMU 15-462 Texture](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Texture Mapping**<br>UV 좌표, Mipmap, Filtering, Wrapping 이론<br>⏱ 80분 · 🎓 Carnegie Mellon University |
| [![Branch Education](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) | **How do Video Game Graphics Work?**<br>텍스처가 렌더링 파이프라인에서 사용되는 과정<br>⏱ 23분 · 🎓 Branch Education |

> 📖 텍스트 레퍼런스: [LearnOpenGL — Textures](https://learnopengl.com/Getting-started/Textures)

---

## UV 좌표

```
(0,0) ─────── (1,0)
  │               │
  │   이미지      │
  │               │
(0,1) ─────── (1,1)

U = 가로 (0~1)
V = 세로 (0~1)
```

> 메쉬의 각 정점은 (u, v) 좌표를 가지며, 이 좌표가 이미지의 픽셀과 매핑됨

---

## Wrapping Mode

| 모드 | 설명 |
|------|------|
| `REPEAT` | 이미지를 타일처럼 반복 |
| `CLAMP` | 가장자리 색상 유지 |
| `MIRROR` | 반사되며 반복 |

---

## Filtering (필터링)

텍스처를 확대/축소할 때 픽셀을 어떻게 보간할지:

```
Nearest  → 가장 가까운 픽셀 (픽셀 아트, 선명한 경계)
Linear   → 주변 픽셀 평균 (부드러운 보간)
Trilinear → Mipmap 레벨 간도 보간 (가장 부드럽고 비쌈)
```

---

## Mipmap

거리에 따라 적절한 해상도의 텍스처 사용 → 앨리어싱 방지 + 성능 향상.

```
원본: 1024×1024
mip 1: 512×512
mip 2: 256×256
...
mip 10: 1×1
```

---

## 텍스처 종류

| 종류 | 역할 |
|------|------|
| Albedo (Diffuse) | 기본 색상 |
| Normal Map | 표면 굴곡 (가짜) |
| Metallic | 금속성 맵 |
| Roughness | 거칠기 맵 |
| AO (Ambient Occlusion) | 틈새 어두움 효과 |
| Emissive | 자체 발광 |
| Height Map | 실제 지형 변위 |

---

## Babylon.js에서 텍스처

```typescript
import { PBRMaterial, Texture } from '@babylonjs/core';

const pbr = new PBRMaterial('pbr', scene);
pbr.albedoTexture      = new Texture('/textures/albedo.png', scene);
pbr.bumpTexture        = new Texture('/textures/normal.png', scene);
pbr.metallicTexture    = new Texture('/textures/metallic.png', scene);

// 타일 반복
pbr.albedoTexture.uScale = 4;
pbr.albedoTexture.vScale = 4;
```

---

## 다음 단계

→ [07. 노멀맵 (Normal Map)](../07-normal-map)
