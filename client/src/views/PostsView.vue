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

    <div class="row">
      <!-- LEFT -->
      <div class="col-lg-8 col-lg-border">
        <div v-if="props.userPermissions?.canCreatePost" class="clearfix mb-4">
          <button type="button" class="btn btn-sm btn-secondary float-end" @click="goTo('/posts/post/new')">
            <fa-icon :icon="faAdd" /> {{ t("app.base.create_post") }}
          </button>
        </div>

        <div v-if="loading" class="loader text-secondary">
          <loading-spinner />
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
            :click-handler="onPaginate"
            :prev-text="'<'"
            :next-text="'>'"
            :container-class="'pagination justify-content-end'"
            :page-class="'page-item'"
            :page-range="5"
            :margin-pages="2"
          >
          </paginate>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-4">
        <word-cloud @wordclicked="searchWord($event)"></word-cloud>
      </div>
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

<script setup lang="ts">
import ConfirmDialog from "@client/components/ConfirmDialog.vue";
import LoadingSpinner from "@client/components/LoadingSpinner.vue";
import PostPreview from "@client/components/PostPreview.vue";
import WordCloud from "@client/components/WordCloud.vue";
import { PostEndpoints } from "@client/util/api-client";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import type { ConfirmDialogData, PublicPost, UserRolePermissionsType } from "@fumix/fu-blog-common";
import { asSearchOperator } from "@fumix/fu-blog-common";
import type { PropType } from "vue";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import Paginate from "vuejs-paginate-next";

const route = useRoute();
const router = useRouter();
const itemsPerPage = 12;
const loading = ref(true);
const posts = ref<PublicPost[]>([]);
const showDialog = ref<boolean>(false);
const dialogData = ref<ConfirmDialogData | null>(null);
const currentPost = ref<PublicPost | null>(null);
const totalPages = ref<number>(1);
const { t } = useI18n();

const blogTitle = ref<string>("");
const blogShortDescription = ref<string>("");

const props = defineProps({
  userPermissions: {
    type: Object as PropType<UserRolePermissionsType>,
    required: true,
  },
});

const loadPostsWithPagination = async (pageIndex: number, search: string, operator: "and" | "or") => {
  try {
    const [postResult, count] = await PostEndpoints.findPosts(pageIndex, 12, search, operator).then((it) => it.data);
    posts.value = postResult;
    totalPages.value = Math.ceil((count ?? 0) / itemsPerPage);
    loading.value = false;
  } catch (e) {
    console.log("ERROR: ", e);
    loading.value = false;
  }
};

const onPaginate = (page: number) => {
  const searchValue = (route.query?.search || "") as string;
  const operator = asSearchOperator(route.query?.operator?.toString());
  loadPostsWithPagination(page, searchValue, operator);
};

watch(
  () => route.query,
  (query) => {
    const searchValue = (query?.search ?? "") as string;
    const operator = asSearchOperator(route.query?.operator?.toString());
    loadPostsWithPagination(1, searchValue, operator);
  },
);

onMounted(() => {
  const searchValue = (route.query?.search || "") as string;
  const operator = asSearchOperator(route.query?.operator?.toString());

  blogTitle.value = "fumiX Blog";
  blogShortDescription.value = "Alle Beiträge auf einen Blick";

  loadPostsWithPagination(1, searchValue, operator);
});

const deletePost = async (post: PublicPost) => {
  try {
    const res = await fetch(`/api/posts/delete/${post.id}`);
    await res.json();
    const searchValue = (route.query?.search || "") as string;
    const operator = asSearchOperator(route.query?.operator?.toString());
    await loadPostsWithPagination(1, searchValue, operator);
  } catch (e) {
    console.log("ERROR: ", e);
  }
};

const goTo = (path: string) => {
  router.push(path);
};

const searchWord = (event: any) => {
  goTo(`/posts/?search=${event[0]}&operator=and`);
};

const showConfirm = (post: PublicPost) => {
  currentPost.value = post as PublicPost;
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
  deletePost(currentPost.value as PublicPost);
  currentPost.value = null;
  showDialog.value = false;
};

const changePost = (post: PublicPost) => {
  goTo(`/posts/post/${post.id}/edit`);
};
</script>
