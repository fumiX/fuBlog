<template>
  <div class="container" v-if="post">
    <div class="jumbotron mb-4 p-3 p-md-5 rounded post-bg">
      <div class="col-md-6 px-0">
        <!-- <h1 class="display-2 font-italic">{{ post.title }}</h1> -->
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div v-if="loading" class="loader">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div class="clearfix mb-4">
              <button class="btn btn-sm btn-outline-primary" @click="$router.push('/posts')">
                <fa-icon :icon="['fas', 'arrow-left']" />
                Zurück
              </button>
              <button class="btn btn-sm btn-outline-danger float-end" @click="showConfirm(post)">
                <fa-icon :icon="['fas', 'trash']" />
                Löschen
              </button>
              <button class="btn btn-sm btn-outline-secondary float-end mx-2" @click="$router.push(`/posts/post/form/?id=${post?.id}`)">
                <fa-icon :icon="['fas', 'edit']" />
                Ändern
              </button>
            </div>
            <h1 class="mb-2 display-4 font-italic">
              {{ post.title }}
            </h1>
            <div class="mb-1 text-muted">
              <fa-icon :icon="['far', 'clock']" />
              {{ $luxonDateTime.fromISO(post.createdAt.toString()).toRelativeCalendar() }}
              <span v-if="post.createdBy"> von </span>
              <i>{{ post.createdBy }}</i>
            </div>
            <!-- <p class="card-text my-4">{{ post.description }}</p> -->

            <div v-html="post.sanitizedHtml"></div>
          </div>
        </div>
      </div>
    </div>

    <confirm-dialog :data="dialogData" :show="showDialog" @canceled="canceled()" @confirmed="confirmed()"></confirm-dialog>
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
import ConfirmDialog from "../components/ConfirmDialog.vue";
import type { ConfirmDialogData } from "./../../../interfaces/confirmdialog";

export default defineComponent({
  components: {
    ConfirmDialog,
  },
  setup() {
    return {
      loading: ref(true),
      post: ref<Post | null>(null),
      showDialog: ref<boolean>(false),
      currentPost: ref<Post | null>(null),
      dialogData: ref<ConfirmDialogData | null>(null),
    };
  },

  async mounted() {
    try {
      const route = useRoute();
      const id = route.params.id;
      const res = await fetch(`http://localhost:5000/api/posts/${id}`);
      const response = await res.json();
      this.post = response.data;
      this.loading = false;
    } catch (e) {
      console.log("ERROR: ", e);
      this.loading = false;
    }
  },

  methods: {
    async deletePost(post: Post) {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/delete/${post.id}`);
        await res.json();
        this.$router.push("/posts");
      } catch (e) {
        console.log("ERROR: ", e);
      }
    },

    showConfirm(post: Post | null) {
      this.currentPost = post as Post;
      this.dialogData = {
        title: "Post löschen",
        message: `Willst du "${this.currentPost.title}" echt löschen ?`,
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
  },
});
</script>
