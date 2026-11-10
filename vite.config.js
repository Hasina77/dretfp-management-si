import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true, 
    allowedHosts: ['dretfp.mg', 'www.dretfp.mg'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'), 
        chef: resolve(import.meta.dirname, 'chef.html')   
      }
    }
  }
});
