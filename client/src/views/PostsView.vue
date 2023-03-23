<template>
  <div class="container">
    <div class="jumbotron rounded mb-4 p-3 p-md-5 blog-bg">
      <div class="col px-0">
        <h1 class="display-2 font-italic">{{ t("posts.blogTitle") }}</h1>
        <p class="display-6 my-1 text-dark" style="font-size: 1.75rem">
          {{ t("posts.blogShortDescription") }}
        </p>
      </div>
    </div>

    <div v-if="props.userPermissions?.canCreatePost" class="clearfix mb-4">
      <button type="button" class="btn btn-sm btn-secondary float-end" @click="goTo('/posts/post/form')">
        <fa-icon :icon="faAdd" /> {{ t("app.base.create_post") }}
      </button>
    </div>

    <div v-if="loading" class="loader">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">{{ t("app.base.loading") }}</span>
      </div>
    </div>

    <div v-else>
      <post-preview
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :userPermissions="userPermissions"
        @deletePost="showConfirm($event)"
        @changePost="changePost($event)"
      ></post-preview>

      <div v-if="!totalPages && route.query.search" class="alert alert-light text-center">
        <fa-icon :icon="faSadTear" class="mx-3" />{{ t("search.noResults", { query: route.query.search }) }}
      </div>

      <paginate
        v-if="totalPages > 1"
        :page-count="totalPages"
        :click-handler="paginate"
        :prev-text="'<'"
        :next-text="'>'"
        :container-class="'pagination justify-content-end'"
        :page-class="'page-item'"
        :page-range="5"
        :margin-pages="2"
      >
      </paginate>
    </div>

    <confirm-dialog :data="dialogData" :show="showDialog" @canceled="canceled()" @confirmed="confirmed()"></confirm-dialog>
  </div>
</template>

<style lang="scss">
.blog-bg {
  background-image: url("@client/assets/images/blog-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent, onMounted, ref, watch } from "vue";
import PostPreview from "../components/PostPreview.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import type { ConfirmDialogData, Post } from "@fumix/fu-blog-common";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";
import Paginate from "vuejs-paginate-next";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import type { UserRolePermissionsType } from "@fumix/fu-blog-common";

export default defineComponent({
  components: {
    PostPreview,
    ConfirmDialog,
    Paginate,
  },

  props: {
    userPermissions: {
      type: Object as PropType<UserRolePermissionsType>,
    },
  },

  setup(props) {
    const route = useRoute();
    const itemsPerPage = 12;
    const loading = ref(true);
    const posts = ref<Post[]>([]);
    const showDialog = ref<boolean>(false);
    const dialogData = ref<ConfirmDialogData | null>(null);
    const currentPost = ref<Post | null>(null);
    const currentPage = ref<number>(1);
    const totalPages = ref<number>(1);
    const { t } = useI18n();

    const blogTitle = ref<string>("");
    const blogShortDescription = ref<string>("");

    const loadPostsWithPagination = async (pageIndex: number, search: string, operator: string) => {
      try {
        let link = !search
          ? `/api/posts/page/${pageIndex}/count/${itemsPerPage}`
          : `/api/posts/page/${pageIndex}/count/${itemsPerPage}/search/${encodeURIComponent(search)}/operator/${encodeURIComponent(
              operator,
            )}`;
        const res = await fetch(link);
        const response = await res.json();
        posts.value = response.data[0];

        totalPages.value = Math.ceil((await response.data[1]) / itemsPerPage);
        currentPage.value = pageIndex;
        loading.value = false;
      } catch (e) {
        console.log("ERROR: ", e);
        loading.value = false;
      }
    };

    const paginate = (page: number) => {
      const searchValue = (route.query?.search || "") as string;
      const operator = (route.query?.operator || "and") as string;
      loadPostsWithPagination(page, searchValue, operator);
    };

    watch(
      () => route.query,
      (query) => {
        const searchValue = (query?.search || "") as string;
        const operator = (route.query?.operator || "and") as string;
        loadPostsWithPagination(1, searchValue, operator);
      },
    );

    onMounted(() => {
      const searchValue = (route.query?.search || "") as string;
      const operator = (route.query?.operator || "and") as string;

      blogTitle.value = "fumiX Blog";
      blogShortDescription.value = "Alle Beiträge auf einen Blick";

      loadPostsWithPagination(1, searchValue, operator);
    });

    return {
      itemsPerPage,
      loading,
      posts,
      showDialog,
      dialogData,
      currentPost,
      currentPage,
      totalPages,
      faAdd,
      faSadTear,
      paginate,
      loadPostsWithPagination,
      route,
      blogTitle,
      blogShortDescription,
      props,
      t,
    };
  },

  methods: {
    async deletePost(post: Post) {
      try {
        const res = await fetch(`/api/posts/delete/${post.id}`);
        await res.json();
        const searchValue = (this.route.query?.search || "") as string;
        const operator = (this.route.query?.operator || "and") as string;
        await this.loadPostsWithPagination(1, searchValue, operator);
      } catch (e) {
        console.log("ERROR: ", e);
      }
    },

    goTo(path: string) {
      this.$router.push(path);
    },

    showConfirm(post: Post) {
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

    changePost(post: Post) {
      this.goTo(`/posts/post/form/?id=${post.id}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
