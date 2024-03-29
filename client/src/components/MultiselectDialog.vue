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
          <h6 class="display-6">{{ t("app.base.roles") }}</h6>
          <div class="form-group" v-for="role in props.roles" v-bind:key="role">
            <div class="form-check">
              <input
                class="form-check-input"
                style="margin-left: 0"
                type="checkbox"
                :id="role"
                :checked="value.includes(role)"
                @change="updateInput($event, role)"
              />
              <label class="form-check-label" :for="role">{{ role }}</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('canceled')">
            {{ t("app.base.cancel") }}
          </button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="saveCallback(value)">
            {{ t("app.base.save") }}
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

<script setup lang="ts">
import type { User } from "@fumix/fu-blog-common";
import { Modal } from "bootstrap";
import type { PropType } from "vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const value = ref<string[]>([]);

const props = defineProps({
  show: {
    type: Boolean as PropType<boolean>,
    required: true,
  },
  user: {
    type: Object as PropType<User | null>,
  },
  roles: {
    type: Array as PropType<string[]>,
    required: true,
  },
  saveCallback: {
    type: Function as PropType<(selectedKeys: string[]) => void>,
    required: true,
  },
});

const emits = defineEmits(["confirmed", "canceled", "input"]);

watch(props, () => {
  const availableRoles = props.roles;
  const initialRoles: string[] | undefined = props.user ? props.user.roles.filter((value) => value) : [];

  value.value = initialRoles;

  const myModal = new Modal(document.getElementById("multiselectDialog") || "", {});
  const show = props.show;
  show ? myModal?.show() : myModal.hide();
});

const updateInput = ($event: Event, key: string) => {
  const isChecked = ($event.target as HTMLInputElement).checked;
  if (isChecked) {
    value.value.push(key);
  } else {
    value.value = value.value.filter((k) => k !== key);
  }
};
</script>
