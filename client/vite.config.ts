import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      stream: "stream-browserify",
      buffer: "buffer",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/scss/_variables.scss";`,
      },
    },
  },
  server: {
    // in dev mode we have to proxy all api calls to the api server which runs on localhost:5000 in dev.
    // In prod mode it is done the other way around: The server will serve the built files for the client.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
});
