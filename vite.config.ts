import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    build: {
      // Optimize build output
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            utils: ['papaparse', 'html2canvas', 'jspdf'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
      // Enable source maps in development
      sourcemap: command === 'serve',
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'recharts',
        'papaparse',
        '@supabase/supabase-js',
        'lucide-react',
      ],
    },
    server: {
      open: true,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    },
    preview: {
      port: 5173,
      host: true
    }
  }
})