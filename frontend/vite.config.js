import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 2500,
    host: true, // Makes it accessible via local IP (e.g., for mobile testing)
    open: true, // Auto-opens browser on server start
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // So you can do `@/components/YourComponent`
    },
  },

  build: {
    target: "esnext", // Modern JS output
    outDir: "dist",   // Output directory
    sourcemap: false, // Disable source maps for faster builds
    minify: "esbuild", // Use esbuild for super-fast minification
  },

  css: {
    devSourcemap: false, // Disable CSS source maps unless needed
  },
})
