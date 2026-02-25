# 프래그먼트 셰이더 (Fragment Shader)

래스터화 이후 각 픽셀마다 한 번씩 실행.
최종 픽셀의 색상을 결정한다.

---

## 역할

```
입력: 보간된 varying 값 (UV, 노멀, 위치 등)
출력: 픽셀의 최종 색상 (gl_FragColor)

주요 작업:
  - 텍스처 샘플링
  - 조명 계산
  - 색상 합성
```

---

## 최소 프래그먼트 셰이더

```glsl
precision mediump float; // 정밀도 선언 (필수)

void main() {
  gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0); // 주황색
}
```

---

## 텍스처 샘플링

```glsl
precision mediump float;

uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
  vec4 texColor = texture2D(u_texture, v_uv);
  gl_FragColor = texColor;
}
```

---

## Phong 조명 계산

```glsl
precision mediump float;

uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform vec3 u_lightColor;
uniform vec3 u_objectColor;

varying vec3 v_worldPos;
varying vec3 v_normal;

void main() {
  // Ambient
  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * u_lightColor;

  // Diffuse
  vec3 norm = normalize(v_normal);
  vec3 lightDir = normalize(u_lightPos - v_worldPos);
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * u_lightColor;

  // Specular (Blinn-Phong)
  float specularStrength = 0.5;
  vec3 viewDir = normalize(u_cameraPos - v_worldPos);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(norm, halfwayDir), 0.0), 32.0);
  vec3 specular = specularStrength * spec * u_lightColor;

  // 최종 색상
  vec3 result = (ambient + diffuse + specular) * u_objectColor;
  gl_FragColor = vec4(result, 1.0);
}
```

---

## 유용한 내장 함수

```glsl
// 수학
abs(x)           // 절댓값
floor(x)         // 내림
ceil(x)          // 올림
mod(x, y)        // 나머지
pow(x, y)        // 거듭제곱
sqrt(x)          // 제곱근

// 벡터
length(v)        // 벡터 크기
normalize(v)     // 정규화
dot(a, b)        // 내적
cross(a, b)      // 외적
reflect(i, n)    // 반사 벡터

// 보간
mix(a, b, t)     // 선형 보간 (lerp)
clamp(x, 0., 1.) // 0~1 범위로 제한
smoothstep(e0, e1, x) // 부드러운 보간

// 텍스처
texture2D(sampler, uv)    // 2D 텍스처 샘플링
textureCube(sampler, dir) // 큐브맵 샘플링
```

---

## 조기 종료 (Discard)

픽셀을 아예 그리지 않음 — 투명 마스킹에 활용.

```glsl
uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
  vec4 color = texture2D(u_texture, v_uv);

  // 알파가 0.5 미만이면 픽셀 버림
  if (color.a < 0.5) discard;

  gl_FragColor = color;
}
```

---

## 다음 단계

→ [03. Uniform & Varying](../03-uniforms-varyings)
