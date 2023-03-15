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
              <RouterLink to="/posts" class="nav-link">Posts</RouterLink>
            </li>
            <li v-if="hasPermission('admin')" class="nav-item">
              <RouterLink to="/administration" class="nav-link">Admin Panel</RouterLink>
            </li>
          </ul>
          <div class="username"><login-button></login-button></div>
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
import type { User } from "@fumix/fu-blog-common";
import Permission from "./permissions.js";

export default defineComponent({
  components: { LoginButton, SearchComponent },
  setup() {
    const route = useRoute();
    const searchQuery = ref<string>("");
    const router = useRouter();
    const loggedInUser = ref<User>();

    const userPermissions = ref<Permission[]>([]);

    const setOperator = (operator: string) => {
      // console.log("OP", operator);
      router.replace({ query: { ...route.query, operator: operator } });
    };

    watch(route, (value) => {
      // prefill search input from queryParam
      if (value.query.search) {
        searchQuery.value = value.query.search as string;
      }
    });

    onMounted(() => {
      // TODO: get user permissions from server
      userPermissions.value = [Permission.POST_CREATE, Permission.WRITE, Permission.DELETE, Permission.ADMIN];

      // TODO: get loggedin user data:
      loggedInUser.value = {
        username: "AlfredENeumann",
        email: "test@test.de",
        firstName: "Alfred E.",
        lastName: "Neumann",
        roles: ["ADMIN", "POST_CREATE"],
        isActive: true,
      };
    });

    return {
      userPermissions,
      searchQuery,
      setOperator,
      loggedInUser,
    };
  },

  methods: {
    startSearch(search: string, operator: string = "and") {
      this.$router.push(`/posts/?search=${search}&operator=${operator}`);
    },

    hasPermission(permission: String) {
      const perm = permission as Permission;
      return this.userPermissions?.includes(perm);
    },
  },
});
</script>

<style lang="scss"></style>
