<template>
  <div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-labelledby="confirmModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content" v-if="data">
        <div class="modal-header">
          <h5 class="modal-title" id="confirmModalLabel">{{ data.title }}</h5>
        </div>
        <div class="modal-body">
          {{ data.message }}
        </div>
        <div class="modal-footer" v-if="data">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('canceled')">
            {{ data.cancelTitle || t("app.base.no") }}
          </button>
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="$emit('confirmed')">
            {{ data.confirmTitle || t("app.base.yes") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { t } from "@client/plugins/i18n.js";
import type { ConfirmDialogData } from "@fumix/fu-blog-common";
import { Modal } from "bootstrap";
import type { PropType } from "vue";
import { watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean as PropType<boolean>,
  },
  data: {
    type: Object as PropType<ConfirmDialogData | null>,
  },
});

const emits = defineEmits(["confirmed", "canceled"]);

watch(props, () => {
  const myModal = new Modal(document.getElementById("confirmModal") || "", {});
  const show = props.show;
  show ? myModal?.show() : myModal.hide();
});
</script>
