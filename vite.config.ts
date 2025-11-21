import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'src/assets/images/**/*', dest: 'images' },
        { src: 'src/assets/icons/**/*', dest: 'icons' },
      ]
    }),
  ],
  resolve: {
    alias:{
      '@': path.resolve(__dirname,'./src'),
      '@assets': path.resolve(__dirname,'./src/assets')
    }
  }
})
