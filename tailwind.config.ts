import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070A12',
        foreground: '#F8FAFC',
        card: '#0D1322',
        border: '#1E293B',
        primary: {
          DEFAULT: '#00F59B',
          foreground: '#090D16',
        },
        admin: {
          DEFAULT: '#EF4444',
          subtle: 'rgba(239, 68, 68, 0.1)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
