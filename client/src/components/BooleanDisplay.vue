<template>
  <div style="vertical-align: middle">
    <fa-icon :icon="faCheck" class="text-success" v-if="value === true" />
    <fa-icon :icon="faX" class="text-danger" v-else-if="value === false" />
    <fa-icon :icon="faQuestion" class="text-warning" v-else />
  </div>
</template>

<script setup lang="ts">
import { faCheck, faQuestion, faX } from "@fortawesome/free-solid-svg-icons";
import type { PropType } from "vue";

const props = defineProps({ value: { type: Boolean as PropType<boolean | null>, required: true } });
</script>
