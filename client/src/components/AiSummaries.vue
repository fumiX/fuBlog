<template>
  <div v-for="(d, i) in data" v-bind:key="i" class="bg-success bg-opacity-25 m-1 p-1">
    <button v-if="onSetDescription" class="btn btn-sm btn-outline-success" @click="acceptDescription($event, d.summary)">
      Kurzbeschreibung übernehmen
    </button>
    <button type="button" class="btn-close float-end" aria-label="Close" @click="removeData(d)"></button>
    <ai-summary :summary-data="d" :onAddTag="props.onAddTag"></ai-summary>
  </div>
  <small v-if="fullText.length < 500" class="text-muted">
    🤖 Noch {{ 500 - fullText.length }} Zeichen, dann kann eine Zusammenfassung mit KI generiert werden.
  </small>
  <button
    v-else-if="data.length < 3"
    class="btn btn-outline-success"
    :class="{ 'btn-lg': data.length <= 0 }"
    :disabled="loading"
    @click="loadNewSummary"
  >
    <loading-spinner v-if="loading" /><span v-else>🤖🪄 {{ t("ai.summarize") }}</span>
  </button>
</template>

<script setup lang="ts">
import AiSummary from "@client/components/AiSummary.vue";
import LoadingSpinner from "@client/components/LoadingSpinner.vue";
import { t } from "@client/plugins/i18n.js";
import { OpenAiEndpoints } from "@client/util/api-client.js";
import type { SummaryDto } from "@fumix/fu-blog-common";
import { ref } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  fullText: { type: String, required: true },
  onSetDescription: { type: Function as PropType<(description: string) => void> },
  onAddTag: { type: Function as PropType<(tag: string) => void> },
});

const data = ref<SummaryDto[]>([]);
const loading = ref<boolean>(false);

function acceptDescription(e: MouseEvent, description: string) {
  e.preventDefault();
  props.onSetDescription?.(description);
}

function removeData(d: SummaryDto) {
  data.value = data.value.filter((it) => it != d);
}

function loadNewSummary(e: MouseEvent) {
  e.preventDefault();
  loading.value = true;
  OpenAiEndpoints.letChatGptSummarize(props.fullText)
    .then((it) => {
      data.value.push(it);
      loading.value = false;
    })
    .catch((reason) => {
      alert(reason);
      loading.value = false;
    });
}
</script>
