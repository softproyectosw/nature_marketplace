import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration for Nature Marketplace
 * 
 * This configuration matches the design system from frontend-base/
 * Preserving the Eco-Luxury dark theme with glassmorphism effects.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - vibrant green
        primary: '#30e87a',
        
        // Background colors
        'background-light': '#f6f8f7',
        'background-dark': '#112117',
        
        // Accent colors
        'olive-green': '#6B8E23',
        'olive-light': '#93C8A8',
        'navy-blue': '#001f3f',
        'light-blue': '#89cff0',
        'nude': '#f5f5dc',
        'terra': '#e0a387',
        
        // Card and surface colors
        'dark-card': '#1A3123',
        
        // Wood tones
        'wood': '#5D4037',
        'wood-light': '#8D6E63',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
