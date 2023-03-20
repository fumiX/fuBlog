<template>
  <div id="login" class="">
    <h2>Login</h2>
    <button @click="login" class="">Login</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginView",
  methods: {
    async login() {
      const authUrlRequest = new Request("http://localhost:5000/auth/url", {
        method: "GET",
      });
      const response = await fetch(authUrlRequest);
      const data = await response.json();
      window.location.href = data.authUrl;
    },
  },
});
</script>
<style scoped></style>
