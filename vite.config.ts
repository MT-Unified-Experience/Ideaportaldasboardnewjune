import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Restore native Node.js timer functions to prevent _onTimeout errors
if (typeof global !== 'undefined') {
  global.setTimeout = global.setTimeout || setTimeout;
  global.clearTimeout = global.clearTimeout || clearTimeout;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      open: true,
      host: true,
      proxy: env.VITE_SUPABASE_URL ? {
        '/api': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          timeout: 30000,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err.message);
              if (!res.headersSent) {
                res.writeHead(503, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({
                  error: 'Connection error',
                  message: 'Unable to connect to Supabase'
                }));
              }
            });
          }
        }
      } : undefined
    },
    preview: {
      port: 5173,
      host: true
    }
  }
})