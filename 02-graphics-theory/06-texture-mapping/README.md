# 06. 텍스처 매핑 (Texture Mapping)

2D 이미지를 3D 표면에 붙이는 기술.
UV 좌표로 이미지의 어느 부분이 메쉬의 어느 부분에 매핑될지 정의한다.

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

UV가 0~1 범위를 벗어날 때 처리 방식:

```
REPEAT  : 이미지를 타일처럼 반복
  u=1.5 → 이미지의 0.5 위치

CLAMP   : 가장자리 색상 유지
  u=1.5 → 이미지의 1.0(가장자리) 위치

MIRROR  : 반사되며 반복
  u=1.5 → 이미지의 0.5 위치 (뒤집힌)
```

---

## Filtering (필터링)

텍스처를 확대하거나 축소할 때 픽셀을 어떻게 보간할지:

```
Nearest (Nearest-Neighbor):
  가장 가까운 픽셀 사용 → 픽셀 아트 느낌, 경계 선명

Linear (Bilinear):
  주변 픽셀을 평균 → 부드럽게 보간

Trilinear:
  Mipmap 레벨 사이도 보간 → 가장 부드럽고 비쌈
```

---

## Mipmap

멀리 있는 물체에 고해상도 텍스처를 쓰면 앨리어싱(계단 현상) 발생.
미리 축소본을 만들어 거리에 따라 적절한 해상도 사용.

```
원본: 1024x1024
mip 1: 512x512
mip 2: 256x256
mip 3: 128x128
...
mip 10: 1x1
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
| Emissive | 자체 발광 색상 |
| Height Map | 실제 지형 변위 |

---

## Babylon.js에서 텍스처

```typescript
import { StandardMaterial, PBRMaterial, Texture } from '@babylonjs/core';

// StandardMaterial
const mat = new StandardMaterial('mat', scene);
mat.diffuseTexture = new Texture('/textures/albedo.png', scene);

// 타일 반복
mat.diffuseTexture.uScale = 4;
mat.diffuseTexture.vScale = 4;

// PBRMaterial
const pbr = new PBRMaterial('pbr', scene);
pbr.albedoTexture   = new Texture('/textures/albedo.png', scene);
pbr.bumpTexture     = new Texture('/textures/normal.png', scene);
pbr.metallicTexture = new Texture('/textures/metallic.png', scene);
```

---

## 다음 단계

→ [07. 노멀맵 (Normal Map)](../07-normal-map)
