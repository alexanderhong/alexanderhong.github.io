export function toonVertex() {
  return `
    varying vec4 v_position;
    varying vec4 v_normal;

    void main() {
      v_position = modelViewMatrix * vec4(position, 1.0);
      v_normal = vec4(normalize(vec3(modelViewMatrix*vec4(normal, 0.0))), 0.0);
      gl_Position = projectionMatrix * v_position;
    }
  `
}

export function toonFragment() {
  return `
    // uniforms from geometry
    uniform vec3 baseColor;
    uniform float k_ambient;
    uniform float k_diffuse;
    uniform float k_specular;
    uniform float k_rim;
    uniform float p;
    // uniforms for camera and lights
    uniform vec3 cameraPos;
    uniform vec3 lightPos;
    uniform vec3 lightIntensity;
    uniform vec3 lightColor;
    // outputs from vertex shader
    varying vec4 v_position;
    varying vec4 v_normal;

    void main() {
      // blinn-phong shader
      float NdotL = dot(lightPos, v_normal.xyz);
      float r = length(lightPos - v_position.xyz); // radius
      vec3 h = (cameraPos + lightPos) / length(cameraPos + lightPos); // half-vector

      float toon = (NdotL > 1.5) ? 1. : 0.;
      toon = smoothstep(1.5, 1.7, NdotL); // blurs the light and shadow edge

      vec4 toonLight = vec4(toon * (lightIntensity / (r * r)), 1.0);
      vec4 ambient = k_ambient * vec4(1.0, 1.0, 1.0, 1.0);

      float specularSize = (NdotL > 3.55) ? 1. : 0.;
      vec4 specular = vec4(k_specular * (lightIntensity / (r * r)) * pow(max(0.0, dot(normalize(v_normal.xyz), normalize(h))), p), 1.0);
      specular = specular * specularSize;
      specular = vec4(lightColor, 1.0) * specular;
      specular = smoothstep(0.01, 0.03, specular);

      // surrounding color to specular light
      float softToon = (NdotL > 3.15) ? 1. : 0.;
      softToon = smoothstep(3.15, 3.2, NdotL);
      vec4 specularSoft = vec4(softToon * (lightIntensity / (r * r)) * 0.3, 1.0);
      specularSoft = specularSoft * (1.5 * vec4(lightColor, 1.0));

      float rim = 1.0 - max(0., abs(dot(normalize(v_position.xyz), normalize(v_normal.xyz))));
      rim = smoothstep(0.7, 0.95, rim);
      rim = rim * pow(NdotL, 3.);
      vec4 rimLight = k_rim * vec4(1.0, 1.0, 1.0, 1.0) * rim;
      rimLight = rimLight * (0.25 * vec4(lightColor, 1.0));
      gl_FragColor = vec4(baseColor, 1.0) * (toonLight + rimLight + specularSoft + ambient + specular);
    }
  `
}
