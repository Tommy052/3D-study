# 02. 래스터화 (Rasterization)

삼각형(벡터 데이터)을 픽셀(래스터 데이터)로 변환하는 과정.
GPU가 가장 잘하는 일이다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![CMU 15-462 Rasterization](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Rasterization & Sampling**<br>래스터화 알고리즘, 샘플링, 앤티앨리어싱<br>⏱ 80분 · 🎓 Carnegie Mellon University |
| [![Branch Education Pipeline](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) | **How do Video Game Graphics Work?**<br>삼각형이 픽셀로 변환되는 과정을 시각적으로 설명<br>⏱ 23분 · 🎓 Branch Education |

> 📋 [CMU 15-462 전체 플레이리스트](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E)

---

## 개념

```
삼각형의 세 정점:
  A = (100, 50)
  B = (200, 200)
  C = (50, 200)

→ 삼각형 내부의 모든 픽셀을 찾아야 함
→ 찾은 픽셀마다 색상(프래그먼트 셰이더) 계산
```

---

## 무게중심 좌표 (Barycentric Coordinates)

삼각형 내부 픽셀의 값을 보간하는 방법.

```
삼각형 ABC에서 임의의 점 P:
P = α*A + β*B + γ*C

조건: α + β + γ = 1, 모두 0 이상이면 삼각형 내부
```

**활용 — UV 보간:**
```
정점 A의 UV = (0, 0)
정점 B의 UV = (1, 0)
정점 C의 UV = (0, 1)

픽셀 P에서 α=0.5, β=0.3, γ=0.2
P의 UV = 0.5*(0,0) + 0.3*(1,0) + 0.2*(0,1) = (0.3, 0.2)
```

---

## Z-Buffer (깊이 버퍼)

같은 픽셀에 여러 삼각형이 겹칠 때, 가장 앞에 있는 것만 그림.

```
각 픽셀마다 깊이값(z) 저장
새 삼각형의 z < 저장된 z → 덮어쓰기 (더 가까움)
새 삼각형의 z > 저장된 z → 무시 (더 멀음)
```

---

## 앤티앨리어싱 (Anti-Aliasing)

삼각형 경계의 계단 현상 제거.

```
MSAA: 픽셀 내 여러 샘플로 가장자리 부드럽게
FXAA: 포스트프로세싱으로 빠르게 처리
TAA:  시간 축 여러 프레임 샘플 활용
```

---

## 클리핑 & 백페이스 컬링

```
Frustum Culling: 카메라 시야 밖 삼각형 제거 (Near/Far/Left/Right Plane)

Backface Culling: 뒤를 향한 면 제거
  반시계 방향 정점 = 앞면 (렌더)
  시계 방향 정점   = 뒷면 (제거)
```

```typescript
// Babylon.js
mat.backFaceCulling = true;  // 기본값 (성능 최적화)
mat.backFaceCulling = false; // 양면 렌더링 (얇은 면, 풀 등)
```

---

## 다음 단계

→ [03. 조명 모델 (Lighting Model)](../03-lighting-model)
