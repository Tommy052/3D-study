# 04. 좌표계 (Coordinate System)

3D 그래픽스에는 여러 개의 좌표계가 존재한다.
같은 물체라도 어떤 좌표계 기준이냐에 따라 좌표값이 달라진다.

---

## 좌표계 종류 (변환 파이프라인 순서)

```
로컬 → (Model) → 월드 → (View) → 뷰 → (Projection) → 클립 → NDC → 화면
```

### 1. 로컬 공간 (Local Space / Object Space)

- 물체 자신이 기준
- 물체의 중심이 원점 (0, 0, 0)
- 3D 모델링 소프트웨어에서 만들 때의 좌표

```
박스의 꼭짓점:
  (-0.5, -0.5, -0.5)
  ( 0.5, -0.5, -0.5)
  ... (항상 원점 기준)
```

### 2. 월드 공간 (World Space)

- 씬 전체의 절대 좌표계
- Model 행렬 적용 후
- Babylon.js의 `mesh.position` 이 여기서 동작

```typescript
mesh.position = new Vector3(5, 0, 0); // 월드 좌표 (5, 0, 0)
```

### 3. 뷰 공간 (View Space / Camera Space / Eye Space)

- 카메라를 원점으로 한 좌표계
- 카메라 방향이 -Z축
- View 행렬 = 카메라 변환의 역행렬

```
카메라가 (0, 5, 10)에서 원점을 바라볼 때:
월드 원점은 뷰 공간에서 (0, -5, -10)으로 변환됨
```

### 4. 클립 공간 (Clip Space)

- Projection 행렬 적용 후
- 화면에 보이는 영역을 정규화된 박스로 정의
- 이 박스 밖에 있는 것은 클리핑(제거)됨

### 5. NDC (Normalized Device Coordinates)

- X, Y, Z 모두 -1 ~ 1 범위
- GPU가 클립 좌표를 자동으로 변환
- 좌하단 (-1, -1) ~ 우상단 (1, 1)

### 6. 화면 공간 (Screen Space)

- 실제 픽셀 좌표
- 뷰포트(viewport) 변환으로 NDC → 픽셀

---

## 왼손 vs 오른손 좌표계

```
오른손 좌표계 (OpenGL, Three.js):
  X: 오른쪽
  Y: 위
  Z: 화면 밖으로 나오는 방향 (양수)

왼손 좌표계 (DirectX, Babylon.js, WebGPU):
  X: 오른쪽
  Y: 위
  Z: 화면 안쪽 (양수)
```

> Babylon.js는 **왼손 좌표계** 사용

---

## 로컬 vs 월드 — 실전 예시

```typescript
// 부모-자식 관계에서의 좌표계
const parent = MeshBuilder.CreateBox('parent', {}, scene);
parent.position = new Vector3(5, 0, 0); // 월드: (5, 0, 0)

const child = MeshBuilder.CreateBox('child', {}, scene);
child.parent = parent;
child.position = new Vector3(1, 0, 0); // 로컬: 부모 기준 +1

// child의 실제 월드 좌표 = (6, 0, 0)
console.log(child.getAbsolutePosition()); // Vector3(6, 0, 0)
```

---

## Babylon.js에서 공간 변환

```typescript
// 월드 행렬 가져오기
const worldMatrix = mesh.getWorldMatrix();

// 로컬 좌표 → 월드 좌표
const localPos = new Vector3(1, 0, 0);
const worldPos = Vector3.TransformCoordinates(localPos, worldMatrix);

// 월드 좌표 → 화면 좌표
const screenPos = Vector3.Project(
  worldPos,
  Matrix.Identity(),
  scene.getTransformMatrix(),
  camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
);
```

---

## 다음 단계

→ [05. 쿼터니언 (Quaternion)](../05-quaternion)
