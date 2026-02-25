# 04. WebGL

WebGL은 브라우저에서 GPU를 직접 다루는 저수준 API다.
Babylon.js나 Three.js가 내부적으로 사용하는 것이 바로 WebGL이다.

직접 구현해보는 것이 목적이므로, 실무에서는 프레임워크를 쓰면 된다.

---

## 목차

| # | 주제 | 배우는 것 |
|---|------|---------|
| [01](./01-hello-triangle) | Hello Triangle | WebGL 초기화, 셰이더 컴파일, 첫 삼각형 |
| [02](./02-buffer) | 버퍼 (VBO, EBO) | 정점 데이터를 GPU에 올리는 방법 |
| [03](./03-mvp-matrix) | MVP 행렬 | 3D → 2D 변환의 핵심 |
| [04](./04-texture) | 텍스처 | 이미지를 3D 표면에 매핑 |
| [05](./05-lighting) | 조명 구현 | Phong 조명 모델 직접 구현 |

---

## WebGL 초기화 흐름

```typescript
// 1. Canvas에서 WebGL context 획득
const gl = canvas.getContext('webgl2')!;

// 2. 셰이더 소스 작성 및 컴파일
const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

// 3. 셰이더 프로그램 링크
const program = createProgram(gl, vs, fs);

// 4. 정점 데이터를 GPU에 업로드 (VBO)
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// 5. 렌더 루프
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(render);
}
```

---

## 왜 WebGL을 배우는가?

- Babylon.js가 내부에서 하는 일을 이해할 수 있다
- 셰이더 오류를 디버깅할 수 있다
- WebGPU로 넘어가기 위한 개념 기반이 된다
