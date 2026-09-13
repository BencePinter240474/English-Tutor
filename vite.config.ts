import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from https://<user>.github.io/English-Tutor/, so every
// asset URL needs that prefix in production. Locally it stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/English-Tutor/' : '/',
  plugins: [react()],
}));
