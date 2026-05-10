import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV !== 'production'
const keyPath = path.resolve(__dirname, 'key.pem')
const certPath = path.resolve(__dirname, 'cert.pem')

let useLocalCerts = false
let httpsOption = true

if (isDev && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  try {
    httpsOption = {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8'),
    }
    useLocalCerts = true
    console.log('✅ Using existing SSL certificates (key.pem / cert.pem)')
  } catch (e) {
    console.log('⚠️  Error loading certificates, using @vitejs/plugin-basic-ssl:', e.message)
  }
} else if (isDev) {
  console.log('🔐 Using @vitejs/plugin-basic-ssl (optional: ./generate-certs.sh → key.pem & cert.pem)')
}

const plugins = [react()]
if (isDev && !useLocalCerts) {
  plugins.push(basicSsl())
}

export default defineConfig({
  plugins,
  root: '.',
  publicDir: 'public',
  server: {
    https: isDev ? httpsOption : false,
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  appType: 'spa',
})
