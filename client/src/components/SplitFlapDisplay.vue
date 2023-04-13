<template>
  <split-flap v-for="(char, i) in chars" :target-char="char" v-bind:key="i"></split-flap>
</template>
<script setup lang="ts">
import SplitFlap from "@client/components/SplitFlap.vue";
import { computed, reactive } from "vue";

const props = defineProps({ text: { type: String, required: true }, width: { type: Number, required: true } });
const chars = computed(() => {
  const uppercase: string | undefined = props.text?.toLocaleUpperCase("de");
  return [...Array(props.width).keys()].map((i) => uppercase?.substring(i, i + 1) ?? "").map((it) => (it.length !== 1 ? " " : it));
});
</script>
