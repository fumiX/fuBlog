<template>
  <div class="container">
    <split-flap-display :width="15" :text="text"></split-flap-display>
    <input type="text" class="form-control" v-model="text" />
  </div>
</template>
<script setup lang="ts">
import SplitFlapDisplay from "@client/components/SplitFlapDisplay.vue";
import { ref } from "vue";
const text = ref<string>("404 NOT FOUND");
</script>
