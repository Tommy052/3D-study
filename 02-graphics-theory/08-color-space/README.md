# 08. 색공간 (Color Space)

색을 수학적으로 어떻게 표현하느냐의 기준.
잘못된 색공간 처리는 조명이 어둡거나 색이 이상해 보이는 원인이 된다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![minutephysics Color](https://img.youtube.com/vi/LKnqECcg6Gw/mqdefault.jpg)](https://www.youtube.com/watch?v=LKnqECcg6Gw) | **Computer Color is Broken**<br>왜 컴퓨터 색상이 수학적으로 틀렸는지<br>감마 보정의 필요성을 직관적으로 설명<br>⏱ 5분 · 🎓 minutephysics |
| [![CMU 15-462 Color](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Color Science**<br>색공간, 감마, HDR의 수학적 배경<br>⏱ 80분 · 🎓 Carnegie Mellon University |

> 📖 텍스트 레퍼런스: [LearnOpenGL — Gamma Correction](https://learnopengl.com/Advanced-Lighting/Gamma-Correction) · [LearnOpenGL — HDR](https://learnopengl.com/Advanced-Lighting/HDR)

---

## sRGB vs Linear

### sRGB
```
모니터 표준 색공간
사람의 눈은 어두운 영역에 더 민감
→ 어두운 쪽에 정밀도를 더 배분 (감마 γ ≈ 2.2 적용)

대부분의 PNG, JPG 이미지 파일 = sRGB
```

### Linear (선형)
```
수학적으로 올바른 색공간
0.5 = 정확히 최대값의 절반 밝기

물리 기반 조명 계산은 반드시 Linear에서 해야 함!
```

---

## 감마 보정 (Gamma Correction)

```
sRGB → Linear: 값^2.2  (밝아짐)
Linear → sRGB: 값^(1/2.2) (어두워짐)

파이프라인:
  텍스처 (sRGB) → [로드시 변환] → Linear 공간 → 조명 계산 → Gamma 보정 → 모니터 출력
```

---

## HDR (High Dynamic Range)

```
SDR: 0 ~ 1 범위 (256단계)
HDR: 0 ~ ∞ 범위 (실제 빛의 밝기)

태양 직사광: 수십만 lux
실내: 수백 lux

→ HDR로 계산 후 Tone Mapping으로 SDR로 압축
```

---

## Tone Mapping

HDR 값을 SDR(0~1) 범위로 자연스럽게 압축.

```glsl
// Reinhard
vec3 mapped = hdrColor / (hdrColor + vec3(1.0));

// ACES Filmic (영화 표준, 더 자연스러움)
vec3 a = hdrColor * (2.51 * hdrColor + 0.03);
vec3 b = hdrColor * (2.43 * hdrColor + 0.59) + 0.14;
vec3 mapped = clamp(a / b, 0.0, 1.0);
```

---

## Babylon.js에서 색공간 설정

```typescript
import { ImageProcessingConfiguration } from '@babylonjs/core';

// ACES 톤 매핑
scene.imageProcessingConfiguration.toneMappingEnabled = true;
scene.imageProcessingConfiguration.toneMappingType =
  ImageProcessingConfiguration.TONEMAPPING_ACES;

// 감마 보정
scene.imageProcessingConfiguration.gammaSpace = true;

// 텍스처의 색공간 명시
const tex = new Texture('/textures/albedo.png', scene);
tex.gammaSpace = true; // sRGB 텍스처 (기본값)
```

---

## 정리

```
텍스처 (sRGB)
    ↓ 로드시 자동 변환
Linear 공간에서 PBR 조명 계산
    ↓ Tone Mapping (HDR → SDR)
    ↓ Gamma 보정 (Linear → sRGB)
모니터 출력
```

---

## 다음 단계

→ [03. 셰이더](../../03-shader)
