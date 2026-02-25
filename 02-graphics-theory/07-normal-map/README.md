# 07. 노멀맵 (Normal Map)

실제로 폴리곤을 추가하지 않고 표면에 굴곡이 있는 것처럼 보이게 하는 기법.
텍스처에 법선벡터(Normal) 정보를 저장해 조명 계산에 활용한다.

---

## 원리

```
기존 조명 계산:
  법선 = 실제 폴리곤 면의 방향 (모든 픽셀 동일)

노멀맵 적용:
  법선 = 텍스처에서 픽셀별로 읽어온 방향
  → 픽셀마다 다른 법선 → 다른 조명 결과 → 굴곡처럼 보임
```

---

## 노멀맵 색상 해석

```
RGB → XYZ 법선벡터

R = X (-1 ~ 1 범위를 0 ~ 255로 저장)
G = Y
B = Z

보라/파란색 부분: Z가 크다 = 표면이 카메라를 향함 (기본)
붉은/초록 부분: X/Y가 크다 = 표면이 기울어짐
```

---

## Tangent Space vs World Space

```
Tangent Space Normal Map (일반적):
  법선이 표면 기준으로 저장됨
  메쉬를 어떻게 배치해도 올바르게 동작

World Space Normal Map:
  법선이 월드 좌표 기준으로 저장됨
  메쉬 회전 시 정확도 저하
  → 잘 쓰이지 않음
```

---

## Babylon.js에서 노멀맵

```typescript
import { PBRMaterial, Texture } from '@babylonjs/core';

const mat = new PBRMaterial('mat', scene);

// 노멀맵 설정 (bumpTexture = 노멀맵)
mat.bumpTexture = new Texture('/textures/normal.png', scene);

// 강도 조절 (1.0이 기본, 높을수록 굴곡 강조)
mat.bumpTexture.level = 1.5;

// 보조: 반전 처리 (소프트웨어마다 Y축 방향이 다를 수 있음)
mat.invertNormalMapX = false;
mat.invertNormalMapY = false;
```

---

## Height Map vs Normal Map

| 구분 | Height Map | Normal Map |
|------|-----------|-----------|
| 저장 | 높이값(흑백) | 법선벡터(RGB) |
| 변환 필요 | 런타임 변환 필요 | 바로 사용 가능 |
| 사용처 | 지형, Parallax | 표면 디테일 |

---

## 다음 단계

→ [08. 색공간 (Color Space)](../08-color-space)
