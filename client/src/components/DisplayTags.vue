<template>
  <div class="badge-container">
    <div
      v-for="tag in [...tags].sort((a, b) => a.name.localeCompare(b.name))"
      :key="tag.id"
      class="badge me-1"
      @click="searchWord(tag.name)"
    >
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
    cursor: pointer;
  }
}
</style>

<script setup lang="ts">
import type { Tag } from "@fumix/fu-blog-common";
import type { PropType } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({ tags: { type: Array as PropType<Tag[]>, required: true } });

const searchWord = (word: string): void => {
  if (word) {
    router.push(`/posts/?search=${word}&operator=and`);
  }
};
</script>
