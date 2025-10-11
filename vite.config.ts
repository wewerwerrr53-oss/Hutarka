import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // Замените на имя вашего репозитория
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  envPrefix: 'VITE_', // Явно указываем префикс для env-переменных
  server: {
    port: 3000, // Можно задать конкретный порт
    strictPort: true, // Запрещает автоматический выбор порта
  },
  build: {
    sourcemap: process.env.NODE_ENV !== 'production', // sourcemap только в development
  },
});
