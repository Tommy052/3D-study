# WebGL 텍스처

이미지를 GPU에 업로드하고 3D 표면에 매핑하는 방법.

---

## 관련 강의

| | |
|---|---|
| [![CMU 15-462 — Texture Mapping](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | [![Branch Education — Graphics Pipeline](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) |
| **CMU 15-462** — UV 매핑·Mipmap·필터링 이론 | **Branch Education** — 텍스처가 GPU 메모리에서 처리되는 방식 |

> **참고**: [WebGL2 Fundamentals — Textures](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-textures.html) · [LearnOpenGL — Textures](https://learnopengl.com/Getting-started/Textures)

---

## 텍스처 로드 & 업로드

```typescript
function createTexture(gl: WebGL2RenderingContext, imageUrl: string): WebGLTexture {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 이미지 로드 전 임시 픽셀 (1x1 파란색)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D); // Mipmap 자동 생성
  };
  image.src = imageUrl;

  // 필터링 설정
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  return texture;
}
```

---

## 텍스처 유닛

WebGL은 동시에 여러 텍스처를 사용할 수 있다 (최소 8개 유닛 보장).

```typescript
// 텍스처 유닛에 바인딩
gl.activeTexture(gl.TEXTURE0);      // 유닛 0 활성화
gl.bindTexture(gl.TEXTURE_2D, texture);

// 셰이더에 유닛 번호 전달
gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

// 멀티텍스처 예시 (노멀맵 + 디퓨즈)
gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, diffuseTex);
gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, normalTex);
gl.uniform1i(diffuseLoc, 0);
gl.uniform1i(normalLoc, 1);
```

---

## 필터링 옵션

| 옵션 | 설명 | 용도 |
|------|------|------|
| `NEAREST` | 가장 가까운 픽셀 | 픽셀 아트, 레트로 |
| `LINEAR` | 선형 보간 | 일반 텍스처 |
| `LINEAR_MIPMAP_LINEAR` | Mipmap + 삼선형 | 원거리 텍스처 (권장) |

---

## 다음 단계

→ [05. 조명 직접 구현](../05-lighting)
