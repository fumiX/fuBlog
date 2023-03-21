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
                    <th rowspan="2" scope="col">{{ t("admin.table.columns.username") }}</th>
                    <th rowspan="2" scope="col">{{ t("admin.table.columns.name_and_email") }}</th>
                    <th rowspan="2" scope="col">{{ t("admin.table.columns.roles") }}</th>
                    <th rowspan="2" scope="col" v-if="props.userPermissions?.canEditUserRoles"></th>
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
                    <th scope="row" class="text-start">
                      <span class="profileWrapper">
                        <img v-if="user.profilePictureUrl" :src="user.profilePictureUrl" style="max-width: 3rem; max-height: 3rem" />
                      </span>
                      <span class="mx-4">{{ user.username }}</span>
                    </th>
                    <td>
                      {{ user.firstName }} {{ user.lastName }}<br />
                      <code>{{ user.email }}</code>
                    </td>
                    <td>
                      <div class="d-flex justify-content-between align-items-start">
                        <span style="display: inline-block" class="align-top">
                          <span v-for="role in user.roles.sort()" v-bind:key="role" class="m-0" style="display: block">
                            <span class="badge rounded-pill text-bg-secondary">{{ role }}</span>
                          </span>
                        </span>
                      </div>
                    </td>
                    <td style="vertical-align: middle" v-if="props.userPermissions?.canEditUserRoles">
                      <button class="btn btn-outline-primary btn-sm ml-2" @click="setEditUser(user)">
                        <fa-icon :icon="faPencil" />
                      </button>
                    </td>
                    <td
                      style="vertical-align: middle"
                      v-for="(value, index) in [
                        user.permissions?.canEditUserRoles,
                        user.permissions?.canCreatePost,
                        user.permissions?.canEditPost,
                        user.permissions?.canDeletePost,
                      ]"
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

<script lang="ts">
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import BooleanDisplay from "@client/components/BooleanDisplay.vue";
import MultiselectDialog from "@client/components/MultiselectDialog.vue";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import type { UserDto } from "@fumix/fu-blog-common";
import { permissionsForUser } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";
import type { UserRolePermissionsType } from "@fumix/fu-blog-common";

export default defineComponent({
  name: "UsersView",
  components: {
    MultiselectDialog,
    BooleanDisplay,
  },

  props: {
    userPermissions: {
      type: Object as PropType<UserRolePermissionsType>,
    },
  },

  setup(props) {
    const { t } = useI18n();
    return {
      showModal: ref(false),
      loading: ref(true),
      users: ref<UserDto[]>([]),
      editUser: ref<UserDto | null>(null),
      permissionsForUser: permissionsForUser,
      faPencil,
      props,
      t,
    };
  },
  async mounted() {
    await this.loadList();
  },
  methods: {
    async saveSettings(savedKeys: string[]) {
      await this.send(this.editUser?.id, savedKeys);

      this.closeDialog();
      this.loadList();
    },
    setEditUser(user: UserDto) {
      this.editUser = user;
      this.showModal = true;
    },
    closeDialog() {
      this.editUser = null;
      this.showModal = false;
    },
    async loadList() {
      this.loading = true;
      const authUrlRequest = new Request("/api/admin/users", {
        method: "GET",
      });
      const response = await fetch(authUrlRequest);
      this.users = (await response.json()) as UserDto[];
      this.loading = false;
    },
    getAllRoles(): string[] {
      // TODO: Get all available Roles from endpoint
      return ["ADMIN", "POST_CREATE", "POST_EDIT", "POST_DELETE"];
    },

    async send(id: number | undefined, roles: string[]) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      };
      const postUrl = `/api/admin/users/roles/${id}`;
      await fetch(postUrl, requestOptions);
    },
  },
});
</script>
