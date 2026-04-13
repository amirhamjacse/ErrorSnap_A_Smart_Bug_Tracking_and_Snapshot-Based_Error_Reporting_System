import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    fs: {
      cachedChecks: false,
    },
    port: 3001,
    host: "127.0.0.1",
  },
});
