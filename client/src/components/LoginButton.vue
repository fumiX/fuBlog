<template>
  <span class="mx-2 text-muted" v-if="!providers || providers.providers.length <= 0"><fa-icon :icon="faUserSlash" /></span>
  <a class="btn btn-primary mx-1" v-else-if="providers && providers.providers.length === 1" :href="providers.providers[0].url">
    <fa-icon :icon="faUser" />
    {{ providers.providers[0].label ?? "Login" }}
    <fa-icon :icon="faArrowUpRightFromSquare" />
  </a>
  <div class="dropdown" v-else>
    <button class="btn dropdown-toggle mx-1" type="button" data-bs-toggle="dropdown" aria-expanded="false"><fa-icon :icon="faUser" /> Login</button>
    <ul class="dropdown-menu">
      <li v-for="provider in providers.providers" v-bind:key="provider.url">
        <a class="dropdown-item" :href="provider.url" onclick="">
          {{ provider.label ?? "Login" }} <fa-icon :icon="faArrowUpRightFromSquare" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { saveOauthState } from "@/util/storage.js";
import { faArrowUpRightFromSquare, faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import type { OAuthProvidersDto } from "@fumix/fu-blog-common";
import { bytesToBase64URL } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const state = new Uint8Array(21);
    crypto.getRandomValues(state);
    return {
      providers: ref<OAuthProvidersDto | null>(null),
      state: bytesToBase64URL(state),
      faArrowUpRightFromSquare,
      faUser,
      faUserSlash,
    };
  },
  async mounted() {
    const response = await fetch(`/api/auth/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: this.state }),
    }).then((it) => it.json());
    this.providers = response;

    saveOauthState({
      key: this.state,
    });
  },
});
</script>
