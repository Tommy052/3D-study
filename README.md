# 3D Study

수학 기초부터 WebGPU, Babylon.js까지 — 대학 강의 커리큘럼 스타일의 3D 그래픽스 학습 레포지토리

---

## 커리큘럼

| 단계 | 폴더 | 주제 | 설명 |
|------|------|------|------|
| 1 | [01-math](./01-math) | 수학 기초 | 벡터, 행렬, 변환, 쿼터니언 |
| 2 | [02-graphics-theory](./02-graphics-theory) | 그래픽스 이론 | 렌더링 파이프라인, 조명, PBR |
| 3 | [03-shader](./03-shader) | 셰이더 언어 | GLSL, WGSL |
| 4 | [04-webgl](./04-webgl) | WebGL | 저수준 렌더링 직접 구현 |
| 5 | [05-webgpu](./05-webgpu) | WebGPU | 차세대 GPU API |
| 6 | [06-babylonjs](./06-babylonjs) | Babylon.js | 고수준 3D 프레임워크 |

---

## 학습 흐름

```
[1] 수학 기초
  벡터 → 행렬 → 변환행렬 → 좌표계 → 쿼터니언
        ↓
[2] 그래픽스 이론
  렌더링 파이프라인 → 래스터화 → 조명 → PBR → 텍스처
        ↓
[3] 셰이더 언어
  GLSL 기초 → WGSL 기초
        ↓
[4] WebGL (저수준 직접 구현)
  삼각형 → 버퍼 → MVP 행렬 → 조명 직접 구현
        ↓
[5] WebGPU (차세대 저수준 API)
  Device 셋업 → 파이프라인 → 컴퓨트 셰이더
        ↓
[6] Babylon.js (고수준 프레임워크)
  위 내용을 다 이해한 뒤, 왜 편한지 체감하며 사용
```

---

## 목차

### 01. 수학 기초 (Math Fundamentals)

- [01 벡터 (Vector)](./01-math/01-vector)
- [02 행렬 (Matrix)](./01-math/02-matrix)
- [03 변환 행렬 (Transform Matrix)](./01-math/03-transform-matrix)
- [04 좌표계 (Coordinate System)](./01-math/04-coordinate-system)
- [05 쿼터니언 (Quaternion)](./01-math/05-quaternion)
- [06 삼각함수 (Trigonometry)](./01-math/06-trigonometry)

### 02. 그래픽스 이론 (Graphics Theory)

- [01 렌더링 파이프라인 (Rendering Pipeline)](./02-graphics-theory/01-rendering-pipeline)
- [02 래스터화 (Rasterization)](./02-graphics-theory/02-rasterization)
- [03 조명 모델 (Lighting Model)](./02-graphics-theory/03-lighting-model)
- [04 물리 기반 렌더링 PBR](./02-graphics-theory/04-pbr)
- [05 그림자 (Shadow)](./02-graphics-theory/05-shadow)
- [06 텍스처 매핑 (Texture Mapping)](./02-graphics-theory/06-texture-mapping)
- [07 노멀맵 (Normal Map)](./02-graphics-theory/07-normal-map)
- [08 색공간 (Color Space)](./02-graphics-theory/08-color-space)

### 03. 셰이더 (Shader)

- **GLSL (WebGL용)**
  - [01 버텍스 셰이더](./03-shader/01-glsl-basics/01-vertex-shader)
  - [02 프래그먼트 셰이더](./03-shader/01-glsl-basics/02-fragment-shader)
  - [03 Uniform & Varying](./03-shader/01-glsl-basics/03-uniforms-varyings)
- **WGSL (WebGPU용)**
  - [01 문법](./03-shader/02-wgsl-basics/01-syntax)
  - [02 버텍스 셰이더](./03-shader/02-wgsl-basics/02-vertex-shader)
  - [03 컴퓨트 셰이더](./03-shader/02-wgsl-basics/03-compute-shader)

### 04. WebGL

- [01 Hello Triangle](./04-webgl/01-hello-triangle)
- [02 버퍼 (VBO, EBO)](./04-webgl/02-buffer)
- [03 MVP 행렬](./04-webgl/03-mvp-matrix)
- [04 텍스처](./04-webgl/04-texture)
- [05 조명 직접 구현](./04-webgl/05-lighting)

### 05. WebGPU

- **기초**
  - [01 Device 셋업](./05-webgpu/01-basics/01-device-setup)
  - [02 Hello Triangle](./05-webgpu/01-basics/02-hello-triangle)
  - [03 Vertex Buffer](./05-webgpu/01-basics/03-vertex-buffer)
  - [04 WGSL 연동](./05-webgpu/01-basics/04-wgsl-intro)
- **중급**
  - [01 Uniform Buffer (MVP 행렬)](./05-webgpu/02-intermediate/01-uniform-buffer)
  - [02 텍스처](./05-webgpu/02-intermediate/02-texture)
  - [03 Depth & Stencil Buffer](./05-webgpu/02-intermediate/03-depth-stencil)
  - [04 Compute Shader](./05-webgpu/02-intermediate/04-compute-shader)
- **고급**
  - [01 GPU Instancing](./05-webgpu/03-advanced/01-instancing)
  - [02 커스텀 렌더 파이프라인](./05-webgpu/03-advanced/02-render-pipeline)
  - [03 포스트 프로세싱](./05-webgpu/03-advanced/03-post-processing)

### 06. Babylon.js

- **기초**
  - [01 Scene 셋업](./06-babylonjs/01-basics/01-scene-setup)
  - [02 메쉬 (Mesh)](./06-babylonjs/01-basics/02-mesh)
  - [03 머티리얼 (Material)](./06-babylonjs/01-basics/03-material)
  - [04 애니메이션](./06-babylonjs/01-basics/04-animation)
- **중급**
  - [01 물리 엔진 (Havok)](./06-babylonjs/02-intermediate/01-physics)
  - [02 파티클 시스템](./06-babylonjs/02-intermediate/02-particle)
  - [03 모델 로딩 (glTF)](./06-babylonjs/02-intermediate/03-model-loading)
  - [04 GUI](./06-babylonjs/02-intermediate/04-gui)
- **고급**
  - [01 커스텀 셰이더](./06-babylonjs/03-advanced/01-custom-shader)
  - [02 WebGPU 엔진](./06-babylonjs/03-advanced/02-webgpu-engine)
  - [03 성능 최적화](./06-babylonjs/03-advanced/03-optimization)

---

## 개발 환경

- **언어**: TypeScript
- **번들러**: Vite
- **예제 템플릿**: [_template](./_template)

### 예제 실행 방법

```bash
# 1. 템플릿을 원하는 예제 폴더로 복사
cp -r _template 06-babylonjs/01-basics/01-scene-setup

# 2. 폴더 이동
cd 06-babylonjs/01-basics/01-scene-setup

# 3. 의존성 설치
npm install

# 4. 개발 서버 시작
npm run dev
```

---

## 참고 자료

- [Babylon.js 공식 문서](https://doc.babylonjs.com/)
- [WebGPU 스펙](https://gpuweb.github.io/gpuweb/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [3Blue1Brown - 선형대수학](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)
