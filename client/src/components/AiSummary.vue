<template>
  <div v-if="isSuccessfulAiSummaryData(summaryData)">
    <button v-if="onSetDescription" class="btn btn-sm btn-outline-success" @click="acceptDescription($event, summaryData.summary)">
      Kurzbeschreibung übernehmen
    </button>
    <button type="button" class="btn-close float-end" aria-label="Close" @click="$emit('removeData')"></button>
    <div class="bg-secondary-subtle">{{ summaryData.summary }}</div>
    <div>
      <button
        v-for="keyword in summaryData.keywords"
        v-bind:key="keyword"
        class="badge rounded-pill bg-success"
        @click="acceptTag($event, keyword)"
      >
        {{ keyword }}
      </button>
    </div>
  </div>
  <div v-else class="bg-danger">
    {{ summaryData.error }}
  </div>
</template>

<script setup lang="ts">
import type { AiSummaryData } from "@fumix/fu-blog-common";
import { isSuccessfulAiSummaryData } from "@fumix/fu-blog-common";
import { onMounted } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  summaryData: { type: Object as PropType<AiSummaryData>, required: true },
  onAddTag: { type: Function as PropType<(tag: string) => void> },
  onSetDescription: { type: Function as PropType<(description: string) => void> },
});

function acceptDescription(e: MouseEvent, description: string) {
  e.preventDefault();
  props.onSetDescription?.(description);
}

function acceptTag(e: MouseEvent, tag: string) {
  e.preventDefault();
  props.onAddTag?.(tag);
}

const emit = defineEmits(["removeData"]);
onMounted(() => {
  // auto remove if error
  if (!isSuccessfulAiSummaryData(props.summaryData)) {
    setTimeout(() => {
      emit("removeData");
    }, 5000);
  }
});
</script>
