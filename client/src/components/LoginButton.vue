<template>
  <span v-if="!providers || providers.providers.length <= 0">###</span>
  <a class="btn btn-primary mx-1" v-else-if="providers && providers.providers.length === 1" :href="providers.providers[0].url">
    {{ providers.providers[0].label ?? "Login" }}
    <fa-icon :icon="faArrowUpRightFromSquare" />
  </a>
  <div class="dropdown" v-else>
    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Login</button>
    <ul class="dropdown-menu">
      <li v-for="provider in providers.providers" v-bind:key="provider.url">
        <a class="dropdown-item" :href="provider.url">{{ provider.label ?? "Login" }} <fa-icon :icon="faArrowUpRightFromSquare" /></a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { bytesToBase64URL } from "@fumix/fu-blog-common";
import type { OAuthProvidersDto } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

export default defineComponent({
  setup() {
    const state = new Uint8Array(21);
   crypto.getRandomValues(state);
    return {
      providers: ref<OAuthProvidersDto | null>(null),
      state: bytesToBase64URL(state),
      faArrowUpRightFromSquare,
    };
  },
  async mounted() {
    const response = await fetch(`/api/auth/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: this.state }),
    }).then((it) => it.json());
    this.providers = response;
    window.sessionStorage.setItem("state", JSON.stringify({ state: this.state }));
  },
});
</script>
