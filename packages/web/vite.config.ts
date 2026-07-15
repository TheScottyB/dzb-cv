import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dzb-cv/types': resolve(__dirname, '../types/src'),
      '@dzb-cv/ui': resolve(__dirname, '../ui/src'),
      '@dzb-cv/templates': resolve(__dirname, '../templates/src'),
    },
  },
  server: {
    port: 3000,
  },
});
