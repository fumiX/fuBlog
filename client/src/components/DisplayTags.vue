<template>
  <div class="badge-container">
    <div v-for="tag in tags" :key="tag.id" class="badge me-1">
      {{ tag.name }}
    </div>
  </div>
</template>

<style lang="scss">
.badge-container {
  padding: 0;
  margin: 0;

  .badge {
    background-color: $badge-background-color;
    color: $badge-text-color;
  }
}
</style>

<script setup lang="ts">
import type { Tag } from "@fumix/fu-blog-common";
import type { PropType } from "vue";

const props = defineProps({ tags: { type: Array as PropType<Tag[]>, required: true } });
</script>
