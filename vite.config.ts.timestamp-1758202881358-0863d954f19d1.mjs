// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: {
      open: true,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path2) => path2.replace(/^\/api/, ""),
          timeout: 1e4,
          // 10 second timeout
          proxyTimeout: 1e4,
          // 10 second proxy timeout
          followRedirects: true,
          ws: false,
          // Disable websocket proxying to prevent connection issues
          configure: (proxy, options) => {
            proxy.on("error", (err, req, res) => {
              console.error("\u{1F525} Proxy error occurred:", err.message);
              console.error("\u{1F4CD} Request URL:", req.url);
              console.error("\u{1F527} Target:", env.VITE_SUPABASE_URL);
              if (!env.VITE_SUPABASE_URL) {
                console.error("\u274C VITE_SUPABASE_URL is not configured in .env file");
                console.error("\u{1F4A1} Please add VITE_SUPABASE_URL=https://your-project-id.supabase.co to your .env file");
              } else if (err.code === "ENOTFOUND") {
                console.error("\u{1F4A1} DNS resolution failed - check your Supabase URL");
              } else if (err.code === "ECONNREFUSED") {
                console.error("\u{1F4A1} Connection refused - Supabase service might be down");
              } else if (err.code === "ETIMEDOUT" || err.message.includes("timeout")) {
                console.error("\u{1F4A1} Connection timeout - check your internet connection");
              } else if (err.message.includes("socket hang up")) {
                console.error("\u{1F4A1} Socket hang up - connection was closed unexpectedly");
                console.error("   This often happens due to:");
                console.error("   1. Network connectivity issues");
                console.error("   2. Supabase service temporarily unavailable");
                console.error("   3. Firewall blocking the connection");
              }
              if (!res.headersSent) {
                const statusCode = err.code === "ENOTFOUND" ? 502 : 503;
                res.writeHead(statusCode, {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
                });
                res.end(JSON.stringify({
                  error: "Connection error",
                  message: "Unable to connect to Supabase. Please check your configuration and internet connection.",
                  code: err.code || "PROXY_CONNECTION_ERROR",
                  details: err.message
                }));
              }
            });
            proxy.on("proxyReq", (proxyReq, req, res) => {
              const timeout = 1e4;
              proxyReq.setTimeout(timeout, () => {
                console.error("\u23F0 Proxy request timeout for:", req.url);
                proxyReq.destroy();
              });
              if (env.VITE_SUPABASE_ANON_KEY) {
                proxyReq.setHeader("apikey", env.VITE_SUPABASE_ANON_KEY);
                proxyReq.setHeader("Authorization", `Bearer ${env.VITE_SUPABASE_ANON_KEY}`);
              }
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader("Accept", "application/json");
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                console.error("\u26A0\uFE0F Proxy response error:", proxyRes.statusCode, req.url);
                if (proxyRes.statusCode === 403) {
                  console.error("\u{1F4A1} 403 Forbidden - Check:");
                  console.error("1. VITE_SUPABASE_ANON_KEY in .env file");
                  console.error("2. CORS settings in Supabase dashboard");
                  console.error("3. Add http://localhost:5173 to allowed origins");
                }
              }
            });
          }
        }
      }
    },
    preview: {
      port: 5173,
      host: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfU1VQQUJBU0VfVVJMLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcbiAgICAgICAgICB0aW1lb3V0OiAxMDAwMCwgLy8gMTAgc2Vjb25kIHRpbWVvdXRcbiAgICAgICAgICBwcm94eVRpbWVvdXQ6IDEwMDAwLCAvLyAxMCBzZWNvbmQgcHJveHkgdGltZW91dFxuICAgICAgICAgIGZvbGxvd1JlZGlyZWN0czogdHJ1ZSxcbiAgICAgICAgICB3czogZmFsc2UsIC8vIERpc2FibGUgd2Vic29ja2V0IHByb3h5aW5nIHRvIHByZXZlbnQgY29ubmVjdGlvbiBpc3N1ZXNcbiAgICAgICAgICBjb25maWd1cmU6IChwcm94eSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgcmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHVEODNEXHVERDI1IFByb3h5IGVycm9yIG9jY3VycmVkOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHVEODNEXHVEQ0NEIFJlcXVlc3QgVVJMOicsIHJlcS51cmwpO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdUQ4M0RcdUREMjcgVGFyZ2V0OicsIGVudi5WSVRFX1NVUEFCQVNFX1VSTCk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBDaGVjayBpZiBTdXBhYmFzZSBVUkwgaXMgY29uZmlndXJlZFxuICAgICAgICAgICAgICBpZiAoIWVudi5WSVRFX1NVUEFCQVNFX1VSTCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBWSVRFX1NVUEFCQVNFX1VSTCBpcyBub3QgY29uZmlndXJlZCBpbiAuZW52IGZpbGUnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdUQ4M0RcdURDQTEgUGxlYXNlIGFkZCBWSVRFX1NVUEFCQVNFX1VSTD1odHRwczovL3lvdXItcHJvamVjdC1pZC5zdXBhYmFzZS5jbyB0byB5b3VyIC5lbnYgZmlsZScpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5jb2RlID09PSAnRU5PVEZPVU5EJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1RDgzRFx1RENBMSBETlMgcmVzb2x1dGlvbiBmYWlsZWQgLSBjaGVjayB5b3VyIFN1cGFiYXNlIFVSTCcpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5jb2RlID09PSAnRUNPTk5SRUZVU0VEJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1RDgzRFx1RENBMSBDb25uZWN0aW9uIHJlZnVzZWQgLSBTdXBhYmFzZSBzZXJ2aWNlIG1pZ2h0IGJlIGRvd24nKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIuY29kZSA9PT0gJ0VUSU1FRE9VVCcgfHwgZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ3RpbWVvdXQnKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1RDgzRFx1RENBMSBDb25uZWN0aW9uIHRpbWVvdXQgLSBjaGVjayB5b3VyIGludGVybmV0IGNvbm5lY3Rpb24nKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIubWVzc2FnZS5pbmNsdWRlcygnc29ja2V0IGhhbmcgdXAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1RDgzRFx1RENBMSBTb2NrZXQgaGFuZyB1cCAtIGNvbm5lY3Rpb24gd2FzIGNsb3NlZCB1bmV4cGVjdGVkbHknKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCcgICBUaGlzIG9mdGVuIGhhcHBlbnMgZHVlIHRvOicpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgIDEuIE5ldHdvcmsgY29ubmVjdGl2aXR5IGlzc3VlcycpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgIDIuIFN1cGFiYXNlIHNlcnZpY2UgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCcgICAzLiBGaXJld2FsbCBibG9ja2luZyB0aGUgY29ubmVjdGlvbicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBTZW5kIGEgcHJvcGVyIGVycm9yIHJlc3BvbnNlIGluc3RlYWQgb2YgaGFuZ2luZ1xuICAgICAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0NvZGUgPSBlcnIuY29kZSA9PT0gJ0VOT1RGT1VORCcgPyA1MDIgOiA1MDM7XG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChzdGF0dXNDb2RlLCB7XG4gICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlMnLFxuICAgICAgICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBhcGlrZXknXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICBlcnJvcjogJ0Nvbm5lY3Rpb24gZXJyb3InLFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1VuYWJsZSB0byBjb25uZWN0IHRvIFN1cGFiYXNlLiBQbGVhc2UgY2hlY2sgeW91ciBjb25maWd1cmF0aW9uIGFuZCBpbnRlcm5ldCBjb25uZWN0aW9uLicsXG4gICAgICAgICAgICAgICAgICBjb2RlOiBlcnIuY29kZSB8fCAnUFJPWFlfQ09OTkVDVElPTl9FUlJPUicsXG4gICAgICAgICAgICAgICAgICBkZXRhaWxzOiBlcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgLy8gQWRkIHRpbWVvdXQgaGFuZGxpbmcgd2l0aCBzaG9ydGVyIHRpbWVvdXRzXG4gICAgICAgICAgICAgIGNvbnN0IHRpbWVvdXQgPSAxMDAwMDsgLy8gMTAgc2Vjb25kIHRpbWVvdXQgZm9yIGFsbCByZXF1ZXN0c1xuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRUaW1lb3V0KHRpbWVvdXQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTIzRjAgUHJveHkgcmVxdWVzdCB0aW1lb3V0IGZvcjonLCByZXEudXJsKTtcbiAgICAgICAgICAgICAgICBwcm94eVJlcS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gRW5zdXJlIHByb3BlciBoZWFkZXJzIGFyZSBzZXQgb25seSBpZiBTdXBhYmFzZSBpcyBjb25maWd1cmVkXG4gICAgICAgICAgICAgIGlmIChlbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSkge1xuICAgICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignYXBpa2V5JywgZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVkpO1xuICAgICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHtlbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWX1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gU2V0IHN0YW5kYXJkIGhlYWRlcnNcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAvLyBMb2cgcmVzcG9uc2Ugc3RhdHVzIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgJiYgcHJveHlSZXMuc3RhdHVzQ29kZSA+PSA0MDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI2QTBcdUZFMEYgUHJveHkgcmVzcG9uc2UgZXJyb3I6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgPT09IDQwMykge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHVEODNEXHVEQ0ExIDQwMyBGb3JiaWRkZW4gLSBDaGVjazonKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJzEuIFZJVEVfU1VQQUJBU0VfQU5PTl9LRVkgaW4gLmVudiBmaWxlJyk7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCcyLiBDT1JTIHNldHRpbmdzIGluIFN1cGFiYXNlIGRhc2hib2FyZCcpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignMy4gQWRkIGh0dHA6Ly9sb2NhbGhvc3Q6NTE3MyB0byBhbGxvd2VkIG9yaWdpbnMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByZXZpZXc6IHtcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICBob3N0OiB0cnVlXG4g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
