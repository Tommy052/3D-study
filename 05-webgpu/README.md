# 05. WebGPU

WebGPU는 WebGL의 후계자로, 현대 GPU API(Vulkan, Metal, DirectX 12)의 개념을 웹에 가져온다.
더 낮은 오버헤드, 더 명시적인 제어, 컴퓨트 셰이더 지원이 특징이다.

---

## 목차

### 기초 (Basics)
| # | 주제 | 설명 |
|---|------|------|
| [01](./01-basics/01-device-setup) | Device 셋업 | Adapter → Device → Canvas Context |
| [02](./01-basics/02-hello-triangle) | Hello Triangle | 첫 삼각형 렌더링 |
| [03](./01-basics/03-vertex-buffer) | Vertex Buffer | GPU 메모리에 정점 업로드 |
| [04](./01-basics/04-wgsl-intro) | WGSL 연동 | WGSL 셰이더 작성 및 연결 |

### 중급 (Intermediate)
| # | 주제 | 설명 |
|---|------|------|
| [01](./02-intermediate/01-uniform-buffer) | Uniform Buffer | MVP 행렬 전달 |
| [02](./02-intermediate/02-texture) | 텍스처 | 이미지 매핑 |
| [03](./02-intermediate/03-depth-stencil) | Depth & Stencil | 깊이 테스트, 스텐실 |
| [04](./02-intermediate/04-compute-shader) | Compute Shader | GPU 병렬 연산 |

### 고급 (Advanced)
| # | 주제 | 설명 |
|---|------|------|
| [01](./03-advanced/01-instancing) | GPU Instancing | 같은 메쉬 수천 개 효율적 렌더링 |
| [02](./03-advanced/02-render-pipeline) | 렌더 파이프라인 | 커스텀 파이프라인 구성 |
| [03](./03-advanced/03-post-processing) | 포스트 프로세싱 | 화면 전체 효과 |

---

## WebGPU 초기화 흐름

```typescript
// 1. GPU Adapter 요청
const adapter = await navigator.gpu.requestAdapter();

// 2. Device 생성
const device = await adapter!.requestDevice();

// 3. Canvas Context 설정
const context = canvas.getContext('webgpu')!;
context.configure({ device, format: navigator.gpu.getPreferredCanvasFormat() });

// 4. 렌더 파이프라인 생성
const pipeline = device.createRenderPipeline({ ... });

// 5. 커맨드 인코더로 렌더
const encoder = device.createCommandEncoder();
const pass = encoder.beginRenderPass({ ... });
pass.setPipeline(pipeline);
pass.draw(3);
pass.end();
device.queue.submit([encoder.finish()]);
```

---

## WebGL vs WebGPU

| 항목 | WebGL | WebGPU |
|------|-------|--------|
| 기반 | OpenGL ES | Vulkan / Metal / DX12 |
| 컴퓨트 셰이더 | 미지원 | 지원 |
| 멀티스레드 | 제한적 | Worker 지원 |
| 상태 관리 | 전역 상태 기계 | 명시적 파이프라인 |
| 셰이더 언어 | GLSL | WGSL |
| 브라우저 지원 | 전체 | Chrome/Edge (2023~) |

---

## 브라우저 지원 확인

```typescript
if (!navigator.gpu) {
  throw new Error('WebGPU를 지원하지 않는 브라우저입니다.');
}
```

> Chrome 113+, Edge 113+에서 기본 활성화
