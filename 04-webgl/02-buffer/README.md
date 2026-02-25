# 버퍼 (VBO, EBO)

정점 데이터를 GPU 메모리에 업로드하고 관리하는 방법.

---

## VBO (Vertex Buffer Object)

정점 데이터(위치, UV, 노멀 등)를 GPU에 저장하는 버퍼.

```typescript
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
```

## EBO / IBO (Element / Index Buffer Object)

정점 재사용을 위한 인덱스 버퍼.

```
사각형 = 삼각형 2개 = 정점 6개 (중복)
인덱스 사용 시 = 정점 4개 + 인덱스 [0,1,2, 0,2,3]
```

```typescript
const indices = new Uint16Array([0, 1, 2,  0, 2, 3]);
const ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// 인덱스로 그리기
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
```

## VAO (Vertex Array Object) — WebGL 2.0

VBO + attribute 설정을 묶어서 재사용.

```typescript
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
// VBO 설정 + attribPointer 설정...
gl.bindVertexArray(null);

// 렌더 시 VAO만 바인딩하면 OK
gl.bindVertexArray(vao);
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
```

---

## 버퍼 사용 힌트

| 힌트 | 설명 |
|------|------|
| `gl.STATIC_DRAW` | 한 번 업로드, 여러 번 사용 (정적 메쉬) |
| `gl.DYNAMIC_DRAW` | 자주 업데이트 (애니메이션) |
| `gl.STREAM_DRAW` | 매 프레임 업데이트 (파티클) |

---

## 다음 단계

→ [03. MVP 행렬](../03-mvp-matrix)
