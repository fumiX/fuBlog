<template>
  <div id="login" class="container">
    <h2>Login</h2>
    <div v-if="code && returnedType && returnedDomain && returnedState">
      <div v-if="isStateMatching()">
        Welcome back with code <code>{{ code }}</code
        >!
        <pre>{{ returnedType }} {{ returnedDomain }} {{ returnedState }}</pre>
        <button @click="login">Login</button>
      </div>
      <div v-else class="alert alert-danger">State does not match! Retry <a href="/login">Login</a></div>
    </div>
    <div v-else-if="!loading">
      <ul v-if="providers">
        <li v-for="provider in providers.providers" :key="provider.url">
          <a :href="provider.url ?? '#'">{{ provider.label }}</a>
        </li>
      </ul>
      <span v-else>There are no OAuth providers setup for login!</span>
    </div>
  </div>
</template>

<script lang="ts">
import type { OAuthProvidersDto, OAuthCodeDto, OAuthType } from "@fumix/fu-blog-common";
import { isOAuthType } from "@fumix/fu-blog-common";
import { Buffer } from "buffer";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "AuthView",
  methods: {
    async login() {
      if (!this.returnedType) {
        return;
      }
      const code: OAuthCodeDto = {
        type: this.returnedType,
        issuer: this.returnedDomain,
        code: this.code + "",
      };
      await fetch(`/api/auth/code`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(code),
      });
    },
    isStateMatching(): boolean {
      const savedState = window.sessionStorage.getItem("state");
      if (savedState && this.returnedState) {
        try {
          console.log("Comparing states: ", JSON.parse(savedState).state, " == ", this.returnedState, "?");
          return JSON.parse(savedState).state === this.returnedState;
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  },
  setup() {
    const route = useRoute();
    const providers = ref<OAuthProvidersDto | null>(null);
    const stateParam: string = "" + route.query.state;
    const [returnedType, returnedDomain, returnedState] = stateParam.split("/");

    const newStateBytes = new Uint8Array(21);
    window.crypto.getRandomValues(newStateBytes);
    const newState = Buffer.from(newStateBytes) // 21 bytes (=28 characters) of random base64url
      .toString("base64") // TODO: Replace by `toString("base64url")` as soon as we are sure, it is supported everywhere.
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return {
      newState,
      loading: ref(true),
      providers,
      code: route.query.code,
      redirect: route.query.redirect,
      returnedType: isOAuthType(returnedType) ? (returnedType as OAuthType) : null,
      returnedDomain,
      returnedState,
    };
  },
  async mounted() {
    try {
      const res = await fetch(`/api/auth/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: this.newState }),
      });
      const response = await res.json();

      if (!this.code || !this.returnedState || !this.returnedType || !this.returnedDomain) {
        const session = {
          state: this.newState,
          redirect: this.redirect,
        };
        window.sessionStorage.setItem("state", JSON.stringify(session));
      }

      this.providers = response;
      this.loading = false;
    } catch (e) {
      console.error("Error", e);
      this.loading = false;
    }
  },
});
</script>

<style scoped></style>
