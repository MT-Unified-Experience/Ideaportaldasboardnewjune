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
          target: env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          timeout: 30000, // 30 second timeout
          proxyTimeout: 30000, // 30 second proxy timeout
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.warn('🔥 Proxy error occurred:', err.message);
              console.warn('📍 Request URL:', req.url);
              console.warn('💡 This might be due to:');
              console.warn('   1. Network connectivity issues');
              console.warn('   2. Incorrect Supabase URL in .env file');
              console.warn('   3. Supabase service temporarily unavailable');
              console.warn('   4. CORS configuration issues');
              
              // Send a proper error response instead of hanging
              if (!res.headersSent) {
                res.writeHead(503, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
                });
                res.end(JSON.stringify({
                  error: 'Service temporarily unavailable',
                  message: 'Unable to connect to Supabase. Please check your configuration and try again.',
                  code: 'PROXY_CONNECTION_ERROR'
                }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add timeout handling
              proxyReq.setTimeout(30000, () => {
                console.warn('⏰ Proxy request timeout for:', req.url);
                proxyReq.destroy();
              });
              
              // Ensure proper headers are set
              if (env.VITE_SUPABASE_ANON_KEY) {
                proxyReq.setHeader('apikey', env.VITE_SUPABASE_ANON_KEY);
                
                // Only add Authorization header for non-auth requests
                // Auth requests should only use the apikey header
                if (!req.url?.includes('/auth/')) {
                  proxyReq.setHeader('Authorization', `Bearer ${env.VITE_SUPABASE_ANON_KEY}`);
                }
              }
              
              // Ensure proper content type for auth requests
              if (req.url?.includes('/auth/')) {
                proxyReq.setHeader('Content-Type', 'application/json');
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Handle successful responses
              if (proxyRes.statusCode && proxyRes.statusCode < 400) {
                console.log('✅ Successful proxy response:', proxyRes.statusCode, req.url);
              } else {
                console.warn('⚠️ Proxy response error:', proxyRes.statusCode, req.url);
                
                // Provide specific guidance for auth errors
                if (proxyRes.statusCode === 403 && req.url?.includes('/auth/')) {
                  console.warn('💡 Auth 403 error - Check:');
                  console.warn('1. VITE_SUPABASE_ANON_KEY in .env file');
                  console.warn('2. CORS settings in Supabase dashboard');
                  console.warn('3. Add http://localhost:5173 to allowed origins');
                }
              }
            });
            
            proxy.on('close', () => {
              console.log('🔌 Proxy connection closed');
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