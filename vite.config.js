import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/uplot-annotations/',
  build: {
    outDir: 'dist',
  },
  server: {
    open: '/anno.html',
  },
});
