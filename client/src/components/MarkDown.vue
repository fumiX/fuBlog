<template>
  <div v-html="sanitizedHtml"></div>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { marked } from "marked";

export default defineComponent({
  props: {
    markdown: String,
  },

  setup(props) {
    const sanitizedHtml = ref<String>("");

    watch(props, () => {
      const md = props.markdown;
    //   const san = await sanitizeHtml(md);
      sanitizedHtml.value = marked.parse(md);
    });
    return {
      sanitizedHtml,
    };
  },

  methods: {},
});
</script>
