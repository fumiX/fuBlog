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
              <!-- <a class="nav-link active" aria-current="page" href="#">Home</a> -->
            </li>
            <li class="nav-item">
              <RouterLink to="/posts" class="nav-link">Posts</RouterLink>
            </li>
          </ul>
          <form class="d-flex">
            <input class="form-control me-2" v-model="search" type="search" placeholder="Suche" aria-label="Suche" />
            <button class="btn btn-sm btn-outline-primary" type="button" @click="startSearch()">Suche</button>
          </form>
        </div>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const search = ref("");
    return {
      search,
    };
  },

  methods: {
    startSearch() {
      // TODO sanitize input
      this.$router.push("/posts/?search=" + this.search);
    },
  },
});
</script>

<style lang="scss"></style>
