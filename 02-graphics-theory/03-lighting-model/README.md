# 03. 조명 모델 (Lighting Model)

빛이 물체 표면에서 어떻게 반사되는지 수학으로 근사하는 모델.
Phong 조명 모델은 가장 기본적이고 직관적인 모델이다.

---

## 조명의 3요소 (Phong Model)

### Ambient (환경광)

직접 빛이 닿지 않아도 보이는 기본 밝기. 실제 세계에서 간접 조명 효과.

```glsl
vec3 ambient = ambientStrength * lightColor;
// 예: 0.1 * (1.0, 1.0, 1.0) = (0.1, 0.1, 0.1)
```

### Diffuse (난반사광)

빛이 표면에 부딪혀 모든 방향으로 고르게 반사. 면의 기울기(노멀)에 따라 밝기 결정.

```glsl
// 내적으로 빛과 노멀 사이 각도 계산
float diff = max(dot(normal, lightDir), 0.0);
vec3 diffuse = diff * lightColor;

// diff = 1.0 : 빛이 직각으로 입사 (가장 밝음)
// diff = 0.0 : 빛이 평행하거나 뒷면 (어두움)
```

### Specular (정반사광)

빛이 거울처럼 반사되어 특정 각도에서만 보이는 하이라이트.

```glsl
vec3 reflectDir = reflect(-lightDir, normal);
float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
vec3 specular = specularStrength * spec * lightColor;

// shininess: 높을수록 하이라이트가 작고 선명 (금속 느낌)
// 낮을수록 퍼지고 부드러움 (플라스틱, 피부 느낌)
```

### 최종 합산

```glsl
vec3 result = (ambient + diffuse + specular) * objectColor;
gl_FragColor = vec4(result, 1.0);
```

---

## 조명 종류

### Directional Light (방향 조명)

```
태양처럼 무한히 멀리 있어서 모든 광선이 평행

lightDir = normalize(vec3(-1.0, -1.0, -1.0)); // 고정 방향
```

### Point Light (점 조명)

```
전구처럼 한 점에서 모든 방향으로 빛 발산
거리에 따라 감쇠(Attenuation)

float dist = length(lightPos - fragPos);
float attenuation = 1.0 / (constant + linear * dist + quadratic * dist * dist);
```

### Spot Light (스팟 조명)

```
손전등처럼 원뿔 모양으로 빛 발산
내각(inner cone)과 외각(outer cone)으로 경계 부드럽게 처리

float theta = dot(lightDir, normalize(-light.direction));
float epsilon = light.innerCutoff - light.outerCutoff;
float intensity = clamp((theta - light.outerCutoff) / epsilon, 0.0, 1.0);
```

### Hemispheric Light (반구 조명)

```
Babylon.js 특유의 조명
위에서 하늘색, 아래에서 지면색이 섞임 (자연스러운 환경광)

new HemisphericLight('light', new Vector3(0, 1, 0), scene);
light.diffuse = new Color3(1, 1, 1);   // 하늘색
light.groundColor = new Color3(0.3, 0.2, 0.1); // 지면색
```

---

## Phong vs Blinn-Phong

```
Phong: reflect 벡터와 viewDir의 각도 사용
  → 시야각이 클 때 하이라이트가 잘림

Blinn-Phong: halfway 벡터와 normal의 각도 사용
  → 더 자연스럽고 빠름 (대부분의 엔진에서 채택)

halfway = normalize(lightDir + viewDir);
float spec = pow(max(dot(normal, halfway), 0.0), shininess);
```

---

## Babylon.js에서 조명 설정

```typescript
import { DirectionalLight, HemisphericLight, PointLight, Vector3, Color3 } from '@babylonjs/core';

// 방향 조명
const dirLight = new DirectionalLight('dir', new Vector3(-1, -2, -1), scene);
dirLight.intensity = 0.8;

// 반구 조명 (배경 분위기용)
const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
hemi.intensity = 0.3;

// 포인트 라이트
const point = new PointLight('point', new Vector3(0, 5, 0), scene);
point.diffuse = new Color3(1, 0.5, 0);
point.range = 20;
```

---

## 다음 단계

→ [04. PBR (물리 기반 렌더링)](../04-pbr)
