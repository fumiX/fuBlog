<template>
  <div class="container">
    <div class="jumbotron rounded mb-4 p-3 p-md-5 blog-bg">
      <div class="col-md-6 px-0">
        <h1 class="display-2 font-italic">Blogposts</h1>
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div class="clearfix mb-4">
      <button type="button" class="btn btn-sm btn-secondary float-end" @click="goTo('/posts/post/form')"><fa-icon :icon="faAdd" /> Post erstellen</button>
    </div>

    <div v-if="loading" class="loader">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <post-preview v-for="post in posts" :key="post.id" :post="post" @deletePost="showConfirm($event)" @changePost="changePost($event)"></post-preview>

      <div v-if="!totalPages && route.query.search" class="alert alert-light text-center">
        <fa-icon :icon="faSadTear" class="mx-3" />Keine Posts zu "{{ route.query.search }}" gefunden.
      </div>

      <paginate
        v-if="totalPages > 0"
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
  background-image: url("@/assets/images/blog-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import PostPreview from "../components/PostPreview.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import type { Post } from "./../../../server/src/entity/Post";
import type { ConfirmDialogData } from "@fumix/fu-blog-common/src/confirmdialog";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";
import Paginate from "vuejs-paginate-next";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    PostPreview,
    ConfirmDialog,
    Paginate,
  },
  setup() {
    const route = useRoute();
    const itemsPerPage = 5;
    const loading = ref(true);
    const posts = ref<Post[]>([]);
    const showDialog = ref<boolean>(false);
    const dialogData = ref<ConfirmDialogData | null>(null);
    const currentPost = ref<Post | null>(null);
    const currentPage = ref<number>(1);
    const totalPages = ref<number>(1);
    const url = import.meta.env.VITE_API_URL; // cant access this.$apiUrl here in setup dont know why ?!?!

    const loadPostsWithPagination = async (pageIndex: number, search: string, operator: string) => {
      try {
        let link = !search ? `${url}/posts/page/${pageIndex}/count/${itemsPerPage}` : `${url}/posts/page/${pageIndex}/count/${itemsPerPage}/search/${search}/operator/${operator}`;
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
      url,
    };
  },

  async mounted() {
    this.url = this.$apiUrl;
  },

  methods: {
    async deletePost(post: Post) {
      try {
        const res = await fetch(`${this.$apiUrl}/posts/delete/${post.id}`);
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
        title: "Post löschen",
        message: `Wilst du "${this.currentPost.title}" echt löschen ?`,
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
