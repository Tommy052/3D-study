# 01. 수학 기초 (Math Fundamentals)

3D 그래픽스의 모든 계산은 수학 위에 세워진다.
이 섹션은 3D를 이해하기 위한 필수 수학 개념들을 다룬다.

---

## 추천 강의 (전체 섹션)

### 3Blue1Brown — Essence of Linear Algebra ⭐ 가장 먼저 볼 것

수식보다 **시각적 직관**을 먼저 잡아주는 강의. 3D 개발자에게 최적화된 접근.

| 영상 | 설명 |
|------|------|
| [![Ch1](https://img.youtube.com/vi/fNk_zzaMoSs/mqdefault.jpg)](https://www.youtube.com/watch?v=fNk_zzaMoSs) | **Ch1. Vectors** · 벡터란 무엇인가 |
| [![Ch3](https://img.youtube.com/vi/kYB8IZa5AuE/mqdefault.jpg)](https://www.youtube.com/watch?v=kYB8IZa5AuE) | **Ch3. Linear Transformations** · 행렬 = 공간 변형 |
| [![Ch4](https://img.youtube.com/vi/XkY2DOUCWMU/mqdefault.jpg)](https://www.youtube.com/watch?v=XkY2DOUCWMU) | **Ch4. Matrix Multiplication** · 변환 합성 |
| [![Ch9](https://img.youtube.com/vi/LyGKycYT2v0/mqdefault.jpg)](https://www.youtube.com/watch?v=LyGKycYT2v0) | **Ch9. Dot Products** · 내적의 기하학적 의미 |
| [![Ch10](https://img.youtube.com/vi/eu6i7WJeinw/mqdefault.jpg)](https://www.youtube.com/watch?v=eu6i7WJeinw) | **Ch10. Cross Products** · 외적과 법선벡터 |

> 📋 [전체 플레이리스트 (16개 영상)](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)

---

### MIT 18.06 — Gilbert Strang 교수 (깊이 있는 수학)

전 세계 2000만 회 이상 시청한 전설적인 선형대수학 강의.

| 영상 | 설명 |
|------|------|
| [![MIT L1](https://img.youtube.com/vi/J7DzL2_Na80/mqdefault.jpg)](https://www.youtube.com/watch?v=J7DzL2_Na80) | **L1. Geometry of Linear Equations** |
| [![MIT L3](https://img.youtube.com/vi/FX4C-JpTFgY/mqdefault.jpg)](https://www.youtube.com/watch?v=FX4C-JpTFgY) | **L3. Multiplication and Inverse Matrices** |
| [![MIT L4](https://img.youtube.com/vi/MsIvs_6vC38/mqdefault.jpg)](https://www.youtube.com/watch?v=MsIvs_6vC38) | **L4. Factorization A = LU** |

> 📋 [MIT 18.06 전체 플레이리스트](https://www.youtube.com/playlist?list=PLE7DDD91010BC51F8) · [MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)

---

## 목차

| # | 주제 | 핵심 개념 | 관련 강의 |
|---|------|----------|---------|
| [01](./01-vector) | 벡터 (Vector) | 방향, 크기, 내적, 외적 | 3B1B Ch1, Ch9, Ch10 |
| [02](./02-matrix) | 행렬 (Matrix) | 행렬 곱, 단위행렬, 역행렬 | 3B1B Ch3, Ch4 · MIT L3 |
| [03](./03-transform-matrix) | 변환 행렬 | 이동·회전·스케일 행렬, MVP | 3B1B Ch3, Ch4 |
| [04](./04-coordinate-system) | 좌표계 | 로컬/월드/뷰/클립 공간 | 3B1B Ch13 |
| [05](./05-quaternion) | 쿼터니언 | 짐벌락 없는 회전 표현 | 3B1B Quaternions |
| [06](./06-trigonometry) | 삼각함수 | sin, cos, atan2, 라디안 | — |

---

## 학습 순서

```
3Blue1Brown (직관) → 각 챕터 README (개념 정리) → MIT Strang (깊이) → 코드 실습
```
