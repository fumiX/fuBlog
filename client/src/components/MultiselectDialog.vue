<template>
  <div class="modal fade" id="multiselectDialog" tabindex="-1" role="dialog" aria-labelledby="multiselectDialogLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content" v-if="user">
        <div class="modal-header">
          <h5 class="modal-title" id="multiselectDialogLabel">
            {{ user.username }}
          </h5>
        </div>
        <div class="modal-body">
          <h6>Rechte</h6>
          <div class="form-group" v-for="[key, value] in Object.entries(user.permissions)" v-bind:key="key">
            <div class="form-check">
              <input
                class="form-check-input"
                style="margin-left: 0"
                type="checkbox"
                :id="key"
                :checked="value ? true : undefined"
                @change="updateInput($event, key)"
              />
              <label class="form-check-label" :for="key">{{ key }}</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('canceled')">
            {{ "Abbrechen" }}
          </button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="saveCallback(value)">
            {{ "Speichern" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
  border-radius: 50%;
  overflow: hidden;
  vertical-align: middle;
}
</style>

<script lang="ts">
import { ref } from "vue";
import type { PropType } from "vue";
import { defineComponent, watch } from "vue";
import { Modal } from "bootstrap";
import type { UserDto } from "@fumix/fu-blog-common";

export default defineComponent({
  props: {
    show: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    user: {
      type: Object as PropType<UserDto | null>,
    },
    saveCallback: {
      type: Function as PropType<(selectedKeys: string[]) => void>,
      required: true,
    },
  },

  emits: ["confirmed", "canceled", "input"],

  setup(props, emits) {
    const value = ref<string[]>([]);

    watch(props, () => {
      const initialPermissions: string[] = props.user
        ? Object.entries(props.user.permissions)
            .filter(([key, value]) => value)
            .map(([key, value]) => key)
        : [];

      value.value = initialPermissions;

      const myModal = new Modal(document.getElementById("multiselectDialog") || "", {});
      const show = props.show;
      show ? myModal?.show() : myModal.hide();
    });

    return {
      props,
      emits,
      value,
    };
  },

  methods: {
    updateInput($event: Event, key: string) {
      const isChecked = ($event.target as HTMLInputElement).checked;
      if (isChecked) {
        this.value.push(key);
      } else {
        this.value = this.value.filter((k) => k !== key);
      }
    },
  },
});
</script>
