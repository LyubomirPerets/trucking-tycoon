import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Bind on all interfaces (IPv4 + IPv6). Vite's default `localhost` can resolve
  // to IPv6-only on Windows, which makes 127.0.0.1:5173 refuse the connection.
  server: { host: true },
});
