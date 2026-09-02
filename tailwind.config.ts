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
        card: {
          DEFAULT: '#0D1322',
          hover: '#131B2E',
          elevated: '#111827',
        },
        border: {
          DEFAULT: 'rgba(51, 65, 85, 0.45)',
          subtle: 'rgba(30, 41, 59, 0.6)',
          active: 'rgba(239, 68, 68, 0.4)',
        },
        primary: {
          DEFAULT: '#00F59B',
          foreground: '#070A12',
        },
        admin: {
          DEFAULT: '#EF4444',
          subtle: 'rgba(239, 68, 68, 0.12)',
          glow: 'rgba(239, 68, 68, 0.25)',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      boxShadow: {
        'glow-admin': '0 0 30px -5px rgba(239, 68, 68, 0.25)',
        'glow-emerald': '0 0 30px -5px rgba(0, 245, 155, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
