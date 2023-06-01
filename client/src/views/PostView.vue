<template>
  <div class="container" v-if="post">
    <div v-if="loading" class="loader text-secondary">
      <loading-spinner />
    </div>

    <div v-else class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div class="clearfix mb-4">
              <button class="btn btn-sm btn-outline-primary" @click="router.push('/posts')">
                <fa-icon :icon="faArrowLeft" />
                {{ t("app.base.back") }}
              </button>
              <button v-if="props.userPermissions?.canDeletePost" class="btn btn-sm btn-danger float-end" @click="showConfirm(post)">
                <fa-icon :icon="faTrash" />
                {{ t("app.base.delete") }}
              </button>
              <button
                v-if="props.userPermissions?.canEditPost"
                class="btn btn-sm btn-secondary float-end mx-2"
                @click="router.push(`/posts/post/${post?.id}/edit`)"
              >
                <fa-icon :icon="faEdit" />
                {{ t("app.base.edit") }}
              </button>
            </div>
            <h1 class="mb-0 display-4">
              {{ post.title }}
            </h1>

            <p class="card-text my-4 fst-italic text-muted">{{ post.description }}</p>

            <div v-if="post.createdAt" class="mb-1 text-muted creator">
              <fa-icon :icon="faClock" />
              {{ $luxonDateTime.fromISO(post.createdAt.toString(), { locale: "de-DE" }).toRelativeCalendar() }}
              <span v-if="post.createdBy"> von </span>
              <i v-if="post.createdBy">{{ post.createdBy.fullName }}</i>
            </div>

            <div v-if="post.updatedBy && post.updatedAt" class="mb-1 text-muted editor">
              <fa-icon :icon="faEdit" />
              {{ $luxonDateTime.fromISO(post.updatedAt.toString()).toRelativeCalendar() }}
              <span> von </span>
              <i>{{ post.updatedBy.fullName }}</i>
            </div>

            <display-tags v-if="post.tags" :tags="post.tags"></display-tags>

            <div v-html="post.sanitizedHtml" class="mt-4"></div>
          </div>
        </div>
      </div>
    </div>

    <confirm-dialog :data="dialogData" :show="showDialog" @canceled="canceled()" @confirmed="confirmed()"></confirm-dialog>
  </div>
  <post-not-available v-else></post-not-available>
</template>

<style lang="scss">
.post-bg {
  background-image: url("@client/assets/images/post-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  min-height: 250px;
}

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

<script setup lang="ts">
import ConfirmDialog from "@client/components/ConfirmDialog.vue";
import DisplayTags from "@client/components/DisplayTags.vue";
import LoadingSpinner from "@client/components/LoadingSpinner.vue";
import PostNotAvailable from "@client/components/PostNotAvailable.vue";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { ConfirmDialogData, Post, UserRolePermissionsType } from "@fumix/fu-blog-common";
import { useSeoMeta } from "@unhead/vue";
import { onMounted, type PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { PostEndpoints } from "@client/util/api-client";

const { t } = useI18n();
const loading = ref(true);
const post = ref<Post | null>(null);
const showDialog = ref<boolean>(false);
const currentPost = ref<Post | null>(null);
const dialogData = ref<ConfirmDialogData | null>(null);
const router = useRouter();

const props = defineProps({
  userPermissions: {
    type: Object as PropType<UserRolePermissionsType>,
  },
});

onMounted(async () => {
  try {
    const route = useRoute();
    const id = route.params.id;
    useSeoMeta({
      ogImage: `${window.location.protocol}//${window.location.hostname}/api/posts/${route.params.id}/og-image`,
      ogImageAlt: "Ein anschauliches Bild für den Blogpost",
      ogImageWidth: 1280,
      ogImageHeight: 640,
      ogSiteName: "fuBlog",
      ogType: "article",
      ogUrl: `${window.location.protocol}//${window.location.hostname}/posts/post/${route.params.id}`,
    });
    const res = await fetch(`/api/posts/${id}`);
    const response = await res.json();
    post.value = response.data;
    loading.value = false;
  } catch (e) {
    console.log("ERROR: ", e);
    loading.value = false;
  }
});

const deletePost = async (post: Post) => {
  if (post.id) {
    const res = await PostEndpoints.deletePost(post.id)
      .catch((reason) => console.log("failed to delete autosave", reason));
  }
  router.push("/posts");
};

const showConfirm = (post: Post | null) => {
  currentPost.value = post as Post;
  dialogData.value = {
    title: t("posts.confirm.title"),
    message: t("posts.confirm.message", { post: currentPost.value.title }),
  };
  showDialog.value = true;
};

const canceled = () => {
  showDialog.value = false;
};

const confirmed = () => {
  deletePost(currentPost.value as Post);
  currentPost.value = null;
  showDialog.value = false;
};
</script>
