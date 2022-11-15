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
      <button type="button" class="btn btn-outline-secondary float-end" @click="goTo('/posts/post/form')"><fa-icon :icon="['fas', 'add']" /> Post erstellen</button>
    </div>

    <post-preview v-for="post in posts" :key="post.id" :post="post" @deletePost="confirmDelete($event)" @changePost="changePost($event)"></post-preview>

    <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Post löschen</h5>
          </div>
          <div class="modal-body" v-if="currentPost">
            Wollen sie <b>{{ currentPost.title }}</b> wirklich löschen ?
          </div>
          <div class="modal-footer" v-if="currentPost">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="deletePost(currentPost)">Löschen</button>
          </div>
        </div>
      </div>
    </div>
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
import type { Post } from "./../../../server/src/entity/Post";
import { Modal } from "bootstrap";

export default defineComponent({
  components: { PostPreview },
  setup() {
    return {
      posts: ref<Post[]>([]),
      currentPost: ref<Post>(null),
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

    confirmDelete(post: Post) {
      // alert("TODO implement confirm dialog for " + post.title);
      console.log("DELETE POST", post);
      this.currentPost = post;
      const myModal = new Modal(document.getElementById("deleteModal"), {});
      myModal.show();
      // this.deletePost(post);
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
