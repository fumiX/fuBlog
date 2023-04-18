<template>
  <div>
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
</template>

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
