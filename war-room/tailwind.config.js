/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'war-room': {
          bg: '#0a0e1a',
          panel: '#111827',
          border: '#1f2937',
          accent: '#3b82f6',
          critical: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          text: '#e5e7eb',
          'text-dim': '#9ca3af'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

// Made with Bob
