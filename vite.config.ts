import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'

// https://vite.dev/config/
export default defineConfig({
        base: process.env.NODE_ENV === "production" ? "/REPO_NAME/" : "/",
        plugins: [
                vue({
                        ...templateCompilerOptions
                }),
        ],
        resolve: {
                alias: {
                        '@': fileURLToPath(new URL('./src', import.meta.url))
                }
        }
})
