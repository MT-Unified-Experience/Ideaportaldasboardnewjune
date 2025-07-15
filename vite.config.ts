import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
      proxy: {
        '/api': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          timeout: 10000, // 10 second timeout
          proxyTimeout: 10000, // 10 second proxy timeout
          followRedirects: true,
          ws: false, // Disable websocket proxying to prevent connection issues
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('🔥 Proxy error occurred:', err.message);
              console.error('📍 Request URL:', req.url);
              console.error('🔧 Target:', env.VITE_SUPABASE_URL);
              
              // Check if Supabase URL is configured
              if (!env.VITE_SUPABASE_URL) {
                console.error('❌ VITE_SUPABASE_URL is not configured in .env file');
                console.error('💡 Please add VITE_SUPABASE_URL=https://your-project-id.supabase.co to your .env file');
              } else if (err.code === 'ENOTFOUND') {
                console.error('💡 DNS resolution failed - check your Supabase URL');
              } else if (err.code === 'ECONNREFUSED') {
                console.error('💡 Connection refused - Supabase service might be down');
              } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
                console.error('💡 Connection timeout - check your internet connection');
              } else if (err.message.includes('socket hang up')) {
                console.error('💡 Socket hang up - connection was closed unexpectedly');
                console.error('   This often happens due to:');
                console.error('   1. Network connectivity issues');
                console.error('   2. Supabase service temporarily unavailable');
                console.error('   3. Firewall blocking the connection');
              }
              
              // Send a proper error response instead of hanging
              if (!res.headersSent) {
                const statusCode = err.code === 'ENOTFOUND' ? 502 : 503;
                res.writeHead(statusCode, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
                });
                res.end(JSON.stringify({
                  error: 'Connection error',
                  message: 'Unable to connect to Supabase. Please check your configuration and internet connection.',
                  code: err.code || 'PROXY_CONNECTION_ERROR',
                  details: err.message
                }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add timeout handling with shorter timeouts
              const timeout = 10000; // 10 second timeout for all requests
              proxyReq.setTimeout(timeout, () => {
                console.error('⏰ Proxy request timeout for:', req.url);
                proxyReq.destroy();
              });
              
              // Ensure proper headers are set only if Supabase is configured
              if (env.VITE_SUPABASE_ANON_KEY) {
                proxyReq.setHeader('apikey', env.VITE_SUPABASE_ANON_KEY);
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_SUPABASE_ANON_KEY}`);
              }
              
              // Set standard headers
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Accept', 'application/json');
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Log response status for debugging
              if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                console.error('⚠️ Proxy response error:', proxyRes.statusCode, req.url);
                if (proxyRes.statusCode === 403) {
                  console.error('💡 403 Forbidden - Check:');
                  console.error('1. VITE_SUPABASE_ANON_KEY in .env file');
                  console.error('2. CORS settings in Supabase dashboard');
                  console.error('3. Add http://localhost:5173 to allowed origins');
                }
              }
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