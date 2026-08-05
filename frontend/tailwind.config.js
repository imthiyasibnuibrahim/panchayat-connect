/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        panchayat: {
          primary: '#047857',      // Emerald 700
          'primary-dark': '#064E3B', // Emerald 900
          secondary: '#D97706',    // Amber 600
          teal: '#0D9488',         // Teal 600
          surface: '#F8FAFC',      // Slate 50
          card: '#FFFFFF',
          text: '#0F172A',         // Slate 900
          muted: '#475569',        // Slate 600
          border: '#E2E8F0',       // Slate 200
          disabled: '#F1F5F9',     // Slate 100
        },
        emergency: {
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FCA5A5',
        },
        pending: {
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FCD34D',
        },
        approved: {
          bg: '#F0FDF4',
          text: '#16A34A',
          border: '#86EFAC',
        },
        info: {
          bg: '#EFF6FF',
          text: '#2563EB',
          border: '#93C5FD',
        },
        role: {
          citizen: '#047857',
          farmer: '#B45309',
          employee: '#1E293B',
          admin: '#4338CA',
        }
      }
    }
  },
  plugins: [],
}
