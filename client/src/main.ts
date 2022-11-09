import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { DateTime } from "luxon";
import "./assets/scss/style.scss";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(fas, fab, far);

const app = createApp(App);

app.config.globalProperties.$luxonDateTime = DateTime;

app.use(router);

app
.component("fa-icon", FontAwesomeIcon)
.mount("#app");
