import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isLocal = mode === 'dev'
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        server: {
            port: 5173,
            proxy: isLocal
                ? {
                    '/api': {
                        target: 'http://localhost:8080',
                        changeOrigin: true,
                        rewrite: (path) => path.replace(/^\/api/, '')
                    }
                }
                : undefined
        }
    }
})
