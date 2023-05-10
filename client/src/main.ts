import i18n from "@client/plugins/i18n.js";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createHead } from "@unhead/vue";
import "bootstrap";
import { DateTime } from "luxon";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/scss/custom.scss";
import "./assets/scss/style.scss";
import router from "./router/index.js";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $luxonDateTime: typeof DateTime;
  }
}

const app = createApp(App);
const head = createHead();
app.use(head);
app.use(i18n);

app.config.globalProperties.$luxonDateTime = DateTime;

app.use(router);

app.component("fa-icon", FontAwesomeIcon).mount("#app"); // use fa icon component globally, but only load used icons in components.
