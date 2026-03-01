import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/women-safety/',  // ⚠️ your repo name
  plugins: [react()],
})
