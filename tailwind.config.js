/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core neutrals
        charcoal: '#162422', // Fixed: Resolves `bg-charcoal` in index.css
        pine: '#162422',

        // ⭐ Paddle Place Core Deep Teal
        'brand-teal': {
          50: '#F0F6F5',
          100: '#DCECEC',
          200: '#B6D3D0',
          300: '#86B3AD',
          400: '#48877E',
          500: '#115259',
          600: '#0E4348',
          700: '#0B3438',
          800: '#092629',
          900: '#061A1C',
          950: '#030E0F',
        },

        forest: {
          50: '#F0F6F5',
          100: '#DCECEC',
          200: '#B6D3D0',
          300: '#86B3AD',
          400: '#48877E',
          500: '#115259',
          600: '#0E4348',
          700: '#0B3438',
          800: '#092629',
          900: '#061A1C',
          950: '#030E0F',
        },

        // ⭐ Court Mint / Seafoam
        mint: {
          50: '#F7FCF9',
          100: '#EEF7F2',
          200: '#DDEFE6',
          300: '#C7E4D5',
          400: '#B6DAC8',
          500: '#94C6AE',
          600: '#6FA88E',
          700: '#4F846C',
          800: '#35614E',
          900: '#1F4032',
        },

        // ⭐ Muted Slate Green
        sage: {
          50: '#F5F8F7',
          100: '#E9EFEF',
          200: '#D3DFDD',
          300: '#ADC4C0',
          400: '#86A7A1',
          500: '#688D87',
          600: '#52726C',
          700: '#3F5853',
          800: '#2F413D',
          900: '#202C29',
        },

        cream: {
          DEFAULT: '#F8FAF9',
          50: '#FFFFFF',
          100: '#F2F6F5',
          200: '#E6ECE9',
          muted: '#8CA59F',
        },

        // Backward compatibility for existing UI buttons / badges
        gold: {
          50: '#F0F6F5',
          100: '#DCECEC',
          200: '#B6D3D0',
          300: '#86B3AD',
          400: '#115259',
          500: '#0E4348',
          600: '#0B3438',
          700: '#092629',
          800: '#061A1C',
          900: '#030E0F',
        },

        'brand-blue': {
          50: '#F0F6F5',
          100: '#DCECEC',
          200: '#B6D3D0',
          300: '#B6DAC8',
          400: '#48877E',
          500: '#115259',
          600: '#0E4348',
          700: '#0B3438',
          800: '#092629',
          900: '#061A1C',
          950: '#030E0F',
        },

        // Status utility colors
        success: '#1B9A59',
        error: '#E04F44',
        warning: '#E59B23',
      },

      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Montserrat', 'sans-serif'],
        sub: ['Montserrat', 'Inter', 'sans-serif'],
      },

      boxShadow: {
        'glow-teal': '0 0 0 1px rgba(17,82,89,0.3), 0 8px 24px rgba(17,82,89,0.2)',
        'glow-mint': '0 0 0 2px rgba(182,218,200,0.5), 0 8px 20px rgba(182,218,200,0.3)',
        card: '0 2px 12px rgba(17,82,89,0.06)',
        'card-lg': '0 8px 30px rgba(17,82,89,0.1)',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};