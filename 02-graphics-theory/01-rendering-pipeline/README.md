# 01. 렌더링 파이프라인 (Rendering Pipeline)

3D 장면이 화면에 그려지는 전체 과정.
CPU에서 데이터를 준비하고, GPU가 이를 픽셀로 변환한다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![Branch Education](https://img.youtube.com/vi/C8YtdC8mxTU/mqdefault.jpg)](https://www.youtube.com/watch?v=C8YtdC8mxTU) | **How do Video Game Graphics Work?**<br>GPU가 데이터를 어떻게 화면으로 변환하는지 시각화<br>Ray Tracing, DLSS, 렌더링 파이프라인 전체 흐름<br>⏱ 23분 · 🎓 Branch Education |
| [![CMU 15-462](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Rasterization & Sampling**<br>학문적으로 깊은 렌더링 파이프라인 설명<br>⏱ 80분 · 🎓 Carnegie Mellon University |

> 📋 [CMU 15-462 전체 플레이리스트](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) · [강의 사이트](http://15462.courses.cs.cmu.edu/)

---

## 전체 흐름

```
[CPU 단계]
  1. 씬 데이터 준비 (Mesh, Material, Light 정보)
  2. Draw Call 발행 → GPU에 명령 전달

[GPU 단계]
  3. Input Assembler    — 정점 데이터 수집
  4. Vertex Shader      — 각 정점의 위치 변환 (프로그래밍 가능)
  5. Primitive Assembly — 정점을 삼각형으로 조립
  6. Rasterization      — 삼각형을 픽셀(프래그먼트)로 분해
  7. Fragment Shader    — 각 픽셀의 색상 계산 (프로그래밍 가능)
  8. Output Merger      — 깊이 테스트, 블렌딩 후 프레임버퍼에 기록

[화면 출력]
  9. 프레임버퍼 → 모니터
```

---

## 각 단계 상세

### 4. Vertex Shader (버텍스 셰이더)

```glsl
uniform mat4 u_mvp;
attribute vec3 a_position;

void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0); // 로컬 → 클립 공간
}
```

### 6. Rasterization (래스터화)

삼각형 내부의 픽셀 좌표를 결정. 각 픽셀에 대해 보간된 값(UV, 노멀 등) 계산.

```
픽셀 P의 UV = α * UV_A + β * UV_B + γ * UV_C  (무게중심 보간)
```

### 7. Fragment Shader (프래그먼트 셰이더)

```glsl
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}
```

### 8. Output Merger

- **깊이 테스트**: 더 가까운 물체만 그림 (Z-buffer)
- **블렌딩**: 반투명 처리 (Alpha Blending)

---

## 프로그래밍 가능한 단계

```
Input Assembler    → 고정 (설정만 가능)
Vertex Shader      → 프로그래밍 가능 ← 우리가 작성
Primitive Assembly → 고정
Rasterization      → 고정
Fragment Shader    → 프로그래밍 가능 ← 우리가 작성
Output Merger      → 고정 (설정만 가능)
```

---

## Draw Call

CPU가 GPU에게 "이걸 그려라"고 명령하는 것.

```typescript
gl.drawArrays(gl.TRIANGLES, 0, 3);               // WebGL
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // 인덱스 사용

pass.draw(3); // WebGPU
```

> Draw Call이 많을수록 CPU-GPU 통신 오버헤드 증가 → 성능 저하

---

## 다음 단계

→ [02. 래스터화 (Rasterization)](../02-rasterization)
