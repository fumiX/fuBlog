<template>
  <div class="container">
    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <h3 class="display-4">{{ title }}</h3>
            <p>Goes here ...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const title = ref<String>("Administration Panel");

    return {
      title,
    };
  },
});
</script>
