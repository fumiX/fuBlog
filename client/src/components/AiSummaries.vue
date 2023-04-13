<template>
  <div v-for="(d, i) in data" v-bind:key="i">
    <ai-summary :summary-data="d"></ai-summary>
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
import type { SummaryDto } from "@fumix/fu-blog-common";
import { ref } from "vue";

const props = defineProps({
  fullText: { type: String, required: true },
});

const data = ref<SummaryDto[]>([]);
const loading = ref<boolean>(false);

function loadNewSummary(e: MouseEvent) {
  e.preventDefault();
  loading.value = true;
  setTimeout(() => {
    data.value.push({
      summary: "abcdef",
      keywords: ["A", "B"],
    });
    loading.value = false;
  }, 2000);
}
</script>
