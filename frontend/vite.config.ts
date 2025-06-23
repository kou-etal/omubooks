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
    host: 'mysns.test',
    port: 5173,
    https: {
      key: fs.readFileSync('C:/laragon/etc/ssl/mysns.test-key.pem'),
      cert: fs.readFileSync('C:/laragon/etc/ssl/mysns.test.pem'),
    },
    hmr: {
      protocol: 'wss',
      host: 'mysns.test',
      port: 5173,
    },
  }
})

/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    open: true,
    historyApiFallback: true
  }
})*/

