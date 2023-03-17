<template>
  <div class="row mb-2">
    <div class="col">
      <div class="card flex-md-row mb-4 box-shadow h-md-250">
        <div class="card-body">
          <div class="clearfix mb-4">
            <button v-if="hasPermission('delete')" class="btn btn-sm btn-danger float-end" @click="$emit('deletePost', post)">
              <fa-icon :icon="faTrash" />
              {{ t("app.base.delete") }}
            </button>
            <button v-if="hasPermission('write')" class="btn btn-sm btn-secondary float-end mx-2" @click="$emit('changePost', post)">
              <fa-icon :icon="faEdit" />
              {{ t("app.base.edit") }}
            </button>
          </div>
          <!-- <strong class="d-inline-block mb-2 text-primary">Kategorie</strong> -->
          <h3 class="mb-0 display-4 clickable" @click="goTo('/posts/post/' + post.id)">
            {{ post.title }}
          </h3>

          <div class="mb-1 text-muted creator">
            <fa-icon :icon="faClock" />
            {{ $luxonDateTime.fromISO(post.createdAt.toString(), { locale: locale }).toRelativeCalendar() }}
            <i v-if="post.createdBy">{{ post.createdBy.firstName }} {{ post.createdBy.lastName }}</i>
          </div>

          <div v-if="post.updatedBy && post.updatedAt" class="mb-1 text-muted editor">
            <fa-icon :icon="faEdit" />
            {{ $luxonDateTime.fromISO(post.updatedAt.toString(), { locale: locale }).toRelativeCalendar() }}
            <i>{{ post.updatedBy.firstName }} {{ post.updatedBy.lastName }}</i>
          </div>

          <p class="card-text my-4">{{ post.description }}</p>

          <div class="my-4">
            <router-link :to="'/posts/post/' + post.id" class="text-decoration-none">
              <fa-icon :icon="faBookReader" />
              {{ t("app.base.read") }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.editor {
  display: inline-block;
  font-size: 0.8rem;
  margin-left: 1rem;
}
.creator {
  display: inline-block;
  font-size: 0.8rem;
}
</style>

<script lang="ts">
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import type { Post } from "@fumix/fu-blog-common";
import { faBookReader, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import type Permission from "../permissions.js";

export default defineComponent({
  props: {
    post: {
      type: Object as PropType<Post>,
      required: true,
    },
    userPermissions: {
      type: Array as PropType<Permission[]>,
    },
  },

  emits: ["deletePost", "changePost"],

  setup(props, emits) {
    const { t } = useI18n();
    const locale = useI18n().locale.value;

    return {
      props,
      emits,
      faBookReader,
      faTrash,
      faEdit,
      faClock,
      t,
      locale,
    };
  },

  methods: {
    goTo(path: string) {
      this.$router.push(path);
    },

    hasPermission(permission: String) {
      const perm = permission as Permission;
      return this.props.userPermissions?.includes(perm);
    },
  },
});
</script>
