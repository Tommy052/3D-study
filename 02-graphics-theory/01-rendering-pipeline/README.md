# 01. 렌더링 파이프라인 (Rendering Pipeline)

3D 장면이 화면에 그려지는 전체 과정.
CPU에서 데이터를 준비하고, GPU가 이를 픽셀로 변환한다.

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

### 3. Input Assembler

```
버텍스 버퍼에서 정점 데이터를 읽어옴
각 정점: 위치(x,y,z), 노멀, UV, 색상 등

[0.0, 0.5, 0.0]  ← 꼭짓점 1
[-0.5, -0.5, 0.0] ← 꼭짓점 2
[0.5, -0.5, 0.0]  ← 꼭짓점 3
```

### 4. Vertex Shader (버텍스 셰이더)

```glsl
// 각 정점마다 한 번 실행 (병렬)
// 로컬 좌표 → 클립 좌표 변환이 핵심

uniform mat4 u_mvp;
attribute vec3 a_position;

void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
```

### 5. Primitive Assembly

삼각형 구성. 인덱스 버퍼(EBO)가 있다면 인덱스로 정점 재사용.

```
인덱스 [0, 1, 2] → 세 꼭짓점으로 삼각형 1개 구성
```

### 6. Rasterization (래스터화)

삼각형 내부의 픽셀 좌표를 결정.
각 픽셀에 대해 보간된 값(UV, 노멀 등) 계산.

```
삼각형 ABC에서 픽셀 P의 값:
UV_P = α * UV_A + β * UV_B + γ * UV_C  (무게중심 보간)
```

### 7. Fragment Shader (프래그먼트 셰이더)

```glsl
// 각 픽셀마다 한 번 실행 (병렬)
// 최종 색상 결정

precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}
```

### 8. Output Merger

- **깊이 테스트**: 더 가까운 물체만 그림 (Z-buffer)
- **스텐실 테스트**: 마스킹 효과
- **블렌딩**: 반투명 처리 (Alpha Blending)

---

## 프로그래밍 가능한 부분 vs 고정된 부분

```
Input Assembler    → 고정 (설정만 가능)
Vertex Shader      → 프로그래밍 가능 ← 우리가 작성
Primitive Assembly → 고정
Rasterization      → 고정
Fragment Shader    → 프로그래밍 가능 ← 우리가 작성
Output Merger      → 고정 (설정만 가능)
```

---

## Draw Call이란?

CPU가 GPU에게 "이걸 그려라"고 명령하는 것.

```typescript
// WebGL에서
gl.drawArrays(gl.TRIANGLES, 0, 3);   // 정점 3개로 삼각형 1개
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // 인덱스로 삼각형 2개

// WebGPU에서
pass.draw(3); // 정점 3개
```

> Draw Call이 많을수록 CPU-GPU 통신 오버헤드 증가 → 성능 저하

---

## 다음 단계

→ [02. 래스터화 (Rasterization)](../02-rasterization)
