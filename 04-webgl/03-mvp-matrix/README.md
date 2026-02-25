# MVP 행렬 직접 구현

Model × View × Projection 행렬을 직접 계산해 WebGL로 넘기는 예제.

---

## 목표

```typescript
// 버텍스 셰이더
uniform mat4 u_mvp;
attribute vec3 a_position;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

---

## 행렬 계산

```typescript
import { mat4 } from 'gl-matrix'; // gl-matrix 라이브러리 사용 (npm i gl-matrix)

// Model 행렬 (물체의 월드 변환)
const model = mat4.create();
mat4.rotateY(model, model, rotation);
mat4.translate(model, model, [0, 0, 0]);

// View 행렬 (카메라)
const view = mat4.create();
mat4.lookAt(
  view,
  [0, 2, 5],  // 카메라 위치
  [0, 0, 0],  // 바라볼 대상
  [0, 1, 0],  // 위쪽 방향 (Up 벡터)
);

// Projection 행렬 (원근 투영)
const projection = mat4.create();
mat4.perspective(
  projection,
  Math.PI / 4,              // FOV (45도)
  canvas.width / canvas.height, // 종횡비
  0.1,                      // Near plane
  100.0,                    // Far plane
);

// MVP 합성
const mvp = mat4.create();
mat4.multiply(mvp, view, model);
mat4.multiply(mvp, projection, mvp);

// 셰이더에 전달
gl.uniformMatrix4fv(mvpLoc, false, mvp);
```

---

## FOV (Field of View)

```
FOV = 60° → 자연스러운 시야
FOV = 90° → 넓은 시야 (물고기눈 느낌)
FOV = 45° → 좁고 집중된 시야
```

---

## 다음 단계

→ [04. 텍스처](../04-texture)
