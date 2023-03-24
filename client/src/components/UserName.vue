<template>
  <div style="vertical-align: middle">
    <span class="avatar">
      <img v-if="props.user.profilePictureUrl" :src="props.user.profilePictureUrl" />
    </span>
    <span>{{ props.user.fullName }}</span>
    <button type="button" class="btn btn-link" @click="$emit('logout')"><fa-icon :icon="faSignOut" /></button>
  </div>
</template>

<style lang="scss">
.avatar {
  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 0.5rem;
  }
}
</style>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import type { User } from "@fumix/fu-blog-common";

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
  emits: ["logout"],
  setup(props, emits) {
    return {
      props,
      emits,
      faSignOut,
    };
  },
});
</script>
