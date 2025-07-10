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
          target: env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co",
          changeOrigin: true,
          secure: true,
          rewrite: (path2) => path2.replace(/^\/api/, ""),
          timeout: 3e4,
          // 30 second timeout
          proxyTimeout: 3e4,
          // 30 second proxy timeout
          configure: (proxy, options) => {
            proxy.on("error", (err, req, res) => {
              console.warn("\u{1F525} Proxy error occurred:", err.message);
              console.warn("\u{1F4CD} Request URL:", req.url);
              if (req.url?.includes("/auth/")) {
                console.warn("\u{1F4A1} Auth proxy error - this might be due to:");
                console.warn("   1. Invalid or expired tokens");
                console.warn("   2. CORS configuration issues");
                console.warn("   3. Supabase auth service temporarily unavailable");
              } else {
                console.warn("\u{1F4A1} This might be due to:");
                console.warn("   1. Network connectivity issues");
                console.warn("   2. Incorrect Supabase URL in .env file");
                console.warn("   3. Supabase service temporarily unavailable");
                console.warn("   4. CORS configuration issues");
              }
              if (!res.headersSent) {
                const statusCode = req.url?.includes("/auth/") ? 401 : 503;
                res.writeHead(statusCode, {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
                });
                res.end(JSON.stringify({
                  error: req.url?.includes("/auth/") ? "Authentication error" : "Service temporarily unavailable",
                  message: req.url?.includes("/auth/") ? "Authentication request failed. Please try signing in again." : "Unable to connect to Supabase. Please check your configuration and try again.",
                  code: req.url?.includes("/auth/") ? "AUTH_PROXY_ERROR" : "PROXY_CONNECTION_ERROR"
                }));
              }
            });
            proxy.on("proxyReq", (proxyReq, req, res) => {
              const timeout = req.url?.includes("/auth/") ? 15e3 : 3e4;
              proxyReq.setTimeout(timeout, () => {
                console.warn("\u23F0 Proxy request timeout for:", req.url);
                proxyReq.destroy();
              });
              if (env.VITE_SUPABASE_ANON_KEY) {
                proxyReq.setHeader("apikey", env.VITE_SUPABASE_ANON_KEY);
                if (!req.url?.includes("/auth/") && !req.url?.includes("/token")) {
                  proxyReq.setHeader("Authorization", `Bearer ${env.VITE_SUPABASE_ANON_KEY}`);
                }
              }
              if (req.url?.includes("/auth/") || req.url?.includes("/token")) {
                proxyReq.setHeader("Content-Type", "application/json");
                proxyReq.setHeader("Accept", "application/json");
              }
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              if (proxyRes.statusCode && proxyRes.statusCode < 400) {
                if (req.url?.includes("/auth/")) {
                  console.log("\u2705 Successful auth response:", proxyRes.statusCode);
                }
              } else {
                console.warn("\u26A0\uFE0F Proxy response error:", proxyRes.statusCode, req.url);
                if (req.url?.includes("/auth/") || req.url?.includes("/token")) {
                  if (proxyRes.statusCode === 400) {
                    console.warn("\u{1F4A1} Auth 400 error - Likely invalid or expired token");
                    console.warn("1. Clear browser storage and try again");
                    console.warn("2. Check if refresh token is valid");
                  } else if (proxyRes.statusCode === 403) {
                    console.warn("\u{1F4A1} Auth 403 error - Check:");
                    console.warn("1. VITE_SUPABASE_ANON_KEY in .env file");
                    console.warn("2. CORS settings in Supabase dashboard");
                    console.warn("3. Add http://localhost:5173 to allowed origins");
                  }
                }
              }
            });
            proxy.on("close", () => {
              console.log("\u{1F50C} Proxy connection closed");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfU1VQQUJBU0VfVVJMIHx8ICdodHRwczovL3lvdXItcHJvamVjdC1pZC5zdXBhYmFzZS5jbycsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxuICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwLCAvLyAzMCBzZWNvbmQgdGltZW91dFxuICAgICAgICAgIHByb3h5VGltZW91dDogMzAwMDAsIC8vIDMwIHNlY29uZCBwcm94eSB0aW1lb3V0XG4gICAgICAgICAgY29uZmlndXJlOiAocHJveHksIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybignXHVEODNEXHVERDI1IFByb3h5IGVycm9yIG9jY3VycmVkOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdcdUQ4M0RcdURDQ0QgUmVxdWVzdCBVUkw6JywgcmVxLnVybCk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBIYW5kbGUgYXV0aC1zcGVjaWZpYyBlcnJvcnMgbW9yZSBncmFjZWZ1bGx5XG4gICAgICAgICAgICAgIGlmIChyZXEudXJsPy5pbmNsdWRlcygnL2F1dGgvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1x1RDgzRFx1RENBMSBBdXRoIHByb3h5IGVycm9yIC0gdGhpcyBtaWdodCBiZSBkdWUgdG86Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcgICAxLiBJbnZhbGlkIG9yIGV4cGlyZWQgdG9rZW5zJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcgICAyLiBDT1JTIGNvbmZpZ3VyYXRpb24gaXNzdWVzJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcgICAzLiBTdXBhYmFzZSBhdXRoIHNlcnZpY2UgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1x1RDgzRFx1RENBMSBUaGlzIG1pZ2h0IGJlIGR1ZSB0bzonKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyAgIDEuIE5ldHdvcmsgY29ubmVjdGl2aXR5IGlzc3VlcycpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignICAgMi4gSW5jb3JyZWN0IFN1cGFiYXNlIFVSTCBpbiAuZW52IGZpbGUnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyAgIDMuIFN1cGFiYXNlIHNlcnZpY2UgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyAgIDQuIENPUlMgY29uZmlndXJhdGlvbiBpc3N1ZXMnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gU2VuZCBhIHByb3BlciBlcnJvciByZXNwb25zZSBpbnN0ZWFkIG9mIGhhbmdpbmdcbiAgICAgICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gcmVxLnVybD8uaW5jbHVkZXMoJy9hdXRoLycpID8gNDAxIDogNTAzO1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoc3RhdHVzQ29kZSwge1xuICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgICAgICAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgYXBpa2V5J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgZXJyb3I6IHJlcS51cmw/LmluY2x1ZGVzKCcvYXV0aC8nKSA/ICdBdXRoZW50aWNhdGlvbiBlcnJvcicgOiAnU2VydmljZSB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZScsXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXEudXJsPy5pbmNsdWRlcygnL2F1dGgvJykgXG4gICAgICAgICAgICAgICAgICAgID8gJ0F1dGhlbnRpY2F0aW9uIHJlcXVlc3QgZmFpbGVkLiBQbGVhc2UgdHJ5IHNpZ25pbmcgaW4gYWdhaW4uJyBcbiAgICAgICAgICAgICAgICAgICAgOiAnVW5hYmxlIHRvIGNvbm5lY3QgdG8gU3VwYWJhc2UuIFBsZWFzZSBjaGVjayB5b3VyIGNvbmZpZ3VyYXRpb24gYW5kIHRyeSBhZ2Fpbi4nLFxuICAgICAgICAgICAgICAgICAgY29kZTogcmVxLnVybD8uaW5jbHVkZXMoJy9hdXRoLycpID8gJ0FVVEhfUFJPWFlfRVJST1InIDogJ1BST1hZX0NPTk5FQ1RJT05fRVJST1InXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAvLyBBZGQgdGltZW91dCBoYW5kbGluZ1xuICAgICAgICAgICAgICBjb25zdCB0aW1lb3V0ID0gcmVxLnVybD8uaW5jbHVkZXMoJy9hdXRoLycpID8gMTUwMDAgOiAzMDAwMDsgLy8gU2hvcnRlciB0aW1lb3V0IGZvciBhdXRoIHJlcXVlc3RzXG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldFRpbWVvdXQodGltZW91dCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignXHUyM0YwIFByb3h5IHJlcXVlc3QgdGltZW91dCBmb3I6JywgcmVxLnVybCk7XG4gICAgICAgICAgICAgICAgcHJveHlSZXEuZGVzdHJveSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIEVuc3VyZSBwcm9wZXIgaGVhZGVycyBhcmUgc2V0XG4gICAgICAgICAgICAgIGlmIChlbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSkge1xuICAgICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignYXBpa2V5JywgZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEJlIG1vcmUgc2VsZWN0aXZlIGFib3V0IEF1dGhvcml6YXRpb24gaGVhZGVyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXEudXJsPy5pbmNsdWRlcygnL2F1dGgvJykgJiYgIXJlcS51cmw/LmluY2x1ZGVzKCcvdG9rZW4nKSkge1xuICAgICAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgYEJlYXJlciAke2Vudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gRW5zdXJlIHByb3BlciBjb250ZW50IHR5cGUgYW5kIGhlYWRlcnMgZm9yIGF1dGggcmVxdWVzdHNcbiAgICAgICAgICAgICAgaWYgKHJlcS51cmw/LmluY2x1ZGVzKCcvYXV0aC8nKSB8fCByZXEudXJsPy5pbmNsdWRlcygnL3Rva2VuJykpIHtcbiAgICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAvLyBIYW5kbGUgc3VjY2Vzc2Z1bCByZXNwb25zZXNcbiAgICAgICAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgJiYgcHJveHlSZXMuc3RhdHVzQ29kZSA8IDQwMCkge1xuICAgICAgICAgICAgICAgIGlmIChyZXEudXJsPy5pbmNsdWRlcygnL2F1dGgvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgU3VjY2Vzc2Z1bCBhdXRoIHJlc3BvbnNlOicsIHByb3h5UmVzLnN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1x1MjZBMFx1RkUwRiBQcm94eSByZXNwb25zZSBlcnJvcjonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBQcm92aWRlIHNwZWNpZmljIGd1aWRhbmNlIGZvciBkaWZmZXJlbnQgYXV0aCBlcnJvcnNcbiAgICAgICAgICAgICAgICBpZiAocmVxLnVybD8uaW5jbHVkZXMoJy9hdXRoLycpIHx8IHJlcS51cmw/LmluY2x1ZGVzKCcvdG9rZW4nKSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgPT09IDQwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1x1RDgzRFx1RENBMSBBdXRoIDQwMCBlcnJvciAtIExpa2VseSBpbnZhbGlkIG9yIGV4cGlyZWQgdG9rZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcxLiBDbGVhciBicm93c2VyIHN0b3JhZ2UgYW5kIHRyeSBhZ2FpbicpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJzIuIENoZWNrIGlmIHJlZnJlc2ggdG9rZW4gaXMgdmFsaWQnKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJveHlSZXMuc3RhdHVzQ29kZSA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignXHVEODNEXHVEQ0ExIEF1dGggNDAzIGVycm9yIC0gQ2hlY2s6Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignMS4gVklURV9TVVBBQkFTRV9BTk9OX0tFWSBpbiAuZW52IGZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCcyLiBDT1JTIHNldHRpbmdzIGluIFN1cGFiYXNlIGRhc2hib2FyZCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJzMuIEFkZCBodHRwOi8vbG9jYWxob3N0OjUxNzMgdG8gYWxsb3dlZCBvcmlnaW5zJyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJveHkub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBDIFByb3h5IGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmV2aWV3OiB7XG4gICAgICBwb3J0OiA1MTczLFxuICAgICAgaG9zdDogdHJ1ZVxuICAgIH1cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFF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
