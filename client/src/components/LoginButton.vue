<template>
  <span class="mx-2 text-muted" v-if="!providers || providers.providers.length <= 0"><fa-icon :icon="faUserSlash" /></span>
  <a class="btn btn-link mx-1 no-underline" v-else-if="providers && providers.providers.length === 1" :href="providers.providers[0].url">
    <fa-icon :icon="faUser" />
    <span class="mx-2">{{ providers.providers[0].label ?? "Login" }}</span>
  </a>
  <div class="dropdown" v-else>
    <button class="btn dropdown-toggle mx-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <fa-icon :icon="faUser" /> Login
    </button>
    <ul class="dropdown-menu">
      <li v-for="provider in providers.providers" v-bind:key="provider.url">
        <a class="dropdown-item" :href="provider.url" onclick="">
          {{ provider.label ?? "Login" }} <fa-icon :icon="faArrowUpRightFromSquare" />
        </a>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.no-underline {
  text-decoration: none !important;
}
</style>

<script setup lang="ts">
import { saveOauthState } from "@client/util/storage.js";
import { faArrowUpRightFromSquare, faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import type { OAuthProvidersDto } from "@fumix/fu-blog-common";
import { bytesToBase64URL } from "@fumix/fu-blog-common";
import { onMounted, ref } from "vue";

const providers = ref<OAuthProvidersDto | null>(null);
const state = new Uint8Array(21);
crypto.getRandomValues(state);

onMounted(async () => {
  const response = await fetch(`/api/auth/providers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: bytesToBase64URL(state) }),
  }).then((it) => it.json());
  providers.value = response;

  saveOauthState({
    key: bytesToBase64URL(state),
  });
});
</script>
