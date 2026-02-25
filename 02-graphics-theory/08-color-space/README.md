# 08. 색공간 (Color Space)

색을 수학적으로 어떻게 표현하느냐의 기준.
잘못된 색공간 처리는 조명이 어둡거나 색이 이상해 보이는 원인이 된다.

---

## sRGB vs Linear

### sRGB

```
모니터 표준 색공간
사람의 눈은 어두운 영역에 더 민감 → 어두운 쪽에 더 많은 정밀도 배분
감마(γ ≈ 2.2) 곡선 적용됨

PNG, JPG 이미지 파일: 대부분 sRGB
```

### Linear (선형)

```
수학적으로 올바른 색공간
0.5는 정확히 최대값의 절반 밝기
물리 기반 조명 계산은 반드시 Linear에서 해야 함
```

---

## 감마 보정 (Gamma Correction)

```
sRGB → Linear: 값^2.2 (밝아짐)
Linear → sRGB: 값^(1/2.2) (어두워짐)

모니터는 sRGB를 기대하므로:
  1. 텍스처 로드 시 sRGB → Linear 변환
  2. 조명 계산 (Linear 공간)
  3. 출력 시 Linear → sRGB 변환
```

---

## HDR (High Dynamic Range)

```
SDR: 0 ~ 1 범위 (255단계)
HDR: 0 ~ ∞ 범위 (실제 빛의 밝기 그대로)

태양: 수백만 lux
실내: 수백 lux

→ HDR로 계산 후 SDR로 압축 필요 (Tone Mapping)
```

---

## Tone Mapping

HDR 값을 SDR(0~1) 범위로 자연스럽게 압축.

```glsl
// Reinhard Tone Mapping
vec3 mapped = hdrColor / (hdrColor + vec3(1.0));

// ACES Filmic (영화 표준, 더 자연스러움)
vec3 a = hdrColor * (2.51 * hdrColor + 0.03);
vec3 b = hdrColor * (2.43 * hdrColor + 0.59) + 0.14;
vec3 mapped = clamp(a / b, 0.0, 1.0);
```

---

## Babylon.js에서 색공간 설정

```typescript
// 씬 전체 톤 매핑 설정
scene.imageProcessingConfiguration.toneMappingEnabled = true;
scene.imageProcessingConfiguration.toneMappingType =
  ImageProcessingConfiguration.TONEMAPPING_ACES;

// 감마 보정 활성화
scene.imageProcessingConfiguration.colorGradingEnabled = true;

// 텍스처 로드 시 감마 공간 명시
const tex = new Texture('/textures/albedo.png', scene);
tex.gammaSpace = true; // sRGB 텍스처임을 명시 (기본값)
```

---

## 정리

```
텍스처 (sRGB)
    ↓ 로드 시 자동 변환
Linear 공간에서 PBR 조명 계산
    ↓ Tone Mapping
SDR (0~1) 변환
    ↓ Gamma 보정
모니터 출력 (sRGB)
```

---

## 다음 단계

→ [03. 셰이더](../../03-shader)
