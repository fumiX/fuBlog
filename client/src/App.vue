<template>
  <div
    v-if="appData.runMode === 'development'"
    style="display: block; position: fixed; bottom: 0; right: 0; background: rgba(0, 100, 0, 0.4)"
  >
    {{ appData.runMode }}
  </div>
  <div>
    <div class="content">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container">
          <a class="navbar-brand" href="/">
            <img src="@client/assets/images/logo.png" alt="..." height="50" />
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <RouterLink to="/posts" class="nav-link">{{ t("nav.posts") }}</RouterLink>
              </li>
              <li v-if="isAdmin()" class="nav-item">
                <RouterLink to="/administration" class="nav-link">{{ t("nav.administration") }}</RouterLink>
              </li>
            </ul>
            <div class="username">
              <login-button v-if="!loggedInUser"></login-button>
              <user-name v-else :user="loggedInUser" @logout="logoutUser($event)"></user-name>
            </div>

            <light-dark-toggler @theme-changed="cssTheme = $event" style="margin-right: 2.5rem"></light-dark-toggler>

            <search-component
              :searchString="searchQuery"
              @searched="startSearch($event)"
              @operatorChanged="setOperator($event)"
            ></search-component>
          </div>
        </div>
      </nav>

      <RouterView :userPermissions="userPermissions" />
    </div>
    <footer class="page-footer">
      <div class="container">
        <div class="row py-4">
          <div class="col-md-6 text-md-start text-center">
            <a class="sharepic" :href="`https://github.com/${appData.githubRepositorySlug}`"
              ><span class="btn btn-outline-primary m-1"
                ><fa-icon :icon="faGithub"></fa-icon> {{ t("app.base.githubLinkText") }} <fa-icon :icon="faExternalLink"></fa-icon></span
              ><br /><img v-if="appData.githubRepositorySlug" src="/api/utility/github-sharepic" />
            </a>
          </div>
          <div class="col-md-6 text-md-end text-center">
            <a v-if="appData.imprint" :href="appData.imprint.url">{{ appData.imprint.label }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
.username {
  color: white;
  margin: 0 auto;
  font-style: italic;
}

footer.page-footer {
  background: #222;
  min-height: 25rem;

  .sharepic {
    img {
      max-width: 16rem;
      opacity: 0.6;
      clip-path: polygon(0 5%, 100% 5%, 100% 55%, 0 55%);
      transition: 15s ease-in opacity, 20s ease-in clip-path, 5s ease-in max-width;
    }

    &:hover img {
      opacity: 1;
      transition: 1s ease-out opacity, 1s ease-out clip-path, 1s ease-out max-width;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      max-width: 25rem;
    }
  }
}
</style>

<script setup lang="ts">
import LightDarkToggler from "@client/components/LightDarkToggler.vue";
import LoginButton from "@client/components/LoginButton.vue";
import SearchComponent from "@client/components/SearchComponent.vue";
import UserName from "@client/components/UserName.vue";
import { AuthEndpoints } from "@client/util/api-client.js";
import { saveIdToken } from "@client/util/storage.js";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import type { AppSettingsDto, User, UserRolePermissionsType } from "@fumix/fu-blog-common";
import { permissionsForUser } from "@fumix/fu-blog-common";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const searchQuery = ref<string>("");
const router = useRouter();
const loggedInUser = ref<User | null>(null);
const userPermissions = ref<UserRolePermissionsType | null>(null);
const cssTheme = ref<string | null>(null);

const appData: AppSettingsDto = (JSON.parse(document.getElementById("app-data")?.textContent ?? "{}") as AppSettingsDto) ?? {
  isProduction: true,
  runMode: "production",
};

console.log(
  `%c  ███████
  █ ███ █
  ██ █ ██  fuBlog
  ███████
  ██ █ ██  ${(appData.isProduction ? appData.appVersion ?? "‹unknown›" : "development version") + "   "}
  █ ███ █
  ███████`,
  `color:#ff9c00;background:rgb(48, 48, 48);display:inline-block`,
);

const setOperator = (operator: string) => {
  router.replace({ query: { ...route.query, operator: operator } });
};

const setLoginUserAndPermissions = async () => {
  AuthEndpoints.getLoggedInUser()
    .then((oauthAccount) => {
      loggedInUser.value = oauthAccount.user;
      userPermissions.value = permissionsForUser(oauthAccount.user);
    })
    .catch(() => {
      loggedInUser.value = null;
      userPermissions.value = null;
    });
};

watch(route, async (value) => {
  // prefill search input from queryParam
  if (value.query.search) {
    searchQuery.value = value.query.search as string;
  } else {
    searchQuery.value = "";
  }
});

onMounted(() => {
  // listen for token-changed event to gracefully handle login/logout
  window.addEventListener("token-changed", (event) => {
    if (!loggedInUser.value) {
      setLoginUserAndPermissions();
    }
  });
  setLoginUserAndPermissions();
});

const startSearch = (search: string, operator: string = "and") => {
  if (search) {
    router.push(`/posts/?search=${search}&operator=${operator}`);
  } else {
    if (route.path === "/posts/") {
      // rest btn (x) on search input
      router.push(`/posts`);
    }
  }
};

const isAdmin = () => {
  return loggedInUser.value?.roles.includes("ADMIN");
};

const logoutUser = (event: Event) => {
  saveIdToken(null); // clear localStorage
  loggedInUser.value = null;
  userPermissions.value = null;
  router.push(`/`);
};
</script>
