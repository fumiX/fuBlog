<template>
  <div style="vertical-align: middle">
    <span class="avatar">
      <img v-if="props.user.profilePictureUrl" :src="props.user.profilePictureUrl" />
    </span>
    {{ props.user.firstName }} {{ props.user.lastName }}
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
import { faArrowUpRightFromSquare, faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import type { UserDto } from "@fumix/fu-blog-common";

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<UserDto>,
      required: true,
    },
  },
  setup(props) {
    return {
      props,
    };
  },
});
</script>
