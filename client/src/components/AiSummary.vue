<template>
  <div>
    <div v-if="isSuccessfulAiSummaryData(summaryData)">
      <button type="button" class="btn-close btn-close-white float-end" aria-label="Close" @click="$emit('removeAiSummary')"></button>
      <div class="summary-text-container">
        <div class="summary-text">{{ summaryData.summary }}</div>
        <button type="button" class="btn btn-sm btn-outline-success" @click="$emit('updateDescription', summaryData.summary)">
          {{ t("ai.summary.accept") }}
        </button>
      </div>
      <div class="summary-text-container">
        <div class="small text-muted">{{ t("ai.summary.tags.hint") }}</div>
        <button
          type="button"
          v-for="keyword in summaryData.keywords"
          v-bind:key="keyword"
          class="btn badge rounded-pill bg-success"
          style="margin-right: 2px"
          @click="$emit('addTag', keyword)"
        >
          {{ keyword }}
        </button>
      </div>
      <div class="row">
        <div class="col-md-4 my-4" v-for="(prompt, idx) in summaryData.imagePrompts" :key="prompt">
          <button class="btn btn-sm btn-outline-success" @click="acceptImagePrompt($event, prompt, idx)">
            <fa-icon :icon="faImage"></fa-icon> <fa-icon :icon="faWandMagicSparkles"></fa-icon>
            {{ prompt }}
          </button>
        </div>
      </div>

      <div class="row h-100">
        <div class="col-md-4 my-auto text-center" v-for="(prompt, idx) in summaryData.imagePrompts" :key="prompt">
          <loading-spinner v-if="promptLoading[idx] && !imageError[idx]" />
          <img
            v-if="!imageError[idx] && !promptLoading[idx] && generatedImageSrc[idx]"
            :src="generatedImageSrc[idx]"
            :alt="prompt"
            class="keyvisual-preview"
            @click="setKeyvisual($event, prompt, idx)"
          />
          <div class="text-muted small" v-if="imageError[idx]">{{ imageError[idx] }}</div>
        </div>
      </div>
    </div>
    <div v-else class="bg-danger">
      {{ summaryData.error }}
    </div>
  </div>
</template>

<style lang="scss">
.summary-text-container {
  padding: 0 0 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(50, 50, 50, 0.1);
}

.keyvisual-preview {
  border-radius: 5px;
  cursor: pointer;
  opacity: 0.75;
  &:hover {
    opacity: 1;
  }
}
</style>

<script setup lang="ts">
import { t } from "@client/plugins/i18n.js";
import { OpenAiEndpoints } from "@client/util/api-client.js";
import { faImage, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import type { AiSummaryData } from "@fumix/fu-blog-common";
import { isSuccessfulAiSummaryData } from "@fumix/fu-blog-common";
import { ref, type PropType } from "vue";
import { onMounted } from "vue";
import LoadingSpinner from "@client/components/LoadingSpinner.vue";

const generatedImageSrc = ref<string[]>([]);
const promptLoading = ref<boolean[]>([]);
const imageError = ref<string[]>([]);

const props = defineProps({
  summaryData: { type: Object as PropType<AiSummaryData>, required: true },
});

async function acceptImagePrompt(e: MouseEvent, prompt: string, idx: number) {
  promptLoading.value[idx] = true;
  e.preventDefault();
  await OpenAiEndpoints.dallEGenerateImage(prompt)
    .then((it) => {
      generatedImageSrc.value[idx] = it;
      promptLoading.value[idx] = false;
    })
    .catch((reason) => {
      imageError.value[idx] = reason;
      promptLoading.value[idx] = false;
    });
}

const setKeyvisual = (e: MouseEvent, prompt: string, idx: number) => {
  e.preventDefault();
  emit("setKeyvisual", generatedImageSrc.value[idx]);
};

const emit = defineEmits(["updateDescription", "addTag", "removeAiSummary", "setKeyvisual"]);

onMounted(() => {
  // auto remove if error
  if (!isSuccessfulAiSummaryData(props.summaryData)) {
    setTimeout(() => {
      emit("removeAiSummary");
    }, 5000);
  } else {
    // prepare imageArray otherwise
    promptLoading.value = new Array(props.summaryData.imagePrompts.length).fill(false);
    generatedImageSrc.value = new Array(props.summaryData.imagePrompts.length).fill(null);
    imageError.value = new Array(props.summaryData.imagePrompts.length).fill(null);
  }
});
</script>
