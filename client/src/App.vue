<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-custom mb-4">
      <div class="container">
        <a class="navbar-brand" href="/">
          <img src="@/assets/images/logo.png" alt="..." height="50" />
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
            <user-name v-else :user="loggedInUser"></user-name>
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
</template>

<style lang="scss">
.username {
  color: white;
  margin: 0 auto;
  font-style: italic;
}
</style>

<script lang="ts">
import LoginButton from "@/components/LoginButton.vue";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SearchComponent from "./components/SearchComponent.vue";
import type { SavedOAuthToken, User, UserDto } from "@fumix/fu-blog-common";
import { useI18n } from "vue-i18n";
import { loadIdToken } from "@/util/storage.js";
import UserName from "./components/UserName.vue";
import { Buffer } from "buffer";
import { permissionsForUser } from "@fumix/fu-blog-common";
import type { UserRolePermissionsType } from "@fumix/fu-blog-common";

export default defineComponent({
  components: { LoginButton, SearchComponent, UserName },
  setup() {
    const { t } = useI18n({
      inheritLocale: true,
      useScope: "local",
    });

    const route = useRoute();
    const searchQuery = ref<string>("");
    const router = useRouter();
    const loggedInUser = ref<UserDto>();

    const userPermissions = ref<UserRolePermissionsType | null>(null);

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

      console.log("DATA USER", data.user);

      return data.user;
    };

    watch(route, async (value) => {
      // prefill search input from queryParam
      if (value.query.search) {
        searchQuery.value = value.query.search as string;
      }

      setTimeout(async () => {
        loggedInUser.value = await getLoggedInUser();
        userPermissions.value = permissionsForUser(loggedInUser.value as User);
      }, 250);
    });

    onMounted(async () => {
      // if (loggedInUser.value) {
      //   loggedInUser.value.profilePictureUrl = data.user.profilePicture
      //     ? "data:image/jpeg;base64," + Buffer.from(data.user.profilePicture).toString("base64")
      //     : undefined;
      // }
      // userPermissions.value = permissionsForUser(data.user);
      // loggedInUser.value = await getLoggedInUser();
      // console.log("LOGGEDIN USER ---->", data);
      // console.log("PERMISSIONS FOR USER", permissionsForUser(data.user));
    });

    return {
      userPermissions,
      searchQuery,
      setOperator,
      loggedInUser,
      t,
    };
  },

  methods: {
    startSearch(search: string, operator: string = "and") {
      this.$router.push(`/posts/?search=${search}&operator=${operator}`);
    },

    isAdmin() {
      return this.loggedInUser?.roles.includes("ADMIN");
    },
  },
});
</script>
