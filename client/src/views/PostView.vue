<template>
  <div class="container" v-if="post">
    <div v-if="loading" class="loader">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">{{ t("app.base.loading") }}</span>
      </div>
    </div>

    <div v-else class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div class="clearfix mb-4">
              <button class="btn btn-sm btn-outline-primary" @click="$router.push('/posts')">
                <fa-icon :icon="faArrowLeft" />
                {{ t("app.base.back") }}
              </button>
              <button v-if="hasPermission('delete')" class="btn btn-sm btn-danger float-end" @click="showConfirm(post)">
                <fa-icon :icon="faTrash" />
                {{ t("app.base.delete") }}
              </button>
              <button
                v-if="hasPermission('write')"
                class="btn btn-sm btn-secondary float-end mx-2"
                @click="$router.push(`/posts/post/form/?id=${post?.id}`)"
              >
                <fa-icon :icon="faEdit" />
                {{ t("app.base.edit") }}
              </button>
            </div>
            <h1 class="mb-0 display-4 font-italic">
              {{ post.title }}
            </h1>

            <div class="mb-1 text-muted creator">
              <fa-icon :icon="faClock" />
              {{ $luxonDateTime.fromISO(post.createdAt.toString(), { locale: "de-DE" }).toRelativeCalendar() }}
              <span v-if="post.createdBy"> von </span>
              <i v-if="post.createdBy">{{ post.createdBy.firstName }} {{ post.createdBy.lastName }}</i>
            </div>

            <div v-if="post.updatedBy && post.updatedAt" class="mb-1 text-muted editor">
              <fa-icon :icon="faEdit" />
              {{ $luxonDateTime.fromISO(post.updatedAt.toString()).toRelativeCalendar() }}
              <span> von </span>
              <i>{{ post.updatedBy.firstName }} {{ post.updatedBy.lastName }}</i>
            </div>

            <div v-html="post.sanitizedHtml" class="mt-4"></div>
          </div>
        </div>
      </div>
    </div>

    <confirm-dialog :data="dialogData" :show="showDialog" @canceled="canceled()" @confirmed="confirmed()"></confirm-dialog>
  </div>
</template>

<style lang="scss">
.post-bg {
  background-image: url("@/assets/images/post-bg.jpg");
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

<script lang="ts">
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import type { ConfirmDialogData, Post } from "@fumix/fu-blog-common";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import type Permission from "../permissions.js";

export default defineComponent({
  components: {
    ConfirmDialog,
  },

  props: {
    userPermissions: {
      type: Array as PropType<Permission[]>,
    },
  },

  setup(props) {
    const { t } = useI18n();
    return {
      loading: ref(true),
      post: ref<Post | null>(null),
      showDialog: ref<boolean>(false),
      currentPost: ref<Post | null>(null),
      dialogData: ref<ConfirmDialogData | null>(null),
      faArrowLeft,
      faTrash,
      faEdit,
      faClock,
      props,
      t,
    };
  },

  async mounted() {
    try {
      const route = useRoute();
      const id = route.params.id;
      const res = await fetch(`/api/posts/${id}`);
      const response = await res.json();
      this.post = response.data;
      this.loading = false;
    } catch (e) {
      console.log("ERROR: ", e);
      this.loading = false;
    }
  },

  methods: {
    async deletePost(post: Post) {
      try {
        const res = await fetch(`/api/posts/delete/${post.id}`);
        await res.json();
        this.$router.push("/posts");
      } catch (e) {
        console.log("ERROR: ", e);
      }
    },

    hasPermission(permission: String) {
      const perm = permission as Permission;
      return this.props.userPermissions?.includes(perm);
    },

    showConfirm(post: Post | null) {
      this.currentPost = post as Post;
      this.dialogData = {
        title: this.t("posts.confirm.title"),
        message: this.t("posts.confirm.message", { post: this.currentPost.title }),
      };
      this.showDialog = true;
    },

    canceled() {
      this.showDialog = false;
    },

    confirmed() {
      this.deletePost(this.currentPost as Post);
      this.currentPost = null;
      this.showDialog = false;
    },
  },
});
</script>
