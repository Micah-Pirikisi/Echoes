import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:4000",
      "/posts": "http://localhost:4000",
      "/users": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
