// ============================================================
// 01. Device Setup — WebGPU 초기화
// ============================================================
// 학습 포인트:
//   1. navigator.gpu 지원 확인
//   2. Adapter → Device → Context 초기화 순서
//   3. CommandEncoder + RenderPass로 화면 지우기
//   4. device.lost 오류 핸들링
// ============================================================

async function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // ── 1. WebGPU 지원 확인 ─────────────────────────────────
  if (!navigator.gpu) {
    throw new Error('WebGPU를 지원하지 않는 브라우저입니다. Chrome 113+ 필요');
  }

  // ── 2. Adapter 요청 (물리 GPU 정보) ───────────────────────
  // powerPreference: 'high-performance' | 'low-power'
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance',
  });
  if (!adapter) throw new Error('GPU Adapter를 찾을 수 없습니다.');

  console.log('✅ Adapter 획득');

  // ── 3. Device 생성 (GPU와의 연결) ─────────────────────────
  const device = await adapter.requestDevice();

  // Device 손실 감지 (GPU 리셋, 드라이버 크래시 등)
  device.lost.then((info) => {
    console.error(`Device lost: ${info.message}`);
    if (info.reason !== 'destroyed') {
      // 실제 앱에서는 여기서 재초기화 시도
    }
  });

  console.log('✅ Device 생성');

  // ── 4. Canvas Context 설정 ─────────────────────────────────
  const context = canvas.getContext('webgpu')!;
  const format = navigator.gpu.getPreferredCanvasFormat(); // 'bgra8unorm' or 'rgba8unorm'
  context.configure({ device, format });

  console.log(`✅ Context 설정 완료 (format: ${format})`);

  // ── 렌더 함수 ────────────────────────────────────────────────
  //
  // WebGPU 렌더 흐름:
  //   CommandEncoder 생성
  //     → RenderPassEncoder 시작 (clearValue로 화면 지우기)
  //     → RenderPassEncoder 종료
  //   → CommandBuffer 완성 (encoder.finish())
  //   → device.queue.submit() 으로 GPU에 전달
  //
  function render() {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(), // 현재 프레임 텍스처
        clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 }, // 배경색 (남색)
        loadOp:  'clear',  // 패스 시작 시 clearValue로 초기화
        storeOp: 'store',  // 패스 끝에 텍스처에 저장
      }],
    });

    // 아무 드로우 콜 없이 pass.end() → 화면을 clearValue 색으로 지운다
    pass.end();
    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  render();
}

main().catch(console.error);
