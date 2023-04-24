<template>
  <div>
    <div v-if="isSuccessfulAiSummaryData(summaryData)">
      <!-- <button type="button" class="btn-close btn-close-white float-end" aria-label="Close" @click="$emit('removeData')"></button> -->
      <div class="summary-text-container">
        <div class="summary-text">{{ summaryData.summary }}</div>
        <button type="button" class="btn btn-sm btn-outline-success" @click="$emit('acceptDescription', summaryData.summary)">
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
import type { AiSummaryData } from "@fumix/fu-blog-common";
import { isSuccessfulAiSummaryData } from "@fumix/fu-blog-common";
import { onMounted } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  summaryData: { type: Object as PropType<AiSummaryData>, required: true },
  onAddTag: { type: Function as PropType<(tag: string) => void> },
  onSetDescription: { type: Function as PropType<(description: string) => void> },
});

// function acceptDescription(e: MouseEvent, description: string) {
//   e.preventDefault();
//   props.onSetDescription?.(description);
// }

// function acceptTag(e: MouseEvent, tag: string) {
//   e.preventDefault();
//   props.onAddTag?.(tag);
// }

const emit = defineEmits(["removeData", "acceptDescription"]);

onMounted(() => {
  // auto remove if error
  if (!isSuccessfulAiSummaryData(props.summaryData)) {
    setTimeout(() => {
      emit("removeData");
    }, 5000);
  }
});
</script>
