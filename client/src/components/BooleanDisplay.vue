<template>
  <div style="vertical-align: middle">
    <fa-icon :icon="faCheck" class="text-success" v-if="value === true" />
    <fa-icon :icon="faX" class="text-danger" v-else-if="value === false" />
    <fa-icon :icon="faQuestion" class="text-warning" v-else />
  </div>
</template>
<script lang="ts">
import { faCheck, faX, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    value: {
      type: Boolean as PropType<boolean | null>,
      required: true,
    },
  },
  setup() {
    return {
      faCheck,
      faQuestion,
      faX,
    };
  },
});
</script>
