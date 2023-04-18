<template>
  <div class="container">
    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <h1 class="display-4 font-italic">{{ t("admin.title") }}</h1>

            <div v-if="loading" style="position: relative; width: 100%; text-align: center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ t("app.base.loading") }}</span>
              </div>
            </div>
            <div v-else class="clearfix mb-4">
              <table class="table text-center table-bordered" aria-labelledby="h2">
                <thead>
                  <tr>
                    <th rowspan="2" scope="col">{{ t("admin.table.columns.user") }}</th>
                    <th rowspan="2" scope="col">{{ t("admin.table.columns.oauth") }}</th>
                    <th rowspan="2" scope="col">{{ t("admin.table.columns.roles") }}</th>
                    <th scope="col">{{ t("admin.table.columns.user") }}</th>
                    <th colspan="3" scope="col">{{ t("admin.table.columns.posts") }}</th>
                  </tr>
                  <tr>
                    <!-- Nutzer -->
                    <th scope="col">{{ t("admin.table.columns.permissions.edit_rights") }}</th>
                    <!-- Posts -->
                    <th scope="col">{{ t("admin.table.columns.permissions.create_post") }}</th>
                    <th scope="col">{{ t("admin.table.columns.permissions.edit_post") }}</th>
                    <th scope="col">{{ t("admin.table.columns.permissions.delete_post") }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" v-bind:key="user.id">
                    <th scope="row" class="d-flex flex-row fw-normal align-items-center">
                      <span class="profileWrapper">
                        <img v-if="user.profilePictureUrl" :src="user.profilePictureUrl" style="max-width: 3rem; max-height: 3rem" />
                      </span>
                      <div class="d-flex flex-column ps-3 align-items-start">
                        <strong>@{{ user.username }}</strong>
                        <span>{{ user.fullName }}</span>
                        <code>{{ user.email }}</code>
                      </div>
                    </th>
                    <td>
                      <span class="badge rounded-pill text-bg-info" v-for="provider in user.oauthProviders" v-bind:key="provider">{{
                        provider
                      }}</span>
                    </td>
                    <td>
                      <div class="d-flex justify-content-between align-items-start">
                        <span style="display: inline-block" class="align-top">
                          <span v-for="role in user.roles.sort()" v-bind:key="role" class="m-0" style="display: block">
                            <span class="badge rounded-pill text-bg-secondary">{{ role }}</span>
                          </span>
                        </span>
                        <button
                          class="btn btn-outline-primary btn-sm ml-2"
                          @click="setEditUser(user)"
                          v-if="props.userPermissions?.canEditUserRoles"
                        >
                          <fa-icon :icon="faPencil" />
                        </button>
                      </div>
                    </td>
                    <td
                      style="vertical-align: middle"
                      v-for="(value, index) in ((permissions) => [
                        permissions.canEditUserRoles,
                        permissions.canCreatePost,
                        permissions.canEditPost,
                        permissions.canDeletePost,
                      ])(permissionsForUser(user))"
                      v-bind:key="index"
                      :class="' bg-opacity-25 fs-6'"
                    >
                      <boolean-display :value="!value ? false : true" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <multiselect-dialog
      :show="showModal"
      :user="editUser"
      :save-callback="saveSettings"
      :roles="getAllRoles()"
      @canceled="closeDialog()"
    ></multiselect-dialog>
  </div>
</template>

<style lang="scss">
.profileWrapper {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 1.5rem;
  overflow: hidden;
  vertical-align: middle;
}
</style>

<script setup lang="ts">
import BooleanDisplay from "@client/components/BooleanDisplay.vue";
import MultiselectDialog from "@client/components/MultiselectDialog.vue";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import type { User, UserRolePermissionsType, UserWithOAuthProviders } from "@fumix/fu-blog-common";
import { permissionsForUser, UserRoles } from "@fumix/fu-blog-common";
// import type { PropType } from "vue";
import { defineProps, defineEmits, type PropType, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const showModal = ref(false);
const loading = ref(true);
const users = ref<UserWithOAuthProviders[]>([]);
const editUser = ref<User | null>(null);

const props = defineProps({
  userPermissions: {
    type: Object as PropType<UserRolePermissionsType>,
  },
});
const emits = defineEmits(["canceled"]);

const saveSettings = async (savedKeys: string[]) => {
  await send(editUser.value?.id, savedKeys);

  closeDialog();
  loadList();
};

const setEditUser = (user: User) => {
  editUser.value = user;
  showModal.value = true;
};

const closeDialog = () => {
  editUser.value = null;
  showModal.value = false;
};

const loadList = async () => {
  loading.value = true;
  const authUrlRequest = new Request("/api/admin/users", {
    method: "GET",
  });
  const response = await fetch(authUrlRequest);
  users.value = ((await response.json()) as UserWithOAuthProviders[]) ?? [];
  loading.value = false;
};

const getAllRoles = (): string[] => {
  return Object.keys(UserRoles);
};

const send = async (id: number | undefined, roles: string[]) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  };
  const postUrl = `/api/admin/users/roles/${id}`;
  await fetch(postUrl, requestOptions);
};

onMounted(async () => {
  await loadList();
});
</script>
