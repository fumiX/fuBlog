import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { DateTime } from "luxon";
import "./assets/scss/custom.scss";
import "./assets/scss/style.scss";
import "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $luxonDateTime: typeof DateTime;
  }
}

const app = createApp(App);

app.config.globalProperties.$luxonDateTime = DateTime;

app.use(router);

app.component("fa-icon", FontAwesomeIcon).mount("#app"); // use fa icon component globally, but only load used icons in components.
