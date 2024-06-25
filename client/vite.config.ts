import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import Unfonts from "unplugin-fonts/vite";

export default defineConfig({
  plugins: [
    vue({
      // See https://stackoverflow.com/a/73641141 :
      // This is needed, or else Vite will try to find image paths (which it wont be able to find because this will be called on the web, not directly)
      // For example <img src="/images/logo.png"> will not work without the code below
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
        compilerOptions: {
          isCustomElement: (tag) => ["md-chip-set", "md-filled-tonal-button", "md-outlined-text-field", "md-suggestion-chip"].includes(tag),
        },
      },
    }),
    VueI18nPlugin({
      runtimeOnly: false,
      include: resolve(dirname(fileURLToPath(import.meta.url)), "./src/i18n/**"),
    }),
    // See: https://github.com/cssninjaStudio/unplugin-fonts/tree/main
    // Needed to preload fonts in the build process, otherwise it could happen that fonts are not loaded when the component is rendered.
    Unfonts({
      custom: {
        display: "swap",
        families: [
          {
            name: "NerkoOne",
            local: "NerkoOne",
            src: "./src/assets/fonts/Nerko/*.ttf",
            transform(font) {
              if (font.basename === "NerkoOne-Regular") {
                font.weight = 100;
              }
              return font;
            },
          },
        ],
        preload: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@common": fileURLToPath(new URL("../common/dist", import.meta.url)),
      "@client": fileURLToPath(new URL("./src", import.meta.url)),
      stream: "stream-browserify",
      buffer: "buffer",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@client/assets/scss/_variables.scss";`,
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
