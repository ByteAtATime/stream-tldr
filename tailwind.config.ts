import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['selector', "[data-theme='forest']"],

	theme: {
		extend: {}
	},

	daisyui: {
		themes: ['emerald', 'forest'],
		darkTheme: 'forest'
	},

	plugins: [require('@tailwindcss/typography'), require('daisyui')]
} as Config;
