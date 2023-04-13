<template>
  <div>
    <div class="bg-secondary-subtle">{{ summaryData.summary }}</div>
    <div>
      <button v-for="keyword in summaryData.keywords" v-bind:key="keyword">{{ keyword }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryDto } from "@fumix/fu-blog-common";
import { ref } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  summaryData: { type: Object as PropType<SummaryDto>, required: true },
});
</script>
