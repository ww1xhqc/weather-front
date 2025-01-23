/// <reference no-check />

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createHandler } from "https://deno.land/x/serve_handler@1.0.0/mod.ts";

const PORT = 8080;
const BASE_PATH = new URL("./dist", import.meta.url).pathname;

const handler = createHandler({
  public: BASE_PATH,
  cleanUrls: true,
  trailingSlash: false,
  redirects: [
    { source: "/weather", destination: "/" },
    { source: "/cn", destination: "/zh-CN" }
  ],
  rewrites: [
    { source: "/api/:path*", destination: "https://api.caiyunapp.com/:path*" },
    { source: "**", destination: "/index.html" } // 处理Vue路由
  ],
  headers: [
    {
      source: "**/*.@(js|css|png|jpg|svg)",
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      source: "**",
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    }
  ]
});

console.log(`🚀 Deno server running at http://localhost:${PORT}`);
await serve(handler, { port: PORT });
