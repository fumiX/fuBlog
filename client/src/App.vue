<template>
  <div :class="cssTheme">
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
  </div>
</template>

<style lang="scss">
.username {
  color: white;
  margin: 0 auto;
  font-style: italic;
}
</style>

<script setup lang="ts">
import LightDarkToggler from "@client/components/LightDarkToggler.vue";
import LoginButton from "@client/components/LoginButton.vue";
import SearchComponent from "@client/components/SearchComponent.vue";
import UserName from "@client/components/UserName.vue";
import { AuthEndpoints } from "@client/util/api-client.js";
import { saveIdToken } from "@client/util/storage.js";
import type { User, UserRolePermissionsType } from "@fumix/fu-blog-common";
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

const setOperator = (operator: string) => {
  router.replace({ query: { ...route.query, operator: operator } });
};

const getLoggedInUser = async (): Promise<User> => {
  return AuthEndpoints.getLoggedInUser().then((it) => it.user);
};

const setLoginUSerAndPermissions = async () => {
  loggedInUser.value = await getLoggedInUser();
  userPermissions.value = permissionsForUser(loggedInUser.value);
};

watch(route, async (value) => {
  // prefill search input from queryParam
  if (value.query.search) {
    searchQuery.value = value.query.search as string;
  }
});

onMounted(async () => {
  // listen for token-changed event to gracefully handle login/logout
  window.addEventListener("token-changed", async (event) => {
    if (!loggedInUser.value) {
      setLoginUSerAndPermissions();
    }
  });
  setLoginUSerAndPermissions();
});

const startSearch = (search: string, operator: string = "and") => {
  router.push(`/posts/?search=${search}&operator=${operator}`);
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
