import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    // 優化構建選項
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 分包策略
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // 確保資源文件名包含哈希
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // 將 React 相關庫分離
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 將 UI 組件庫分離
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-toast'],
          // 將工具庫分離
          'utils': ['axios', 'clsx', 'tailwind-merge', 'react-helmet-async'],
        },
      },
    },
    // 啟用 CSS 代碼分割
    cssCodeSplit: true,
    // 資源內聯閾值
    assetsInlineLimit: 4096,
    // 啟用源碼映射用於生產環境調試
    sourcemap: false,
    // 塊大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  publicDir: 'public'
})

