<template>
  <md-chip-set>
    <md-suggestion-chip v-for="tag in sortedTags()" v-bind:key="tag" :label="tag" @click="searchWord(tag)"></md-suggestion-chip>
  </md-chip-set>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { useRouter } from "vue-router";
import "@material/web/chips/chip-set.js";
import "@material/web/chips/filter-chip.js";
import "@material/web/chips/suggestion-chip.js";

const router = useRouter();
const props = defineProps({ tags: { type: Array as PropType<string[]>, required: true } });

const sortedTags = () => [...props.tags].sort((a, b) => a.localeCompare(b));

const searchWord = (word: string): void => {
  if (word) {
    router.push(`/posts/?search=${encodeURIComponent(word)}&operator=and`);
  }
};
</script>
