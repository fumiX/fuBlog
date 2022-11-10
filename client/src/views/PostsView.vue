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

    <div class="row mb-2" v-for="post in posts" :key="post._id">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <!-- <strong class="d-inline-block mb-2 text-primary">Kategorie</strong> -->
            <h3 class="mb-0">
              <router-link :to="'posts/post/' + post._id" class="text-dark">{{ post.title }}</router-link>
            </h3>
            <div class="mb-1 text-muted">
              <fa-icon :icon="['far', 'clock']" />
              {{ $luxonDateTime.fromISO(post.createdAt).toRelativeCalendar() }}
              <span v-if="post.createdBy"> von </span>
              <i>{{ post.createdBy }}</i>
            </div>
            <p class="card-text my-4">{{ post.description }}</p>

            <div class="clearfix">
              <button class="btn btn-sm btn-outline-primary" @click="$router.push('posts/post/' + post._id)">
                <fa-icon :icon="['fas', 'book-reader']" />
                Lesen
              </button>
              <button class="btn btn-sm btn-outline-secondary float-end" @click="confirmDelete(post)">
                <fa-icon :icon="['fas', 'trash']" />
                Löschen
              </button>
              <button class="btn btn-sm btn-outline-secondary float-end mx-2" @click="confirmDelete(post)">
                <fa-icon :icon="['fas', 'edit']" />
                Ändern
              </button>
            </div>
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
import type { Post } from "./../../../interfaces/post";

export default defineComponent({
  components: {},
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
