export function segVertex() {
	return `
		varying vec2 vUv;


		void main() {
			vUv = uv;
			vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
			gl_Position = projectionMatrix * modelViewPosition;
		}
	`
}

export function segFragment() {
  return `
    uniform sampler2D render;
    uniform vec3 color;
		varying vec2 vUv;

    vec4 mask(sampler2D render, vec2 uv) {
      vec3 idColor = texture2D(render, uv).rgb;
      if (idColor == color) {
				return vec4(0., 0., 0., 1.0);
			}
      return vec4(0., 0., 0., 0.0);
    }

    void main() {
      gl_FragColor = mask(render, vUv);
      // gl_FragColor.a = 1.;
    }
  `
}

export function addFragment() {
  return `
    uniform sampler2D render1;
		uniform sampler2D render2;
		varying vec2 vUv;

    void main() {
			vec4 color1 = texture2D(render1, vUv);
			vec4 color2 = texture2D(render2, vUv);
			if (color1.a != 0. && color2.a != 0.) {
				gl_FragColor.rgb = color1.a > color2.a ? color1.rgb : color2.rgb;
				gl_FragColor.a = color1.a > color2.a ? color1.a : color2.a;
			}
			else if (color1.a != 0.) {
				gl_FragColor.rgb = color1.rgb;
				gl_FragColor.a = color1.a;
			}
			else if (color2.a != 0.){
				gl_FragColor.rgb = color2.rgb;
				gl_FragColor.a = color2.a;
			}
			else {
				gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
			}
    }
  `
}
