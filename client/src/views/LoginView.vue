<template>
  <div id="login" class="container">
    <div v-if="!isStateMatching" class="alert alert-danger text-light">State does not match! Retry <login-button /></div>
    <div v-else-if="code && returnedType && returnedIssuer && isStateMatching">
      <div v-if="loading" class="loader">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="userInfo?.user">
        <div class="row mb-2">
          <div class="col">
            <div class="card flex-md-row mb-4 box-shadow h-md-250">
              <div class="card-body">
                <div v-if="userInfo.isExisting">
                  <!-- Should never occur because of immediate redirection -->
                  {{ t("login.message.success", { fullname: userInfo.user.fullName ?? userInfo.user.email }) }}
                </div>
                <div v-else>
                  <h2 class="display-6">{{ t("login.title") }}</h2>
                  <div style="white-space: pre-line; margin-bottom: 1rem">
                    {{ t("login.description") }}
                  </div>
                  <img v-if="userInfo.user.profilePictureUrl" :src="userInfo.user.profilePictureUrl" class="img-thumbnail m-2" />
                  <div class="form-floating mb-3">
                    <input class="form-control" :value="userInfo.oauthId" readonly disabled />
                    <label for="oauthId">{{ t("login.form.label.id") }} *</label>
                  </div>
                  <div class="form-floating mb-3">
                    <input class="form-control" :value="userInfo?.user?.email" readonly disabled />
                    <label for="email">{{ t("login.form.label.email") }} *</label>
                  </div>
                  <div class="form-floating mb-3">
                    <input class="form-control" id="username" v-model="username" required minlength="3" maxlength="64" />
                    <label for="username">{{ t("login.form.label.username") }} *</label>
                  </div>
                  <div class="form-floating mb-2">
                    <input class="form-control" id="fullName" v-model="fullName" />
                    <label for="fullName">{{ t("login.form.label.fullname") }}</label>
                  </div>
                  <input class="form-control" name="token" :value="userInfo.token" hidden />
                  <button class="btn btn-sm btn-primary float-end" @click="register">{{ t("app.base.login") }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>{{ t("login.user_not_found") }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import LoginButton from "@client/components/LoginButton.vue";
import router from "@client/router/index.js";
import { loadOauthStateByKey, saveIdToken } from "@client/util/storage.js";
import type { OAuthCodeDto, OAuthUserInfoDto } from "@fumix/fu-blog-common";
import { bytesToBase64URL, isOAuthType } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "LoginView",
  components: { LoginButton },

  methods: {
    async register() {
      await fetch(`/api/auth/userinfo/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savedToken: this.userInfo?.token,
          fullName: this.fullName,
          username: this.username,
          profilePictureUrl: this.userInfo?.user?.profilePictureUrl,
        }),
      }).then(async (it) => {
        const registeredUserInfo = (await it.json()) as OAuthUserInfoDto;
        if (registeredUserInfo) {
          saveIdToken(registeredUserInfo.token);
          this.userInfo = registeredUserInfo;
        }
      });
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
    const { t } = useI18n();
    const route = useRoute();
    const userInfo = ref<OAuthUserInfoDto | undefined>(undefined);
    const username = ref<string>("");
    const fullName = ref<string>("");
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
      fullName,
      code: route.query.code,
      redirect: route.query.redirect,
      returnedType: isOAuthType(returnedType) ? returnedType : null,
      returnedIssuer,
      isStateMatching,
      t,
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
        this.fullName = this.userInfo?.user?.fullName ?? "";
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
