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
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('canceled')">{{ data.cancelTitle || "Nein" }}</button>
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="$emit('confirmed')">{{ data.confirmTitle || "Ja" }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { defineComponent, watch } from "vue";
import type { ConfirmDialogData } from "./../../../interfaces/confirmdialog";
import type { PropType } from "vue";
import { Modal } from "bootstrap";

export default defineComponent({
  props: {
    show: {
      type: Boolean as PropType<boolean>,
    },
    data: {
      type: Object as PropType<ConfirmDialogData | null>,
    },
  },

  emits: ["confirmed", "canceled"],

  setup(props, emits) {
    watch(props, () => {
      const myModal = new Modal(document.getElementById("confirmModal") || "", {});
      const show = props.show;
      show ? myModal?.show() : myModal.hide();
    });

    return {
      props,
      emits,
    };
  },

  methods: {},
});
</script>
