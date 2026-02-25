# WebGPU Device 셋업

WebGPU를 사용하기 위한 초기화 단계.
Adapter → Device → Context 순서로 설정한다.

---

## 관련 강의

| | |
|---|---|
| [![Dr. Jack Xu — Set up Development Environment](https://img.youtube.com/vi/-hXtt4ioH5A/mqdefault.jpg)](https://www.youtube.com/watch?v=-hXtt4ioH5A) | [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) |
| **Dr. Jack Xu** — WebGPU 개발 환경 구성과 Adapter/Device 초기화 | **CMU 15-462** — GPU 아키텍처와 렌더링 파이프라인 이론 |

> **공식 가이드**: [Your first WebGPU app (Google Codelab)](https://codelabs.developers.google.com/your-first-webgpu-app) · [WebGPU Fundamentals — Setup](https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html)

---

## 개념

```
navigator.gpu (WebGPU API 진입점)
    ↓
GPU Adapter (물리 GPU 정보)
    ↓
GPU Device (GPU와의 연결, 모든 작업의 기준점)
    ↓
Canvas Context (화면 출력 대상)
```

---

## 초기화 코드

```typescript
// src/main.ts

async function initWebGPU(canvas: HTMLCanvasElement) {
  // 1. WebGPU 지원 확인
  if (!navigator.gpu) {
    throw new Error('WebGPU를 지원하지 않는 브라우저입니다. Chrome 113+ 필요');
  }

  // 2. Adapter 요청 (물리 GPU 정보)
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance', // 'low-power' | 'high-performance'
  });

  if (!adapter) {
    throw new Error('GPU Adapter를 찾을 수 없습니다.');
  }

  // Adapter 정보 확인
  const info = await adapter.requestAdapterInfo();
  console.log('GPU:', info.description);
  console.log('최대 텍스처 크기:', adapter.limits.maxTextureDimension2D);

  // 3. Device 생성 (실제 GPU 연결)
  const device = await adapter.requestDevice({
    requiredFeatures: [],
    requiredLimits: {},
  });

  // 디바이스 오류 핸들링
  device.lost.then((info) => {
    console.error(`Device lost: ${info.message}`);
  });

  // 4. Canvas Context 설정
  const context = canvas.getContext('webgpu')!;
  const format = navigator.gpu.getPreferredCanvasFormat(); // 'bgra8unorm' or 'rgba8unorm'

  context.configure({
    device,
    format,
    alphaMode: 'premultiplied', // 'opaque' | 'premultiplied'
  });

  return { device, context, format };
}

// 메인 실행
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const { device, context, format } = await initWebGPU(canvas);

// 화면 지우기 (검은색)
function render() {
  const encoder = device.createCommandEncoder();

  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });

  renderPass.end();
  device.queue.submit([encoder.finish()]);
}

render();
```

---

## 필요한 TypeScript 타입

```bash
npm install --save-dev @webgpu/types
```

```json
// tsconfig.json에 추가
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["@webgpu/types"]
  }
}
```

---

## WebGL vs WebGPU 초기화 비교

| 단계 | WebGL | WebGPU |
|------|-------|--------|
| 컨텍스트 | `canvas.getContext('webgl2')` | `canvas.getContext('webgpu')` |
| 동기/비동기 | 동기 | **비동기** (await 필요) |
| 디바이스 오류 | 확인 어려움 | `device.lost` Promise |
| 포맷 설정 | 자동 | `getPreferredCanvasFormat()` |

---

## 주의사항

```typescript
// WebGPU는 async이므로 반드시 await 사용
const adapter = await navigator.gpu.requestAdapter(); // ✅
const adapter = navigator.gpu.requestAdapter();        // ❌ Promise 반환

// Device 손실 대비 핸들링 권장
device.lost.then(info => {
  if (info.reason !== 'destroyed') {
    // 재초기화 시도
  }
});
```

---

## 다음 단계

→ [02. Hello Triangle](../02-hello-triangle)
