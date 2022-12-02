<template>
  <div v-html="sanitizedHtml" class="mdPreview"></div>
</template>

<style lang="scss">
.mdPreview {
  min-height: 480px;
  svg {
    max-width: 100% !important;
    height: auto !important;
  }
}
</style>

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

  emits: ["loading"],

  setup(props, emits) {
    const sanitizedHtml = ref<String>("");

    watch(props, async () => {
      try {
        emits.emit("loading", true);
        const md = props.markdown;
        const san = await sanitizeHtml(md as string);
        sanitizedHtml.value = san;
      } catch (e) {
        // TODO erro handling
      } finally {
        emits.emit("loading", false);
      }
    });
    return {
      sanitizedHtml,
      emits,
    };
  },

  methods: {},
});
</script>
