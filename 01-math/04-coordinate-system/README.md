# 04. 좌표계 (Coordinate System)

3D 그래픽스에는 여러 개의 좌표계가 존재한다.
같은 물체라도 어떤 좌표계 기준이냐에 따라 좌표값이 달라진다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![Ch13. Change of basis](https://img.youtube.com/vi/P2LTAUO1TdA/mqdefault.jpg)](https://www.youtube.com/watch?v=P2LTAUO1TdA) | **Ch13. Change of basis**<br>좌표계 변환의 수학적 원리<br>⏱ 12분 · 🎓 3Blue1Brown |
| [![CMU 15-462](https://img.youtube.com/vi/W6yEALqsD7k/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Math Review: Linear Algebra**<br>3D 그래픽스 맥락에서의 좌표 변환 전체 흐름<br>⏱ 80분 · 🎓 CMU |

---

## 좌표계 종류 (변환 파이프라인 순서)

```
로컬 → (Model) → 월드 → (View) → 뷰 → (Projection) → 클립 → NDC → 화면
```

### 1. 로컬 공간 (Local Space)

- 물체 자신이 기준, 중심이 원점 (0, 0, 0)
- 3D 모델링 소프트웨어에서 만들 때의 좌표

### 2. 월드 공간 (World Space)

- 씬 전체의 절대 좌표계
- `mesh.position` 이 여기서 동작

### 3. 뷰 공간 (View Space / Camera Space)

- 카메라를 원점으로 한 좌표계
- View 행렬 = 카메라 변환의 역행렬

### 4. 클립 공간 (Clip Space)

- Projection 행렬 적용 후
- 화면에 보이는 영역 정의 (Frustum)

### 5. NDC (Normalized Device Coordinates)

- X, Y, Z 모두 -1 ~ 1 범위
- 좌하단 (-1, -1) ~ 우상단 (1, 1)

### 6. 화면 공간 (Screen Space)

- 실제 픽셀 좌표

---

## 왼손 vs 오른손 좌표계

```
오른손 좌표계 (OpenGL, Three.js):
  Z → 화면 밖으로 나오는 방향 (양수)

왼손 좌표계 (DirectX, Babylon.js, WebGPU):
  Z → 화면 안쪽 (양수)
```

> Babylon.js는 **왼손 좌표계** 사용

---

## 로컬 vs 월드 — 실전 예시

```typescript
// 부모-자식 관계
const parent = MeshBuilder.CreateBox('parent', {}, scene);
parent.position = new Vector3(5, 0, 0); // 월드: (5, 0, 0)

const child = MeshBuilder.CreateBox('child', {}, scene);
child.parent = parent;
child.position = new Vector3(1, 0, 0); // 로컬: 부모 기준 +1

// child 실제 월드 좌표 = (6, 0, 0)
console.log(child.getAbsolutePosition());
```

---

## Babylon.js에서 공간 변환

```typescript
// 로컬 → 월드
const worldPos = Vector3.TransformCoordinates(localPos, mesh.getWorldMatrix());

// 월드 → 화면
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
