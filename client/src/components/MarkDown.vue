<template>
  <div v-html="sanitizedHtml" class="mdPreview"></div>
</template>

<style lang="scss">
.mdPreview {
  min-height: 520px;

  svg {
    max-width: 100% !important;
    height: auto !important;

    g > * :not(text) {
      stroke: #ccc !important;
    }
  }

  img {
    max-width: 100% !important;
    height: auto !important;
  }
}
</style>

<script setup lang="ts">
import { blobToArray, bytesToDataUrl } from "@fumix/fu-blog-common";
import type { PropType } from "vue";
import { ref, watch } from "vue";
import { MarkdownConverterClient } from "../markdown-converter-client.js";
import highlightjs from "highlight.js";
import { marked } from "marked";

const sanitizedHtml = ref<string>("");

const props = defineProps({
  markdown: {
    type: String as PropType<string | null>,
  },
  customImageUrls: {
    type: Object as PropType<{ [sha256: string]: File }>,
    default: () => {},
  },
});

const emits = defineEmits(["loading"]);

watch(props, async () => {
  try {
    emits("loading", true);
    sanitizedHtml.value = await MarkdownConverterClient.Instance.convert(props.markdown ?? "", async (token: string) => {
      const customFile = props.customImageUrls[token];
      if (customFile) {
        return blobToArray(customFile).then((it) => bytesToDataUrl(customFile.type, it));
      }
      return Promise.reject("No custom file found");
    });
  } catch (e) {
    console.error("Markdown error", e);
    // TODO erro handling
  } finally {
    emits("loading", false);
  }
});
</script>
