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
  build: {
    // we only want to deploy the server folder, hence build the vue app inside the servers public folder
    outDir: path.resolve(__dirname, "../server/public"),
  },
  server: {
    // in dev mode we have to proxy all api calls to the api server which runs on localhost:5000 in dev. In prod it runs on the same machine
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
});
