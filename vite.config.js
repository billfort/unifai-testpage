import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import inject from '@rollup/plugin-inject'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    nodePolyfills({ // for importing node.js modules in browser
      exclude: [],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/txbuilder': {
        target: 'http://localhost:8001/api/tx',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/txbuilder/, ''),
      },
    },
  },
  // build: {
  //   rollupOptions: {
  //     plugins: [
  //       inject({
  //         Buffer: ['buffer', 'Buffer'],
  //       }),
  //     ],
  //   },
  // },

})
