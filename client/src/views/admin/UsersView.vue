<template>
  <div class="container">
    <div class="jumbotron rounded mb-4 p-3 p-md-5 blog-bg">
      <div class="col px-0">
        <h1 class="display-2 font-italic">Benutzerverwaltung</h1>
        <p class="display-6 my-1 text-dark">Benutzerrechte und Rollen vergeben.</p>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div v-if="loading" style="position: relative; width: 100%; text-align: center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else class="clearfix mb-4">
              <table class="table text-center table-bordered" aria-labelledby="h2">
                <thead>
                  <tr>
                    <th rowspan="2" scope="col">Benutzername</th>
                    <th rowspan="2" scope="col">Name & E-Mail</th>
                    <th rowspan="2" scope="col">Rollen</th>
                    <th rowspan="2" scope="col"></th>
                    <th scope="col">Nutzer</th>
                    <th colspan="3" scope="col">Posts</th>
                  </tr>
                  <tr>
                    <!-- Nutzer -->
                    <th scope="col">Rechte bearbeiten</th>
                    <!-- Posts -->
                    <th scope="col">Erstellen</th>
                    <th scope="col">Bearbeiten</th>
                    <th scope="col">Löschen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" v-bind:key="user.id">
                    <th scope="row" class="text-start">
                      <span class="avatar">
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
                    <td>
                      <button class="btn btn-outline-primary btn-sm ml-2" @click="setEditUser(user)">
                        <fa-icon :icon="faPencil" />
                      </button>
                    </td>
                    <td
                      v-for="(value, index) in [
                        user.permissions.canEditUserRoles,
                        user.permissions.canCreatePost,
                        user.permissions.canEditPost,
                        user.permissions.canDeletePost,
                      ]"
                      v-bind:key="index"
                      :class="' bg-opacity-25 fs-6'"
                    >
                      <boolean-display :value="value" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <multiselect-dialog :show="showModal" :user="editUser" :save-callback="saveSettings" @canceled="closeDialog()"></multiselect-dialog>
  </div>
</template>

<style lang="scss">
.blog-bg {
  background-image: url("@/assets/images/post-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
.avatar {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 1.5rem;
  overflow: hidden;
  vertical-align: middle;
}
</style>

<script lang="ts">
import type { PropType } from "vue";
import BooleanDisplay from "@/components/BooleanDisplay.vue";
import MultiselectDialog from "@/components/MultiselectDialog.vue";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import type { UserDto } from "@fumix/fu-blog-common";
import { permissionsForUser } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";
import type Permission from "../../permissions.js";

export default defineComponent({
  name: "UsersView",
  components: {
    MultiselectDialog,
    BooleanDisplay,
  },

  props: {
    userPermissions: {
      type: Array as PropType<Permission[]>,
    },
  },

  setup(props) {
    return {
      showModal: ref(false),
      loading: ref(true),
      users: ref<UserDto[]>([]),
      editUser: ref<UserDto | null>(null),
      permissionsForUser: permissionsForUser,
      faPencil,
      props,
    };
  },
  async mounted() {
    await this.loadList();
  },
  methods: {
    saveSettings(savedKeys: string[]) {
      console.log("TODO: Save Permissions");
      console.log("Saved Permissions", savedKeys);
      console.log("UserID", this.editUser?.id, this.editUser?.username);
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
      // document.getElementById("userRolesModal")?.addEventListener("confirmed", (e) => console.log("Event confirmed", e));
      // document.getElementById("userRolesModal")?.addEventListener("hidden.bs.modal", (e) => console.log("Event hide", e));
    },
  },
});
</script>
