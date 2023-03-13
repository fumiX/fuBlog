<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container">
        <a class="navbar-brand" href="/">fumiX Blog</a>
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
              <RouterLink to="/login" class="nav-link">Login</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/" class="nav-link">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/posts" class="nav-link">Posts</RouterLink>
            </li>
          </ul>
          <search-component :searchString="searchQuery" @searched="startSearch($event)" @operatorChanged="setOperator($event)"></search-component>
          <login-button></login-button>
        </div>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<script lang="ts">
import LoginButton from "@/components/LoginButton.vue";
import { defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SearchComponent from "./components/SearchComponent.vue";

export default defineComponent({
  components: { LoginButton, SearchComponent },
  setup() {
    const route = useRoute();
    const searchQuery = ref<string>("");
    const router = useRouter();

    const setOperator = (operator: string) => {
      console.log("OP", operator);
      router.replace({ query: { ...route.query, operator: operator } });
    };

    watch(route, (value) => {
      // prefill search input from queryParam
      if (value.query.search) {
        searchQuery.value = value.query.search as string;
      }
    });

    return {
      searchQuery,
      setOperator,
    };
  },

  methods: {
    startSearch(search: string, operator: string = "and") {
      this.$router.push(`/posts/?search=${search}&operator=${operator}`);
    },
  },
});
</script>

<style lang="scss"></style>
