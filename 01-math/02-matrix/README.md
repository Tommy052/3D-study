# 02. 행렬 (Matrix)

행렬은 3D에서 **변환(이동, 회전, 스케일)을 하나의 수식으로 표현**하는 도구다.
여러 변환을 행렬 곱 하나로 합칠 수 있어서 GPU가 극도로 효율적으로 처리할 수 있다.

---

## 추천 강의

### 3Blue1Brown — Essence of Linear Algebra

| 영상 | 설명 |
|------|------|
| [![Ch3. Linear transformations](https://img.youtube.com/vi/kYB8IZa5AuE/mqdefault.jpg)](https://www.youtube.com/watch?v=kYB8IZa5AuE) | **Ch3. Linear transformations and matrices**<br>행렬이 공간을 어떻게 변형하는지 시각화<br>⏱ 10분 · 🎓 3Blue1Brown |
| [![Ch4. Matrix multiplication](https://img.youtube.com/vi/XkY2DOUCWMU/mqdefault.jpg)](https://www.youtube.com/watch?v=XkY2DOUCWMU) | **Ch4. Matrix multiplication as composition**<br>행렬 곱 = 변환의 합성<br>⏱ 10분 · 🎓 3Blue1Brown |
| [![Ch6. Determinant](https://img.youtube.com/vi/Ip3X9LOh2dk/mqdefault.jpg)](https://www.youtube.com/watch?v=Ip3X9LOh2dk) | **Ch6. The determinant**<br>행렬식의 기하학적 의미 (부피 변화율)<br>⏱ 10분 · 🎓 3Blue1Brown |
| [![Ch7. Inverse matrices](https://img.youtube.com/vi/uQhTuRlWMxw/mqdefault.jpg)](https://www.youtube.com/watch?v=uQhTuRlWMxw) | **Ch7. Inverse matrices, column space, null space**<br>역행렬과 열공간<br>⏱ 12분 · 🎓 3Blue1Brown |

### MIT 18.06 — Gilbert Strang 교수

| 영상 | 설명 |
|------|------|
| [![MIT L1](https://img.youtube.com/vi/J7DzL2_Na80/mqdefault.jpg)](https://www.youtube.com/watch?v=J7DzL2_Na80) | **Lecture 1. The geometry of linear equations**<br>선형방정식의 기하학적 해석<br>⏱ 39분 · 🎓 MIT |
| [![MIT L3](https://img.youtube.com/vi/FX4C-JpTFgY/mqdefault.jpg)](https://www.youtube.com/watch?v=FX4C-JpTFgY) | **Lecture 3. Multiplication and inverse matrices**<br>행렬 곱셈과 역행렬<br>⏱ 46분 · 🎓 MIT |

> MIT 전체 플레이리스트: [MIT 18.06 Linear Algebra](https://www.youtube.com/playlist?list=PLE7DDD91010BC51F8)

---

## 개념

### 행렬이란?

숫자를 격자 형태로 배열한 것.

```
4x4 행렬 (3D에서 주로 사용):
| a  b  c  d |
| e  f  g  h |
| i  j  k  l |
| m  n  o  p |
```

> 3D에서 **4x4 행렬**을 쓰는 이유: 이동(Translation)을 행렬 곱으로 표현하려면 차원이 하나 더 필요하다 (동차좌표계).

---

## 핵심 연산

### 1. 행렬 × 벡터 (변환 적용)

```
| a  b  c  d |   | x |   | ax + by + cz + dw |
| e  f  g  h | × | y | = | ex + fy + gz + hw |
| i  j  k  l |   | z |   | ix + jy + kz + lw |
| m  n  o  p |   | w |   | mx + ny + oz + pw |
```

> 4D 벡터 `(x, y, z, w)` 에서 w = 1 이면 위치, w = 0 이면 방향

### 2. 행렬 × 행렬 (변환 합성)

```typescript
// 여러 변환을 하나의 행렬로 합치기
M = 스케일 × 회전 × 이동

// 한 번의 곱으로 모든 변환 적용
최종위치 = M × 원래위치
```

> **주의**: 행렬 곱은 교환법칙이 성립하지 않는다 (A×B ≠ B×A)

### 3. 단위 행렬 (Identity Matrix)

```
| 1  0  0  0 |
| 0  1  0  0 |
| 0  0  1  0 |
| 0  0  0  1 |
```

### 4. 역행렬 (Inverse)

`A × A⁻¹ = I (단위행렬)`

> **활용**: 카메라의 View 행렬 계산

---

## 3D에서 4x4 행렬을 쓰는 이유

```
// w=1이면 위치벡터 → 이동 영향 받음
| 1  0  0  tx |   | x |   | x + tx |
| 0  1  0  ty | × | y | = | y + ty |
| 0  0  1  tz |   | z |   | z + tz |
| 0  0  0   1 |   | 1 |   |   1    |

// w=0이면 방향벡터 → 이동 영향 없음
| 1  0  0  tx |   | x |   | x |
| 0  1  0  ty | × | y | = | y |
| 0  0  1  tz |   | z |   | z |
| 0  0  0   1 |   | 0 |   | 0 |
```

---

## Column-Major vs Row-Major

```
OpenGL, WebGL, Babylon.js → Column-Major (열 우선)
DirectX, HLSL             → Row-Major (행 우선)

이동 행렬 메모리 배치:
  Column-Major: data[12], data[13], data[14] = tx, ty, tz
  Row-Major:    data[3],  data[7],  data[11] = tx, ty, tz
```

---

## 다음 단계

→ [03. 변환 행렬 (Transform Matrix)](../03-transform-matrix)
