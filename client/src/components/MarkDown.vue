<template>
  <div v-html="sanitizedHtml"></div>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";
import { sanitizeHtml } from "./../markdown-converter-client";

export default defineComponent({
  props: {
    markdown: {
      type: String as PropType<string | null>,
    },
  },

  setup(props) {
    const sanitizedHtml = ref<String>("");

    watch(props, async () => {
      const md = props.markdown;
      const san = await sanitizeHtml(md as string);
      sanitizedHtml.value = san;
    });
    return {
      sanitizedHtml,
    };
  },

  methods: {},
});
</script>
