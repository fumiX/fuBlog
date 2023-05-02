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
      <div>
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
        <div class="col-md-4" v-for="prompt in summaryData.imagePrompts" v-bind:key="prompt">
          <button class="btn btn-sm btn-outline-success" @click="acceptImagePrompt($event, prompt)">
            <fa-icon :icon="faImage"></fa-icon><fa-icon :icon="faWandMagicSparkles"></fa-icon>
            {{ prompt }}
          </button>
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
</style>

<script setup lang="ts">
import { t } from "@client/plugins/i18n.js";
import { OpenAiEndpoints } from "@client/util/api-client.js";
import { faImage, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import type { AiSummaryData } from "@fumix/fu-blog-common";
import { isSuccessfulAiSummaryData } from "@fumix/fu-blog-common";
import type { PropType } from "vue";
import { onMounted } from "vue";

const props = defineProps({
  summaryData: { type: Object as PropType<AiSummaryData>, required: true },
});

function acceptDescription(e: MouseEvent, description: string) {
  e.preventDefault();
  emit("updateDescription", description);
}

async function acceptImagePrompt(e: MouseEvent, prompt: string) {
  e.preventDefault();
  await OpenAiEndpoints.dallEGenerateImage(prompt)
    .then((it) => {
      alert(JSON.stringify(it));
    })
    .catch((reason) => {
      alert(reason);
    });
}

function acceptTag(e: MouseEvent, tag: string) {
  e.preventDefault();
  emit("addTag", tag);
}

const emit = defineEmits(["updateDescription", "addTag", "removeAiSummary"]);

onMounted(() => {
  // auto remove if error
  if (!isSuccessfulAiSummaryData(props.summaryData)) {
    setTimeout(() => {
      emit("removeAiSummary");
    }, 5000);
  }
});
</script>
