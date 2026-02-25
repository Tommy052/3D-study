# WebGL 텍스처

이미지를 GPU에 업로드하고 3D 표면에 매핑하는 방법.

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

```typescript
// 텍스처 유닛에 바인딩
gl.activeTexture(gl.TEXTURE0);      // 유닛 0 활성화
gl.bindTexture(gl.TEXTURE_2D, texture);

// 셰이더에 유닛 번호 전달
gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
```

---

## 다음 단계

→ [05. 조명 직접 구현](../05-lighting)
