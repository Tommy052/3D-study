# 02. 그래픽스 이론 (Graphics Theory)

GPU가 3D 장면을 2D 화면에 그려내는 원리를 학습한다.

---

## 추천 강의

### CMU 15-462 — Computer Graphics ⭐ 이 섹션의 핵심 강의

Keenan Crane 교수의 카네기멜론대학 컴퓨터 그래픽스 강의.
수학 → 렌더링 파이프라인 → 셰이더 → 조명 → 애니메이션까지 전체 커리큘럼 커버.

| 영상 | 설명 |
|------|------|
| [![CMU Rasterization](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **Rasterization & Sampling**<br>삼각형이 픽셀로 변환되는 과정<br>🎓 CMU 15-462 |
| [![CMU Transforms](https://img.youtube.com/vi/E3Phj6J287o/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **Spatial Transformations**<br>변환 행렬, 좌표계, MVP 파이프라인<br>🎓 CMU 15-462 |
| [![CMU Lighting](https://img.youtube.com/vi/tFx1MaIb9cg/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **Radiometry & Photometry**<br>빛의 물리학적 특성과 조명 모델<br>🎓 CMU 15-462 |

> 📋 [CMU 15-462 전체 플레이리스트](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) · [공식 강의 사이트](http://15462.courses.cs.cmu.edu/)

---

## 목차

| # | 주제 | 핵심 개념 |
|---|------|----------|
| [01](./01-rendering-pipeline) | 렌더링 파이프라인 | Vertex → Rasterize → Fragment → Output |
| [02](./02-rasterization) | 래스터화 | 삼각형 → 픽셀 변환, Z-Buffer |
| [03](./03-lighting-model) | 조명 모델 | Ambient, Diffuse, Specular (Phong) |
| [04](./04-pbr) | PBR | Metallic, Roughness, 물리 기반 조명 |
| [05](./05-shadow) | 그림자 | Shadow Map, PCF |
| [06](./06-texture-mapping) | 텍스처 매핑 | UV 좌표, Mipmap, Filtering |
| [07](./07-normal-map) | 노멀맵 | 가짜 굴곡으로 디테일 표현 |
| [08](./08-color-space) | 색공간 | sRGB vs Linear, HDR, Tone Mapping |

---

## 렌더링 파이프라인 요약

```
[CPU]  3D 데이터 준비 (Mesh, Material, Light)
  ↓
[GPU]  버텍스 셰이더  → 각 정점의 클립 공간 좌표 계산
  ↓
[GPU]  래스터화       → 삼각형을 픽셀로 분해
  ↓
[GPU]  프래그먼트 셰이더 → 각 픽셀의 최종 색상 계산
  ↓
[화면] 출력 (프레임버퍼)
```
