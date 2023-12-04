import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csp: {
			directives: {
				'default-src': ['none'],
				'style-src': ['self'],
				'img-src': ['self'],
				'script-src': ['self'],
				'connect-src': ['self'],
				'form-action': ['self'],
				'base-uri': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
