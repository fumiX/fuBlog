<template>
  <div class="container">
    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div class="clearfix my-4">
              <split-flap-display :width="length" :text="text"></split-flap-display>
              <input :maxlength="length" type="text" class="form-control" style="width: 250px; margin: 3rem auto 0 auto" v-model="text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>

<script setup lang="ts">
import SplitFlapDisplay from "@client/components/SplitFlapDisplay.vue";
import { ref } from "vue";

const text = ref<string>("404 NOT FOUND");
const length = ref<number>(13);
</script>
