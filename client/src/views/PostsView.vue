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
      <paginate
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
import { defineComponent, ref } from "vue";
import PostPreview from "../components/PostPreview.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import type { Post } from "./../../../server/src/entity/Post";
import type { ConfirmDialogData } from "./../../../interfaces/confirmdialog";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import Paginate from "vuejs-paginate-next";

export default defineComponent({
  components: {
    PostPreview,
    ConfirmDialog,
    Paginate,
  },
  setup() {
    return {
      itemsPerPage: 5,
      loading: ref(true),
      posts: ref<Post[]>([]),
      showDialog: ref<boolean>(false),
      dialogData: ref<ConfirmDialogData | null>(null),
      currentPost: ref<Post | null>(null),
      currentPage: ref<number>(1),
      totalPages: ref<number>(1),
      faAdd,
    };
  },

  mounted() {
    this.loadPosts();
  },

  methods: {
    async loadPosts() {
      await this.loadPostsWithPagination(1);
    },

    async loadPostsWithPagination(pageIndex: number) {
      try {
        let link = `http://localhost:5000/api/posts/page/` + pageIndex + `/count/` + this.itemsPerPage;
        const res = await fetch(link);
        const response = await res.json();
        this.posts = response.data[0];
        this.totalPages = Math.ceil((await response.data[1]) / this.itemsPerPage);
        this.currentPage = pageIndex;
        this.loading = false;
      } catch (e) {
        console.log("ERROR: ", e);
        this.loading = false;
      }
    },

    async deletePost(post: Post) {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/delete/${post.id}`);
        await res.json();
        await this.loadPosts();
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

    paginate(page: number) {
      this.loadPostsWithPagination(page);
    },
  },
});
</script>

<style lang="scss" scoped></style>
