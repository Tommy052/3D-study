# 05. 그림자 (Shadow)

그림자는 장면의 사실감을 크게 높이는 요소다.
가장 기본적인 방법은 Shadow Map이다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![ThinMatrix Shadow Mapping](https://img.youtube.com/vi/9sEHkT7N7RM/mqdefault.jpg)](https://www.youtube.com/watch?v=9sEHkT7N7RM) | **OpenGL Tutorial 39 — Shadow Mapping (2/3)**<br>PCF로 그림자 경계를 부드럽게 처리하는 방법<br>⏱ 20분 · 🎓 ThinMatrix |
| [![CMU 15-462 Shadow](https://img.youtube.com/vi/t7Ztio8cwqM/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Depth & Shadow Techniques**<br>Shadow Map 수학적 원리와 최적화 기법<br>⏱ 80분 · 🎓 Carnegie Mellon University |

> 📖 텍스트 레퍼런스: [LearnOpenGL — Shadow Mapping](https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping)

---

## Shadow Map 원리

```
1단계: 빛의 시점에서 씬을 렌더링
       → 각 픽셀의 깊이값만 저장 (Shadow Map 텍스처)

2단계: 카메라 시점에서 렌더링
       → 각 픽셀을 Shadow Map과 비교
       → 빛에서 보이면 → 밝음
       → 빛에서 안 보이면 → 그림자
```

---

## Shadow Map 비교 코드

```glsl
// 프래그먼트 셰이더에서
float currentDepth = lightSpacePos.z;
float closestDepth = texture(shadowMap, lightSpaceUV).r;

// bias: Shadow Acne(자기 그림자) 방지
float bias = 0.005;
float shadow = (currentDepth - bias > closestDepth) ? 1.0 : 0.0;
```

---

## Shadow Acne (그림자 여드름)

```
문제: Shadow Map 해상도 한계로 발생하는 자기 그림자 오류

해결: bias (편향값) 추가
  bias 너무 작으면 → Acne 발생
  bias 너무 크면  → Peter Panning (그림자가 물체에서 떠 보임)

적정값: 빛의 방향과 면의 각도에 따라 동적으로 계산
  float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
```

---

## PCF (Percentage Closer Filtering)

그림자 경계를 부드럽게 만드는 기법.

```glsl
float shadow = 0.0;
vec2 texelSize = 1.0 / textureSize(shadowMap, 0);

// 주변 9개 샘플 평균
for(int x = -1; x <= 1; x++) {
  for(int y = -1; y <= 1; y++) {
    float pcfDepth = texture(shadowMap, lightSpaceUV + vec2(x, y) * texelSize).r;
    shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
  }
}
shadow /= 9.0;
```

---

## Babylon.js에서 그림자

```typescript
import { ShadowGenerator, DirectionalLight } from '@babylonjs/core';

const light = new DirectionalLight('light', new Vector3(-1, -2, -1), scene);
const shadowGen = new ShadowGenerator(2048, light); // 해상도: 1024/2048/4096

shadowGen.addShadowCaster(box);     // 그림자를 만드는 메쉬
shadowGen.addShadowCaster(sphere);

ground.receiveShadows = true;       // 그림자를 받는 메쉬

// 품질 설정
shadowGen.usePercentageCloserFiltering = true; // PCF
// 또는
shadowGen.useContactHardeningShadows = true;   // PCSS (가장 자연스러움)
```

---

## 그림자 품질 vs 성능

| 방법 | 품질 | 성능 |
|------|------|------|
| Hard Shadow | 낮음 | 빠름 |
| PCF | 중간 | 중간 |
| PCSS | 높음 | 느림 |

---

## 다음 단계

→ [06. 텍스처 매핑 (Texture Mapping)](../06-texture-mapping)
