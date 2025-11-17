import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  base: './',
  build: {
    emptyOutDir: true,
    outDir: './dist', // Cambia esto si necesitas otra ubicación
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  }
});