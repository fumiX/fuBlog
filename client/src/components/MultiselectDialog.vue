<template>
  <div class="modal fade" id="multiselectDialog" tabindex="-1" role="dialog" aria-labelledby="multiselectDialogLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="multiselectDialogLabel">{{ title }}</h5>
        </div>
        <div class="modal-body">
          <ul>
            <li v-for="[key, value] in Object.entries(options)" v-bind:key="key">
              <input type="checkbox" :checked="value.selected ? true : undefined" @input="updateInput($event, key)" /> {{ value.label }}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('canceled')">
            {{ "Abbrechen" }}
          </button>
          <button type="button" class="btn btn-success" @click="saveCallback(['save'])">
            {{ "Speichern" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { config } from "@fortawesome/fontawesome-svg-core";
import type { PropType } from "vue";
import { defineComponent, watch } from "vue";
import { Modal } from "bootstrap";

export default defineComponent({
  props: {
    show: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    multiselect: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    title: {
      type: String as PropType<string>,
      default: "",
    },
    options: {
      type: Object as PropType<{ [key: string]: { label: string; selected: boolean } }>,
      required: true,
    },
    saveCallback: {
      type: Function as PropType<(selectedKeys: string[]) => void>,
      required: true,
    },
  },

  emits: ["confirmed", "canceled", "input"],

  data: () => ({
    value: "",
  }),

  created() {
    this.value = "";
    this.$watch("value", (value) => {
      this.$emit("input", value);
    });
  },

  setup(props, emits) {
    watch(props, () => {
      const myModal = new Modal(document.getElementById("multiselectDialog") || "", {});
      const show = props.show;
      show ? myModal?.show() : myModal.hide();
    });

    return {
      props,
      emits,
    };
  },

  methods: {
    updateInput($event: Event, key: string) {
      console.log("Update input", $event, key);
    }
  },
});
</script>
