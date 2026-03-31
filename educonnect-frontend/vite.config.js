import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'window', // ⬅️ This is the key fix
  },
  server: {
    host: true, // This exposes to your IP (0.0.0.0)
    port: 5173,
  },
});
