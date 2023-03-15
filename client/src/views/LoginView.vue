<template>
  <div id="login" class="container">
    <h2>Login</h2>
    <div v-if="!isStateMatching" class="alert alert-danger text-light">State does not match! Retry <login-button /></div>
    <div v-else-if="code && returnedType && returnedIssuer && isStateMatching">
      <div v-if="loading" class="loader">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="userInfo">
        Welcome {{ userInfo.user.firstName }} {{ userInfo.user.lastName }} ({{ userInfo.user.email }})!
      </div>
      <div v-else>
        User info not found.
      </div>
    </div>
    <div v-else>
      <span v-on:load="redir()">X</span>
    </div>
  </div>
</template>

<script lang="ts">
import LoginButton from "@/components/LoginButton.vue";
import router from "@/router/index.js";
import { loadOauthStateByKey, saveIdToken } from "@/util/storage.js";
import type { OAuthCodeDto, OAuthProvidersDto, OAuthUserInfoDto } from "@fumix/fu-blog-common";
import { bytesToBase64URL, isOAuthType } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "AuthView",
  components: { LoginButton },
  methods: {
    redir() {
      console.log("Redirecting");
    },
    router() {
      return router
    },
    async login() {
      if (!this.returnedType) {
        return;
      }
      const code: OAuthCodeDto = {
        type: this.returnedType,
        issuer: this.returnedIssuer,
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
  },
  setup() {
    const route = useRoute();
    const userInfo = ref<OAuthUserInfoDto | undefined>(undefined);
    const stateParam: string = "" + route.query.state;
    const [returnedType, returnedIssuer, returnedStateKey] = stateParam.split("/");

    const newStateBytes = new Uint8Array(21);
    window.crypto.getRandomValues(newStateBytes);
    const newState = bytesToBase64URL(newStateBytes); // 21 bytes (= 28 characters) of random base64url

    const savedState = loadOauthStateByKey(returnedStateKey);
    const isStateMatching = savedState && savedState.key === returnedStateKey;

    return {
      newState,
      loading: ref(true),
      userInfo,
      code: route.query.code,
      redirect: route.query.redirect,
      returnedType: isOAuthType(returnedType) ? returnedType : null,
      returnedIssuer,
      isStateMatching,
    };
  },
  async mounted() {
    try {
      if (this.code && this.returnedType && this.returnedIssuer && this.isStateMatching) {
        this.loading = true;
        const res = await fetch(`/api/auth/code`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ code: this.code, issuer: this.returnedIssuer, type: this.returnedType }),
        });
        this.userInfo = await res.json();
        if (this.userInfo?.isExisting) {
          saveIdToken(this.userInfo.id_token);
        }
        this.loading = false;
      }
    } catch (e) {
      console.error("Error loading user info", e);
      this.loading = false;
    }
  },
});
</script>

<style scoped></style>
