<template>
  <div>
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink to="/">Home</RouterLink>
          | 
          <RouterLink to="/posts">alle Blogposts</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<style scoped>
.wrapper {
  text-align: center;
}
</style>
