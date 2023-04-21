<template>
  <div>
    <div class="summary-text">{{ summaryData.summary }}</div>
    <div>
      <div class="small text-muted">Klicken, um Schlagworte zu übernehmen</div>
      <button
        v-for="keyword in summaryData.keywords"
        v-bind:key="keyword"
        class="btn badge rounded-pill bg-success"
        style="margin-right: 2px"
        @click="acceptTag($event, keyword)"
      >
        {{ keyword }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.summary-text {
  padding: 0.5rem 0;
}
</style>

<script setup lang="ts">
import type { SummaryDto } from "@fumix/fu-blog-common";
import type { PropType } from "vue";

const props = defineProps({
  summaryData: { type: Object as PropType<SummaryDto>, required: true },
  onAddTag: { type: Function as PropType<(tag: string) => void> },
});

function acceptTag(e: MouseEvent, tag: string) {
  e.preventDefault();
  props.onAddTag?.(tag);
}
</script>
