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
              <RouterLink to="/auth" class="nav-link">Login</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/posts" class="nav-link">Posts</RouterLink>
            </li>
          </ul>
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

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SearchComponent from "./components/SearchComponent.vue";

import Permission from "./permissions.js";

export default defineComponent({
  components: { SearchComponent },
  setup() {
    const route = useRoute();
    const searchQuery = ref<string>("");
    const router = useRouter();

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
      userPermissions.value = [Permission.CREATE, Permission.READ, Permission.WRITE, Permission.DELETE];
    });

    return {
      userPermissions,
      searchQuery,
      setOperator,
    };
  },

  methods: {
    startSearch(search: string, operator: string = "and") {
      this.$router.push(`/posts/?search=${search}&operator=${operator}`);
    },

    hasWritePermission() {
      return this.userPermissions.includes(Permission.WRITE);
    },
  },
});
</script>

<style lang="scss"></style>
