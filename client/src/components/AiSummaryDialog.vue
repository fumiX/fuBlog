<template>
  <div class="modal fade modal-lg" id="aiModal" tabindex="-1" role="dialog" aria-labelledby="aiModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="aiModalLabel">{{ t("ai.summary.dialog.title") }}</h5>
        </div>
        <div class="modal-body">
          <div v-for="(d, i) in data" v-bind:key="i" class="summary-container">
            <ai-summary
              :summary-data="d"
              @add-tag="addTag($event)"
              @update-description="acceptDescription($event)"
              @remove-ai-summary="$emit('removeAiSummary', d)"
            ></ai-summary>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('canceled')">
            {{ t("app.base.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AiSummary from "@client/components/AiSummary.vue";
import { t } from "@client/plugins/i18n.js";
import type { AiSummaryData } from "@fumix/fu-blog-common";
import { Modal } from "bootstrap";
import type { PropType } from "vue";
import { watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean as PropType<boolean>,
  },
  data: {
    type: Array as PropType<AiSummaryData[] | []>,
  },
});

const emits = defineEmits(["acceptDescription", "canceled", "addTag", "removeAiSummary"]);

watch(props, () => {
  const myModal = new Modal(document.getElementById("aiModal") || "", {});
  const show = props.show;
  show ? myModal?.show() : myModal.hide();
});

const acceptDescription = (description: string) => {
  emits("acceptDescription", description);
};

const addTag = (tag: string) => {
  emits("addTag", tag);
};
</script>
