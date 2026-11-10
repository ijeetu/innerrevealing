import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	important: true,
	darkMode: ["class", "[data-theme='dark']"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)'
			},
			fontFamily: {
				montserrat: [
					'var(--font-montserrat)',
					'sans-serif'
				],
				poppins: [
					'var(--font-poppins)',
					'sans-serif'
				],
				roboto: [
					'var(--font-roboto)',
					'sans-serif'
				],
				sans: [
					'var(--font-poppins)',
					'system-ui',
					'sans-serif'
				]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			screens: {
				"between-1800-2500": {
					min: "1800px",
					max: "2500px",
				},
				"between-1200-1399": {
					min: "1200px",
					max: "1399px",
				},
				"between-1400-1680": {
					min: "1400px",
					max: "1680px",
				},
				"between-992-1199": {
					min: "992px",
					max: "1199px",
				},
				"between-768-991": {
					min: "768px",
					max: "991px",
				},
				"between-576-767": {
					min: "576px",
					max: "767px",
				},
				"between-400-575": {
					min: "400px",
					max: "575px",
				},
				"max-1680": {
					max: "1680px",
				},
				"max-1199": {
					max: "1199px",
				},
				"max-575": {
					max: "575px",
				},
				"max-479": {
					max: "479px",
				},
				"max-407": {
					max: "407px",
				},
				"max-399": {
					max: "399px",
				},
				"max-376": {
					max: "376px",
				},
				"max-321": {
					max: "321px",
				},
			},
			keyframes: {
				float: {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				float: 'float 2.5s ease-in-out infinite',
				'float-delayed': 'float 2.5s ease-in-out 0.5s infinite',
				'accordion-down': 'accordion-down 300ms ease-out',
				'accordion-up': 'accordion-up 300ms ease-out',
			}
		},
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				lg: '2rem',
				xl: '2rem',
				'2xl': '2rem'
			},
			screens: {
				md: '48rem',
				lg: '64rem',
				xl: '80rem',
				'2xl': '1620px',
			},
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
