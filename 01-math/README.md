# 01. 수학 기초 (Math Fundamentals)

3D 그래픽스의 모든 계산은 수학 위에 세워진다.
이 섹션은 3D를 이해하기 위한 필수 수학 개념들을 다룬다.

---

## 목차

| # | 주제 | 핵심 개념 |
|---|------|----------|
| [01](./01-vector) | 벡터 (Vector) | 방향, 크기, 내적, 외적 |
| [02](./02-matrix) | 행렬 (Matrix) | 행렬 곱, 단위행렬, 역행렬 |
| [03](./03-transform-matrix) | 변환 행렬 | 이동·회전·스케일 행렬 |
| [04](./04-coordinate-system) | 좌표계 | 로컬/월드/뷰/클립 공간 |
| [05](./05-quaternion) | 쿼터니언 | 짐벌락 없는 회전 표현 |
| [06](./06-trigonometry) | 삼각함수 | sin, cos, atan2, 라디안 |

---

## 왜 수학이 필요한가?

```
mesh.position = new Vector3(1, 0, 0)   // 벡터
mesh.rotation = new Vector3(0, Math.PI / 2, 0)  // 라디안, 삼각함수
camera.getViewMatrix()                  // 행렬
mesh.rotationQuaternion = Quaternion... // 쿼터니언
```

Babylon.js 한 줄 뒤에 이 모든 수학이 숨어있다.
직접 구현하지 않더라도, **왜 동작하는지** 알아야 디버깅할 수 있다.

---

## 학습 순서

```
벡터 → 행렬 → 변환행렬 → 좌표계 → 쿼터니언 → 삼각함수
```
