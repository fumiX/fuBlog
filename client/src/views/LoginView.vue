<template>
  <div id="login" class="container">
    <div v-if="!isStateMatching" class="alert alert-danger text-light">State does not match! Retry <login-button /></div>
    <div v-else-if="code && returnedType && returnedIssuer && isStateMatching">
      <div v-if="loading" class="loader">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="userInfo">
        <div v-if="userInfo.isExisting">
          Hallo {{ userInfo.user.firstName }} {{ userInfo.user.lastName }}! Du bist jetzt angemeldet.
          <!-- TODO: Redirect immediately -->
        </div>
        <div v-else>
          <h2>Konto erstellen</h2>
          <div>
            Willkommen, gleich kann's losgehen.<br />
            Die Daten unten haben wir vom Anmeldedienstleister abgerufen und würden diese gerne bei uns speichern.<br />
            Passe sie ggf. an und suche dir einen Benutzernamen aus.
          </div>

          <div class="form-floating mb-2">
            <input class="form-control" :value="userInfo.oauthId" readonly disabled />
            <label for="oauthId">ID *</label>
          </div>
          <div class="form-floating mb-2">
            <input class="form-control" :value="userInfo?.user?.email" readonly disabled />
            <label for="email">E-Mail *</label>
          </div>
          <div class="form-floating mb-2">
            <input class="form-control" id="username" v-model="username" required minlength="3" maxlength="64" />
            <label for="username">Username *</label>
          </div>
          <div class="form-floating mb-2">
            <input class="form-control" id="firstName" v-model="firstName" />
            <label for="firstName">First name</label>
          </div>
          <div class="form-floating mb-2">
            <input class="form-control" id="lastName" v-model="lastName" />
            <label for="lastName">Last name</label>
          </div>
          <input class="form-control" name="token" :value="userInfo.token" hidden />
          <button class="btn btn-primary" @click="register">Anmelden</button>
        </div>
      </div>
      <div v-else>User info not found.</div>
    </div>
    <div v-else>
      <span v-on:load="redir()">X</span>
    </div>
  </div>
</template>

<script lang="ts">
import LoginButton from "@client/components/LoginButton.vue";
import router from "@client/router/index.js";
import { loadIdToken, loadOauthStateByKey, saveIdToken } from "@client/util/storage.js";
import type { OAuthCodeDto, OAuthUserInfoDto, SavedOAuthToken } from "@fumix/fu-blog-common";
import { bytesToBase64URL, isNotNull, isOAuthType } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "AuthView",
  components: { LoginButton },
  methods: {
    async register() {
      await fetch(`/api/auth/userinfo/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saved_token: this.userInfo?.token,
          first_name: this.firstName,
          last_name: this.lastName,
          username: this.username,
        }),
      }).then(async (it) => {
        const registeredUserInfo = (await it.json()) as OAuthUserInfoDto;
        if (registeredUserInfo) {
          saveIdToken(registeredUserInfo.token);
          this.userInfo = registeredUserInfo;
        }
      });
    },
    redir() {
      console.log("Redirecting");
    },
    router() {
      return router;
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
    const username = ref<string>("");
    const firstName = ref<string>("");
    const lastName = ref<string>("");
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
      username,
      firstName,
      lastName,
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
        const res = await fetch(`/api/auth/userinfo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: this.code, issuer: this.returnedIssuer, type: this.returnedType }),
        });
        this.userInfo = await res.json();
        this.username = this.userInfo?.user?.username ?? "";
        this.firstName = this.userInfo?.user?.firstName ?? "";
        this.lastName = this.userInfo?.user?.lastName ?? "";
        if (this.userInfo?.isExisting) {
          saveIdToken(this.userInfo.token);
          this.$router.push(`/`);
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
