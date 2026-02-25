# 02. 그래픽스 이론 (Graphics Theory)

GPU가 3D 장면을 2D 화면에 그려내는 원리를 학습한다.
이 섹션을 이해하면 WebGL, WebGPU, Babylon.js 내부 동작이 보이기 시작한다.

---

## 목차

| # | 주제 | 핵심 개념 |
|---|------|----------|
| [01](./01-rendering-pipeline) | 렌더링 파이프라인 | Vertex → Rasterize → Fragment → Output |
| [02](./02-rasterization) | 래스터화 | 삼각형 → 픽셀 변환 |
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
