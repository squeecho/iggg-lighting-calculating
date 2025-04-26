/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {   // 기본 테마 그대로
    extend: {},
  },
  plugins: [],   // 필요하면 'tailwind-scrollbar' 등 나중에 추가
};