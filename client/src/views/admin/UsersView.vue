<template>
  <div class="container">
    <h2 id="h2">User permissions</h2>
    <table class="table text-center table-bordered" aria-labelledby="h2">
      <thead>
        <tr>
          <th rowspan="2" scope="col">Benutzername</th>
          <th rowspan="2" scope="col">Name & E-Mail</th>
          <th rowspan="2" scope="col">Rollen</th>
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
        <tr v-if="loading">
          <td>Loading …</td>
        </tr>
        <tr v-else v-for="user in users" v-bind:key="user.id">
          <th scope="row" class="text-start">
            <span
              class="mr-3"
              style="display: inline-block; width: 3rem; height: 3rem; border-radius: 1.5rem; overflow: hidden; vertical-align: middle"
            >
              <img v-if="user.profilePictureUrl" :src="user.profilePictureUrl" style="max-width: 3rem; max-height: 3rem"/>
            </span>
            {{ user.username }}
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
              <button
                class="btn btn-outline-primary btn-sm ml-2"
                @click="setEditUser(user)"
                data-bs-toggle="modal"
                data-bs-target="#userRolesModal"
              >
                <fa-icon :icon="faPencil" />
              </button>
            </div>
          </td>
          <td
            v-for="(value, index) in [
              user.permissions.canEditUserRoles,
              user.permissions.canCreatePost,
              user.permissions.canEditPost,
              user.permissions.canDeletePost,
            ]"
            v-bind:key="index"
            :class="(value ? 'bg-success' : 'bg-danger') + ' bg-opacity-25 fs-3'"
          >
            <boolean-display :value="value" />
          </td>
        </tr>
      </tbody>
    </table>

    <multiselect-dialog
      id="userRolesModal"
      :show="editUser !== null"
      :multiselect="true"
      :title="editUser?.username ?? ''"
      :save-callback="bla"
      :options="editUser ? allRoles(editUser) : {}"
    />
  </div>
</template>

<script lang="ts">
import BooleanDisplay from "@/components/BooleanDisplay.vue";
import MultiselectDialog from "@/components/MultiselectDialog.vue";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import type { UserDto } from "@fumix/fu-blog-common";
import { permissionsForUser, UserRoles } from "@fumix/fu-blog-common";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "UsersView",
  components: { MultiselectDialog, BooleanDisplay },
  setup() {
    return {
      loading: ref(true),
      users: ref<UserDto[]>([]),
      editUser: ref<UserDto | null>(null),
      permissionsForUser: permissionsForUser,
      allRoles: (user: UserDto) =>
        Object.fromEntries(
          Object.entries(UserRoles).map(([key, role]) => {
            return [role, { label: key + ": " + role.description, selected: user?.roles?.some((it) => it === key) ?? false }];
          }),
        ),
      faPencil,
    };
  },
  async mounted() {
    const authUrlRequest = new Request("/api/admin/users", {
      method: "GET",
    });
    const response = await fetch(authUrlRequest);
    this.users = (await response.json()) as UserDto[];
    this.loading = false;
    document.getElementById("userRolesModal")?.addEventListener("confirmed", (e) => console.log("Event confirmed", e));
    document.getElementById("userRolesModal")?.addEventListener("hide.bs.modal", (e) => console.log("Event hide", e));
  },
  methods: {
    async bla(savedKeys: string[]) {
      console.log("Saved keys", savedKeys);
    },
    async setEditUser(user: UserDto) {
      this.editUser = user;
    },
  },
});
</script>

<style scoped></style>
