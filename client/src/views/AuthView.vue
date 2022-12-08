<template>
  <div id="login" class="">
    <h2>Login</h2>
    <button @click="login" class="">Login</button>
  </div>
</template>

<script>
export default {
  name: "AuthView",
  methods: {
    login: async () => {
      const authRequest = new Request("http://localhost:5000/auth/login",{
        method: "GET"
      });
      const response = await fetch(authRequest);
      console.log(response);
    }
  }
}
</script>

<style scoped>

</style>
