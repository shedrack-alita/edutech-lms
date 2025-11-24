/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		colors: {
		  primary: {
			DEFAULT: "#9f2c0f",
			hover: "#8a2609",
		  },
		  secondary: {
			DEFAULT: "#1b161f",
		  },
		},
	  },
	},
	plugins: [require('@tailwindcss/typography')],  
  };