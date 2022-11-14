<template>
  <div class="container" v-if="post">
    <div class="jumbotron mb-4 p-3 p-md-5 rounded post-bg">
      <div class="col-md-6 px-0">
        <!-- <h1 class="display-2 font-italic">{{ post.title }}</h1> -->
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <h1 class="mb-2 display-4 font-italic">
              {{ post.title }}
            </h1>
            <div class="mb-1 text-muted">
              <fa-icon :icon="['far', 'clock']" />
              {{ $luxonDateTime.fromISO(post.createdAt).toRelativeCalendar() }}
              <span v-if="post.createdBy"> von </span>
              <i>{{ post.createdBy }}</i>
            </div>
            <!-- <p class="card-text my-4">{{ post.description }}</p> -->

            <div v-html="post.sanitizedHtml"></div>

            <div class="clearfix">
              <button class="btn btn-sm btn-outline-primary" @click="$router.push('/posts')">
                <fa-icon :icon="['fas', 'arrow-left']" />
                Zurück
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

    <!-- <div class="row justify-content-md-center">
      <div class="col col-lg-2"></div>
      <div class="col-md-auto">
        <div>
          <div class="maintitle">
            <h1>Post</h1>
          </div>
          <div v-if="post">
            <h2>
              {{ post.title }}
            </h2>
            <div class="description">
              {{ post.description }}
            </div>
            <div v-html="post.sanitizedHtml"></div>
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

            <button circle @click="confirmDelete(post)">
              <fa-icon :icon="['fas', 'trash']" />
              DELETE
            </button>

            <button circle @click="goTo('/posts/post/form', post._id)">
              <fa-icon :icon="['fas', 'edit']" />
              edit
            </button>
          </div>
        </div>
      </div>
      <div class="col col-lg-2"></div>
    </div> -->
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
</style>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import type { Post } from "./../../../server/src/entity/Post";

export default defineComponent({
  components: {},
  setup() {
    return {
      post: ref<Post>(null),
    };
  },

  async mounted() {
    try {
      const route = useRoute();
      const id = route.params.id;
      const res = await fetch(`http://localhost:5000/api/posts/${id}`);
      const response = await res.json();
      this.post = response.data;
    } catch (e) {
      console.log("ERROR: ", e);
    }
  },

  methods: {},
});
</script>
