import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-button'],
          'query-vendor': ['@tanstack/react-query'],
          
          // ML libraries - separate chunks for lazy loading
          'ml-transformers': ['@huggingface/transformers'],
          'ml-ocr': ['tesseract.js'],
          
          // Capacitor
          'capacitor': ['@capacitor/core', '@capacitor/camera', '@capacitor/haptics'],
        },
      },
    },
  },
}));
