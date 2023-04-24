<template>
  <div class="badge-container">
    <div v-for="tag in tags" :key="tag.id" class="custom-badge">
      {{ tag.name }}
    </div>
  </div>
</template>

<style lang="scss">
.badge-container {
  padding: 0;
  margin: 0;

  .custom-badge {
    display: inline-block;
    font-family: "Courier New", Courier, monospace;
    font-size: 9px;
    border: $badge-border;
    border-radius: 3px;
    background-color: $badge-background-color;
    color: $badge-text-color;
    margin-right: 0.5rem;
    padding: 2px 2px 0 2px;
  }
}
</style>

<script setup lang="ts">
import type { Tag } from "@fumix/fu-blog-common";
import type { PropType } from "vue";

const props = defineProps({ tags: { type: Array as PropType<Tag[]>, required: true } });
</script>
