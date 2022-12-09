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
              <RouterLink to="/" class="nav-link">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/posts" class="nav-link">Posts</RouterLink>
            </li>
          </ul>
          <search-component :searchString="searchQuery" @searched="startSearch($event)"></search-component>
        </div>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SearchComponent from "./components/SearchComponent.vue";

export default defineComponent({
  components: { SearchComponent },
  setup() {
    const route = useRoute();
    const searchQuery = ref<string>("");

    watch(route, (value) => {
      // prefill search input from queryParam
      if (value.query.search) {
        searchQuery.value = value.query.search as string;
      }
    });

    return {
      searchQuery,
    };
  },

  methods: {
    startSearch(search: string) {
      this.$router.push("/posts/?search=" + search);
    },
  },
});
</script>

<style lang="scss"></style>
