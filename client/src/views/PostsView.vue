<template>
  <div class="container">
    <div class="jumbotron mb-4 p-3 p-md-5 rounded blog-bg">
      <div class="col-md-6 px-0">
        <h1 class="display-2 font-italic">Blogposts</h1>
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div class="clearfix mb-4">
      <a class="btn btn-outline-secondary float-end" href="#" @click="goTo('/posts/post/form', null)"> <fa-icon :icon="['fas', 'add']" /> Post erstellen</a>
    </div>

    <post-preview v-for="post in posts" :key="post._id" :post="post" @deletePost="confirmDelete($event)" @changePost="changePost($event)"></post-preview>
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
import type { Post } from "./../../../interfaces/post";

export default defineComponent({
  components: { PostPreview },
  setup() {
    return {
      posts: ref<Post[]>([]),
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
      } catch (e) {
        console.log("ERROR: ", e);
      }
    },

    async deletePost(post: Post) {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/delete/${post._id}`);
        await res.json();
        this.loadArticles();
      } catch (e) {
        console.log("ERROR: ", e);
      }
    },

    goTo(path: string, id?: string) {
      alert("TODO: implement these routes " + id);
    },

    confirmDelete(post: Post) {
      alert("TODO implement confirm dialog for " + post.title);
    },

    changePost(post: Post) {
      alert("TODO implement change for " + post.title);
    },
  },
});
</script>

<style lang="scss" scoped>
.maintitle {
  h1 {
    color: $primary-text-color;
  }
}
</style>
