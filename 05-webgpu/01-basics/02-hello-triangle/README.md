# WebGPU Hello Triangle

WebGPU로 첫 삼각형을 그리는 전체 과정.

---

## 전체 코드

```typescript
// src/main.ts

async function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 초기화
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();
  const context = canvas.getContext('webgpu')!;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format });

  // WGSL 셰이더
  const shaderCode = `
    @vertex
    fn vs_main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
      );
      return vec4f(pos[i], 0.0, 1.0);
    }

    @fragment
    fn fs_main() -> @location(0) vec4f {
      return vec4f(1.0, 0.5, 0.0, 1.0);
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // 렌더 파이프라인
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shaderModule, entryPoint: 'vs_main' },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  // 렌더
  function render() {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(pipeline);
    pass.draw(3);
    pass.end();

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(render);
  }

  render();
}

main();
```

---

## WebGL vs WebGPU 비교

| 단계 | WebGL | WebGPU |
|------|-------|--------|
| 셰이더 언어 | GLSL | WGSL |
| 셰이더 컴파일 | `gl.compileShader()` | `createShaderModule()` |
| 파이프라인 | 암묵적 전역 상태 | 명시적 `createRenderPipeline()` |
| 렌더 커맨드 | 즉시 실행 | 인코딩 후 `submit()` |

---

## 다음 단계

→ [03. Vertex Buffer](../03-vertex-buffer)
