<template>
  <div>
    <div class="maintitle">
      <h1>All Blogposts</h1>
      <button color="#8a2be2" @click="goTo('/posts/post/form', null)">
        <fa-icon :icon="['fas', 'add']" />
        Neuer Post
      </button>
    </div>
    <div v-for="post in posts" :key="post._id" class="preview">
      <h2 @click="$router.push('posts/post/' + post._id)">
        {{ post.title }}
      </h2>
      <div class="description">
        {{ post.description }}
      </div>
      <div class="info">
        <span>
          <fa-icon :icon="['far', 'clock']" /> Erstellt
          {{ $luxonDateTime.fromISO(post.createdAt).toRelativeCalendar() }}
          <span v-if="post.createdBy"> von </span>
          {{ post.createdBy }}
        </span>

        <span v-if="post.updatedAt !== post.createdAt">
          <fa-icon :icon="['far', 'clock']" /> Geändert
          {{ $luxonDateTime.fromISO(post.updatedAt).toRelativeCalendar() }}
          von
          {{ article.updatedBy }}
        </span>
      </div>

      <button circle color="#8a2be2" @click="confirmDelete(post)">
        <fa-icon :icon="['fas', 'trash']" />
        DELETE
      </button>

      <button circle color="#8a2be2" @click="goTo('/posts/post/form', post._id)">
        <fa-icon :icon="['fas', 'edit']" />
        edit
      </button>
    </div>
  </div>
</template>

<style>
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
$text-primary: green;
.maintitle {
  h1 {
    color: $primary-text-color
  }
}
</style>
