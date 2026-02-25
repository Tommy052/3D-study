# 03. 조명 모델 (Lighting Model)

빛이 물체 표면에서 어떻게 반사되는지 수학으로 근사하는 모델.
Phong 조명 모델은 가장 기본적이고 직관적인 모델이다.

---

## 추천 강의

| 영상 | 설명 |
|------|------|
| [![CMU 15-462 Lighting](https://img.youtube.com/vi/tFx1MaIb9cg/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Radiometry & Photometry**<br>빛의 물리학적 특성, 조명 모델의 수학적 기초<br>⏱ 80분 · 🎓 Carnegie Mellon University |
| [![CMU 15-462 Materials](https://img.youtube.com/vi/E3Phj6J287o/mqdefault.jpg)](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) | **CMU 15-462 — Material Modeling**<br>BRDF, 표면 반사 모델, Phong/Blinn-Phong<br>⏱ 80분 · 🎓 Carnegie Mellon University |

> 📋 [CMU 15-462 전체 플레이리스트](https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E) · [LearnOpenGL — Basic Lighting](https://learnopengl.com/Lighting/Basic-Lighting)

---

## 조명의 3요소 (Phong Model)

### Ambient (환경광)
```glsl
vec3 ambient = ambientStrength * lightColor;
// 예: 0.1 * (1,1,1) = (0.1, 0.1, 0.1) → 어두운 곳도 완전히 검지 않음
```

### Diffuse (난반사광)
```glsl
// 내적으로 빛과 노멀 사이 각도 계산
float diff = max(dot(normal, lightDir), 0.0);
vec3 diffuse = diff * lightColor;
// diff = 1.0 → 빛이 직각 입사 (가장 밝음)
// diff = 0.0 → 빛이 평행/뒷면 (어두움)
```

### Specular (정반사광)
```glsl
// Blinn-Phong: halfway 벡터 사용 (더 자연스럽고 빠름)
vec3 halfwayDir = normalize(lightDir + viewDir);
float spec = pow(max(dot(norm, halfwayDir), 0.0), shininess);
vec3 specular = specularStrength * spec * lightColor;
// shininess 높음 → 하이라이트 작고 선명 (금속)
// shininess 낮음  → 퍼지고 부드러움 (플라스틱)
```

### 최종 합산
```glsl
vec3 result = (ambient + diffuse + specular) * objectColor;
gl_FragColor = vec4(result, 1.0);
```

---

## Phong vs Blinn-Phong

```
Phong:      reflect(lightDir, normal)과 viewDir의 각도
            → 시야각 클 때 하이라이트가 잘림

Blinn-Phong: halfway = normalize(lightDir + viewDir)와 normal의 각도
             → 더 자연스럽고 빠름 (대부분의 엔진에서 채택)
```

---

## 조명 종류

| 종류 | 특징 | 사용 사례 |
|------|------|---------|
| **Directional** | 무한히 멀리서 평행하게 | 태양 |
| **Point** | 한 점에서 방사형으로 | 전구, 불꽃 |
| **Spot** | 원뿔 모양 | 손전등, 무대 조명 |
| **Hemispheric** | 위/아래 두 색상 혼합 | Babylon.js 환경광 |

---

## Babylon.js에서 조명

```typescript
import { DirectionalLight, HemisphericLight, PointLight, Vector3 } from '@babylonjs/core';

// 방향 조명 (태양)
const dir = new DirectionalLight('dir', new Vector3(-1, -2, -1), scene);
dir.intensity = 0.8;

// 환경광
const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
hemi.intensity = 0.3;

// 포인트 라이트
const point = new PointLight('point', new Vector3(0, 5, 0), scene);
point.range = 20;
```

---

## 다음 단계

→ [04. PBR (물리 기반 렌더링)](../04-pbr)
