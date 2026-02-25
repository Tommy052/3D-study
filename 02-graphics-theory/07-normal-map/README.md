# 07. 노멀맵 (Normal Map)

실제로 폴리곤을 추가하지 않고 표면에 굴곡이 있는 것처럼 보이게 하는 기법.
텍스처에 법선벡터(Normal) 정보를 저장해 조명 계산에 활용한다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![CMU 15-462 Normal](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Texture Mapping & Normal Maps**<br>Tangent Space, 노멀맵 이론과 구현<br>⏱ 80분 · 🎓 Carnegie Mellon University |
| [![Branch Education](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) | **How do Video Game Graphics Work?**<br>노멀맵이 게임 비주얼에 미치는 영향<br>⏱ 23분 · 🎓 Branch Education |

> 📖 텍스트 레퍼런스: [LearnOpenGL — Normal Mapping](https://learnopengl.com/Advanced-Lighting/Normal-Mapping)

---

## 원리

```
기존 조명 계산:
  법선 = 실제 폴리곤 면의 방향 (삼각형 내 모든 픽셀 동일)

노멀맵 적용:
  법선 = 텍스처에서 픽셀별로 읽어온 방향
  → 픽셀마다 다른 법선 → 다른 조명 결과 → 굴곡처럼 보임
```

---

## 노멀맵 색상 해석

```
RGB → XYZ 법선벡터

R = X 성분 (-1~1 → 0~255로 저장)
G = Y 성분
B = Z 성분

보라/파란색 부분: Z가 큼 = 표면이 카메라를 향함 (기본)
붉은/초록 부분:  X/Y가 큼 = 표면이 기울어짐
```

---

## Tangent Space vs World Space

```
Tangent Space (일반적):
  법선이 표면 기준으로 저장됨
  메쉬를 어떻게 배치해도 올바르게 동작 ✅

World Space:
  법선이 월드 좌표 기준으로 저장됨
  메쉬 회전 시 정확도 저하 ❌
```

---

## 버텍스 셰이더에서 TBN 행렬

노멀맵의 Tangent Space를 World Space로 변환하는 행렬.

```glsl
varying mat3 TBN;

void main() {
  vec3 T = normalize(mat3(u_model) * a_tangent);
  vec3 N = normalize(mat3(u_model) * a_normal);
  T = normalize(T - dot(T, N) * N); // Gram-Schmidt 재직교화
  vec3 B = cross(N, T);

  TBN = mat3(T, B, N);
}

// 프래그먼트 셰이더에서
vec3 normalFromMap = texture2D(normalMap, v_uv).rgb * 2.0 - 1.0;
vec3 worldNormal   = normalize(TBN * normalFromMap);
// worldNormal을 조명 계산에 사용
```

---

## Babylon.js에서 노멀맵

```typescript
import { PBRMaterial, Texture } from '@babylonjs/core';

const mat = new PBRMaterial('mat', scene);
mat.bumpTexture        = new Texture('/textures/normal.png', scene);
mat.bumpTexture.level  = 1.5; // 강도 조절 (기본 1.0)

// Y축 방향이 다른 경우 반전
mat.invertNormalMapY = true;
```

---

## Height Map vs Normal Map

| 구분 | Height Map | Normal Map |
|------|-----------|-----------|
| 저장 | 높이값 (흑백) | 법선벡터 (RGB) |
| 런타임 비용 | 변환 필요 | 바로 사용 가능 |
| 용도 | 지형, Parallax | 표면 디테일 |

---

## 다음 단계

→ [08. 색공간 (Color Space)](../08-color-space)
