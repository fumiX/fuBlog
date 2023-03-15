import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { DateTime } from "luxon";
import "./assets/scss/custom.scss";
import "./assets/scss/style.scss";
import "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import i18n from "@/assets/i18n/plugins/i18n.js";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $luxonDateTime: typeof DateTime;
  }
}

const app = createApp(App);

app.use(i18n);

app.config.globalProperties.$luxonDateTime = DateTime;

app.use(router);

app.component("fa-icon", FontAwesomeIcon).mount("#app"); // use fa icon component globally, but only load used icons in components.
