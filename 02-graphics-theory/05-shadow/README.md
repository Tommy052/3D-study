# 05. 그림자 (Shadow)

그림자는 장면의 사실감을 크게 높이는 요소다.
가장 기본적인 방법은 Shadow Map이다.

---

## Shadow Map 원리

```
1단계: 빛의 시점에서 씬을 렌더링
       → 각 픽셀의 깊이값만 저장 (Shadow Map 텍스처)

2단계: 카메라 시점에서 렌더링
       → 각 픽셀이 빛에서 보이는지 Shadow Map으로 확인
       → 보이면 빛 받음 (밝음)
       → 안 보이면 그림자 (어두움)
```

---

## Shadow Map 비교

```glsl
// 프래그먼트 셰이더에서
float shadow = 0.0;

// 현재 픽셀의 빛 공간 깊이
float currentDepth = lightSpacePos.z;

// Shadow Map에서 가져온 깊이 (빛에서 본 가장 가까운 깊이)
float closestDepth = texture(shadowMap, lightSpaceUV).r;

// 현재 픽셀이 가장 가까운 것보다 뒤에 있으면 그림자
if (currentDepth - bias > closestDepth) {
  shadow = 1.0; // 그림자
}
```

---

## Shadow Acne (그림자 여드름)

Shadow Map 해상도 한계로 발생하는 자기 그림자 오류.

```
해결법: bias (편향값) 추가
currentDepth - bias > closestDepth

bias가 너무 작으면 → Acne 발생
bias가 너무 크면  → Peter Panning (그림자가 물체에서 떠 보임)
```

---

## PCF (Percentage Closer Filtering)

Shadow Map 경계를 부드럽게 만드는 기법.

```glsl
float shadow = 0.0;
vec2 texelSize = 1.0 / textureSize(shadowMap, 0);

// 주변 9개 샘플 평균
for (int x = -1; x <= 1; x++) {
  for (int y = -1; y <= 1; y++) {
    float pcfDepth = texture(shadowMap, lightSpaceUV + vec2(x, y) * texelSize).r;
    shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
  }
}
shadow /= 9.0; // 0~1 사이의 부드러운 값
```

---

## Babylon.js에서 그림자 설정

```typescript
import { ShadowGenerator, DirectionalLight } from '@babylonjs/core';

// 그림자를 드리울 조명 (DirectionalLight, SpotLight, PointLight)
const light = new DirectionalLight('light', new Vector3(-1, -2, -1), scene);

// ShadowGenerator 생성 (해상도: 1024, 2048, 4096)
const shadowGenerator = new ShadowGenerator(2048, light);

// 그림자를 만드는 메쉬 등록
shadowGenerator.addShadowCaster(box);
shadowGenerator.addShadowCaster(sphere);

// 그림자를 받는 메쉬 설정
ground.receiveShadows = true;

// 그림자 부드럽게 (PCF)
shadowGenerator.usePercentageCloserFiltering = true;

// 또는 PCSS (더 자연스러운 부드러운 그림자)
shadowGenerator.useContactHardeningShadows = true;
```

---

## 그림자 품질 vs 성능

| 방법 | 품질 | 성능 |
|------|------|------|
| Hard Shadow | 낮음 | 빠름 |
| PCF | 중간 | 중간 |
| PCSS | 높음 | 느림 |
| VSM | 높음 | 중간 |

---

## 다음 단계

→ [06. 텍스처 매핑 (Texture Mapping)](../06-texture-mapping)
