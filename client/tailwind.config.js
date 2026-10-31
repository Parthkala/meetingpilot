const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#050505', // Product Space Obsidian Void
          1: '#0B1120', // Dark Midnight Navy / Sidebar
          2: '#0F172A', // Slate Surface / Card base
          3: '#1E293B', // Elevated Card / Hover state
          4: '#28364F', // Accent containers
          navy: '#001C45', // Product Space Signature Navy Card
        },
        border: {
          DEFAULT: '#1E293B',
          subtle: '#141F32',
          glow: '#0063F7',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          mint: '#00FFAC',
          cyan: '#5BBEEF',
        },
        accent: {
          blue: '#0063F7',    // Product Space Electric Blue
          sky: '#5BBEEF',     // Sky Blue
          mint: '#00FFAC',    // Signature Product Space Neon Mint
          amber: '#FFB800',   // Vivid Cyber Amber
          red: '#FF3B5C',     // High-voltage Neon Red
          green: '#00FFAC',   // Neon Mint / Confirmed
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #5BBEEF, #0063F7)',
        'hero-gradient': 'linear-gradient(135deg, #001C45 0%, #0F172A 100%)',
        'mint-gradient': 'linear-gradient(to right, #00FFAC, #00C3FF)',
      },
      boxShadow: {
        'brand-glow': '0 0 25px -4px rgba(0, 99, 247, 0.4)',
        'mint-glow': '0 0 20px -3px rgba(0, 255, 172, 0.35)',
      },
    },
  },
  plugins: [],
};
