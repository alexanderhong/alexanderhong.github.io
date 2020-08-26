export function stepVertex() {
	return `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
			gl_Position = projectionMatrix * modelViewPosition;
		}
	`
}

export function stepFragment() {
	return `
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		vec4 step_tex(sampler2D image, vec2 uv) {
			float kp = 0.1;
			vec4 rho_xy = texture2D(image, vec2(uv.x, uv.y));
			rho_xy.a = 0.4 * step(kp, rho_xy.a);
			return rho_xy;
		}
		void main() {
			gl_FragColor = step_tex(tDiffuse, vUv);
			// gl_FragColor.a = 1.;
		}
	`
}
