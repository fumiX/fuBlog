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
    sanitizedHtml.value = await MarkdownConverterClient.Instance.convert(props.markdown ?? "", {
      /* // TODO: Fix this, so images and diagrams are both replaced correctly
      walkTokens: async (token) => {
        if (token.type === "image") {
          const customFile = props.customImageUrls[token.href];
          if (customFile) {
            token.href = await blobToArray(customFile).then((it) => bytesToDataUrl(customFile.type, it));
          }
        }
      },*/
    });
  } catch (e) {
    console.error("Markdown error", e);
    // TODO erro handling
  } finally {
    emits("loading", false);
  }
});
</script>
