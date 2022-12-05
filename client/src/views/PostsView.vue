<template>
  <div class="container">
    <div class="jumbotron mb-4 p-3 p-md-5 blog-bg">
      <div class="col-md-6 px-0">
        <h1 class="display-2 font-italic">Blogposts</h1>
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div class="clearfix mb-4">
      <button type="button" class="btn btn-sm btn-outline-secondary float-end" @click="goTo('/posts/post/form')"><fa-icon :icon="faAdd" /> Post erstellen</button>
    </div>

    <div v-if="loading" class="loader">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <post-preview v-for="post in posts" :key="post.id" :post="post" @deletePost="showConfirm($event)" @changePost="changePost($event)"></post-preview>
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

export default defineComponent({
  components: {
    PostPreview,
    ConfirmDialog,
  },
  setup() {
    return {
      loading: ref(true),
      posts: ref<Post[]>([]),
      showDialog: ref<boolean>(false),
      dialogData: ref<ConfirmDialogData | null>(null),
      currentPost: ref<Post | null>(null),
      faAdd,
    };
  },

  mounted() {
    this.loadPosts();
  },

  methods: {
    async loadPosts() {
      try {
        const res = await fetch("http://localhost:5000/api/posts");
        const response = await res.json();
        this.posts = response.data;
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
        this.loadPosts();
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
