import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
  host: "omubooks.test",
  port: 5173,
  hmr: {
    protocol: 'ws', // ← https → http の場合、wss → ws に変更
    host: 'omubooks.test',
    port: 5173,
  },
}
})
