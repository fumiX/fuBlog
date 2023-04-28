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
    <div class="row">
      <div class="col-md-4" v-for="prompt in summaryData.imagePrompts" v-bind:key="prompt">
        <button class="btn btn-sm btn-outline-success" @click="acceptImagePrompt($event, prompt)">
          <fa-icon :icon="faImage"></fa-icon>🪄
          {{ prompt }}
        </button>
      </div>
    </div>
  </div>
  <div v-else class="bg-danger">
    {{ summaryData.error }}
  </div>
</template>

<script setup lang="ts">
import { OpenAiEndpoints } from "@client/util/api-client.js";
import type { AiSummaryData } from "@fumix/fu-blog-common";
import { isSuccessfulAiSummaryData } from "@fumix/fu-blog-common";
import { onMounted } from "vue";
import type { PropType } from "vue";
import { faImage, faWandSparkles } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  summaryData: { type: Object as PropType<AiSummaryData>, required: true },
  onAddTag: { type: Function as PropType<(tag: string) => void> },
  onSetDescription: { type: Function as PropType<(description: string) => void> },
});

function acceptDescription(e: MouseEvent, description: string) {
  e.preventDefault();
  props.onSetDescription?.(description);
}

async function acceptImagePrompt(e: MouseEvent, prompt: string) {
  e.preventDefault();
  alert(prompt); // TODO: send event to parent
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
