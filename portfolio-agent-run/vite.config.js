import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const anthropicKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY || "";
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "";
  const groqKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || "";
  const growwAccessToken = env.GROWW_ACCESS_TOKEN || env.VITE_GROWW_ACCESS_TOKEN || "";
  const growwApiKey = env.GROWW_API_KEY || env.VITE_GROWW_API_KEY || "";
  const growwApiSecret = env.GROWW_API_SECRET || env.VITE_GROWW_API_SECRET || "";
  const fmpKey = env.FMP_API_KEY || env.VITE_FMP_API_KEY || "";
  const twelveDataKey = env.TWELVE_DATA_API_KEY || env.VITE_TWELVE_DATA_API_KEY || "";
  const aiProvider = (env.VITE_AI_PROVIDER || "groq").toLowerCase();

  return {
    plugins: [
      react(),
      {
        name: "warn-missing-ai-key",
        configureServer() {
          if (mode !== "development") return;
          if (aiProvider === "anthropic" && !anthropicKey) {
            console.warn(
              "\n[portfolio-agent] VITE_AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is missing. Add it to .env.local, restart npm run dev.\n"
            );
          }
          if (aiProvider === "gemini" && !geminiKey) {
            console.warn(
              "\n[portfolio-agent] GEMINI_API_KEY is missing (free tier: https://aistudio.google.com/apikey). Add to .env.local, restart npm run dev.\n"
            );
          }
          if (aiProvider === "groq" && !groqKey) {
            console.warn(
              "\n[portfolio-agent] VITE_AI_PROVIDER=groq but VITE_GROQ_API_KEY is missing. The app will fall back to rule-based analysis if market data is available.\n"
            );
          }
          if (!fmpKey && !twelveDataKey) {
            console.warn(
              "\n[portfolio-agent] No market data API key detected. Add VITE_FMP_API_KEY or VITE_TWELVE_DATA_API_KEY to .env.local for live quotes.\n"
            );
          }
        },
      },
    ],
    server: {
      proxy: {
        "/anthropic-proxy": {
          target: "https://api.anthropic.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/anthropic-proxy/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (anthropicKey) {
                proxyReq.setHeader("x-api-key", anthropicKey);
                proxyReq.setHeader("anthropic-version", "2023-06-01");
              }
            });
          },
        },
        "/gemini-proxy": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gemini-proxy/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (geminiKey) {
                proxyReq.setHeader("x-goog-api-key", geminiKey);
              }
            });
          },
        },
        "/groww-proxy": {
          target: "https://api.groww.in",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/groww-proxy/, "/v1"),
          configure: (proxy) => {
            proxy.on("proxyReq", async (proxyReq, req) => {
              proxyReq.setHeader("Accept", "application/json");
              proxyReq.setHeader("X-API-VERSION", "1.0");

              if (growwAccessToken) {
                proxyReq.setHeader("Authorization", `Bearer ${growwAccessToken}`);
                return;
              }

              if (growwApiKey && growwApiSecret && req.url === "/groww-proxy/token/api/access") {
                proxyReq.setHeader("Authorization", `Bearer ${growwApiKey}`);
              }
            });
          },
        },
      },
    },
  };
});
