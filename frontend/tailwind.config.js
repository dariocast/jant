/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Lora"', '"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        pastel: {
          cream: '#FFFDF5',
          amber: '#FEF3C7',
          yellow: '#FEF9C3',
          sage: '#DCFCE7',
          mint: '#CCFBF1',
          sky: '#E0F2FE',
          blue: '#DBEAFE',
          indigo: '#E0E7FF',
          lavender: '#F3E8FF',
          pink: '#FCE7F3',
          rose: '#FFE4E6',
          peach: '#FFEDD5',
          stone: '#F5F5F4',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
