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
          <button @click="toggleTheme($event)">THEME</button>
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

<script lang="ts">
import LoginButton from "@client/components/LoginButton.vue";
import { loadIdToken, saveIdToken, saveCssPreference, loadCssPreference } from "@client/util/storage.js";
import type { SavedOAuthToken, User, UserDto, UserRolePermissionsType } from "@fumix/fu-blog-common";
import { permissionsForUser } from "@fumix/fu-blog-common";
import { Buffer } from "buffer";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import SearchComponent from "./components/SearchComponent.vue";
import UserName from "./components/UserName.vue";

export default defineComponent({
  components: { LoginButton, SearchComponent, UserName },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const searchQuery = ref<string>("");
    const router = useRouter();
    const loggedInUser = ref<UserDto | null>(null);
    const userPermissions = ref<UserRolePermissionsType | null>(null);
    const cssTheme = ref<string | null>(null);

    const setOperator = (operator: string) => {
      router.replace({ query: { ...route.query, operator: operator } });
    };

    const getLoggedInUser = async (): Promise<UserDto> => {
      const tokenObj: SavedOAuthToken | undefined = loadIdToken();

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tokenObj }),
      };

      const postUrl = `/api/auth/loggedInUser/`;
      const response = await fetch(postUrl, requestOptions);
      const data = await response.json();

      if (data) {
        data.user.profilePictureUrl = data.user.profilePicture
          ? "data:image/jpeg;base64," + Buffer.from(data.user.profilePicture).toString("base64")
          : undefined;
      }
      return data.user;
    };

    const setLoginUSerAndPermissions = async () => {
      loggedInUser.value = await getLoggedInUser();
      userPermissions.value = permissionsForUser(loggedInUser.value as User);
    };

    const getMediaPreference = (): string => {
      const hasDarkPreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (hasDarkPreference) {
        return "darkTheme";
      } else {
        return "lightTheme";
      }
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

      cssTheme.value = loadCssPreference() || getMediaPreference();
    });

    return {
      userPermissions,
      searchQuery,
      loggedInUser,
      setOperator,
      t,
      cssTheme,
    };
  },

  methods: {
    startSearch(search: string, operator: string = "and") {
      this.$router.push(`/posts/?search=${search}&operator=${operator}`);
    },

    isAdmin() {
      return this.loggedInUser?.roles.includes("ADMIN");
    },

    logoutUser(event: Event) {
      saveIdToken(null); // clear localStorage
      this.loggedInUser = null;
      this.userPermissions = null;
      this.$router.push(`/`);
    },

    toggleTheme(event: Event) {
      if (this.cssTheme === "darkTheme") {
        this.cssTheme = "lightTheme";
      } else {
        this.cssTheme = "darkTheme";
      }
      saveCssPreference(this.cssTheme);
    },
  },
});
</script>
