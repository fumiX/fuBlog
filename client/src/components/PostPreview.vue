<template>
  <div class="row mb-2">
    <div class="col">
      <div class="card flex-md-row mb-4 box-shadow h-md-250">
        <div v-bind:class="{ 'card-body': true, draft: post.draft }">
          <div class="clearfix mb-4">
            <button v-if="props.post.permissions.canDelete" class="btn btn-sm btn-danger float-end" @click="$emit('deletePost', post)">
              <fa-icon :icon="faTrash" />
              {{ t("app.base.delete") }}
            </button>
            <button
              v-if="props.post.permissions.canEdit"
              class="btn btn-sm btn-secondary float-end mx-2"
              @click="$emit('changePost', post)"
            >
              <fa-icon :icon="faEdit" />
              {{ t("app.base.edit") }}
            </button>
          </div>
          <!-- <strong class="d-inline-block mb-2 text-primary">Kategorie</strong> -->
          <h3 class="mb-0 display-4 clickable postTitle" @click="goTo('/posts/post/' + post.id)">
            {{ post.title }}
          </h3>

          <p class="card-text my-4">{{ post.description }}</p>

          <div v-if="post.created" class="mb-1 text-muted creator">
            <fa-icon :icon="faClock" />
            {{ $luxonDateTime.fromISO(post.created.at.toString(), { locale: locale }).toRelativeCalendar() }}
            <i v-if="post.created.by">{{ post.created.by }}</i>
          </div>

          <div v-if="post.updated" class="mb-1 text-muted editor">
            <fa-icon :icon="faEdit" />
            {{ $luxonDateTime.fromISO(post.updated.at.toString(), { locale: locale }).toRelativeCalendar() }}
            <i v-if="post.updated.by">{{ post.updated.by }}</i>
          </div>

          <display-tags v-if="post.tags" :tags="post.tags"></display-tags>

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

.postTitle {
  font-size: 2.5rem;
}
</style>

<script setup lang="ts">
import DisplayTags from "@client/components/DisplayTags.vue";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faBookReader, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Post, PublicPost, UserRolePermissionsType } from "@fumix/fu-blog-common";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n();
const locale = useI18n().locale.value;

const props = defineProps({
  post: {
    type: Object as PropType<PublicPost>,
    required: true,
  },
  userPermissions: {
    type: Object as PropType<UserRolePermissionsType>,
  },
});

const emits = defineEmits(["deletePost", "changePost"]);

const goTo = (path: string) => {
  router.push(path);
};
</script>
