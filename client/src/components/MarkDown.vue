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

  audio {
    max-width: 100% !important;
    margin: 10px 0 !important;
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
  customFileUrls: {
    type: Object as PropType<{ [sha256: string]: File }>,
    default: () => {},
  },
});

const emits = defineEmits(["loading"]);

watch(props, async () => {
  try {
    emits("loading", true);
    sanitizedHtml.value = await MarkdownConverterClient.Instance.convert(props.markdown ?? "", async (token: string) => {
      if (!token || token.length < 10) {
        return Promise.reject("File hash too short");
      }
      const urls = Object.keys(props.customFileUrls).filter((it) => it.startsWith(token));
      if (urls && urls.length === 1) {
        const customFile = props.customFileUrls[urls[0]];
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
