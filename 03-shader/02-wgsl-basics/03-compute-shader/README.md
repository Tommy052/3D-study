# WGSL 컴퓨트 셰이더 (Compute Shader)

렌더링과 무관하게 GPU의 병렬 연산 능력을 활용하는 셰이더.
WebGPU에서만 지원 (WebGL 미지원).

---

## 관련 강의

| | |
|---|---|
| [![CMU 15-462 — Computer Graphics](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | [![Inigo Quilez — Painting a Character with Maths](https://img.youtube.com/vi/8--5LwHRhjk/mqdefault.jpg)](https://www.youtube.com/watch?v=8--5LwHRhjk) |
| **CMU 15-462** — GPU 병렬 처리 아키텍처 이론 | **Inigo Quilez** — GPU에서 수학으로 이미지를 그리는 원리 |

> **공식 코드랩**: [Get started with GPU Compute on the web (Google)](https://developer.chrome.com/docs/capabilities/web-apis/gpu-compute) — Conway's Game of Life를 컴퓨트 셰이더로 구현하는 실습 포함

---

## 개념

```
CPU에서 루프:           GPU 컴퓨트 셰이더:
for (i = 0; i < N; i++)  → N개의 스레드가 동시에 실행
  data[i] *= 2;           → 각 스레드가 data[i] *= 2 처리
```

**활용 예시:**
- 파티클 시스템 (수만 개 파티클 위치 업데이트)
- 이미지 처리 (픽셀 필터)
- 물리 시뮬레이션
- 머신러닝 추론

---

## 워크그룹 (Workgroup)

```
전체 스레드 = dispatch(x, y, z) × workgroup_size(lx, ly, lz)

dispatch(4, 4, 1) + workgroup_size(8, 8, 1) = 4*8 × 4*8 = 1024 스레드
```

---

## 기본 컴퓨트 셰이더

```wgsl
// Storage Buffer: CPU↔GPU 데이터 공유
@group(0) @binding(0) var<storage, read_write> data: array<f32>;

// 각 스레드의 전역 ID를 받음
@compute @workgroup_size(64)  // 워크그룹당 64개 스레드
fn cs_main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;

  // 배열 범위 체크
  if (i >= arrayLength(&data)) { return; }

  // 각 스레드가 독립적으로 처리
  data[i] = data[i] * 2.0;
}
```

---

## JavaScript에서 Compute 실행

```typescript
// Compute Pipeline 생성
const computePipeline = device.createComputePipeline({
  layout: 'auto',
  compute: {
    module: device.createShaderModule({ code: wgslCode }),
    entryPoint: 'cs_main',
  },
});

// 데이터 버퍼 (GPU)
const dataBuffer = device.createBuffer({
  size: Float32Array.BYTES_PER_ELEMENT * 1024,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  mappedAtCreation: true,
});
new Float32Array(dataBuffer.getMappedRange()).fill(1.0);
dataBuffer.unmap();

// 커맨드 인코딩
const encoder = device.createCommandEncoder();
const pass = encoder.beginComputePass();
pass.setPipeline(computePipeline);
pass.setBindGroup(0, bindGroup);
pass.dispatchWorkgroups(Math.ceil(1024 / 64)); // 16 워크그룹
pass.end();

device.queue.submit([encoder.finish()]);
```

---

## 렌더 셰이더 vs 컴퓨트 셰이더

| 항목 | 버텍스/프래그먼트 | 컴퓨트 |
|------|----------------|--------|
| 목적 | 화면 렌더링 | 범용 GPU 연산 |
| 출력 | 픽셀 색상 | Storage Buffer |
| 트리거 | Draw Call | dispatchWorkgroups |
| 지원 | WebGL + WebGPU | WebGPU 전용 |

---

## 다음 단계

→ [04. WebGL](../../../04-webgl)
