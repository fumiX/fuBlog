<template>
  <div class="container">
    <div class="jumbotron mb-4 p-3 p-md-5 rounded post-bg">
      <div class="col-md-6 px-0">
        <h1 v-if="isCreateMode" class="display-2 font-italic">Post erstellen</h1>
        <h1 v-if="!isCreateMode" class="display-2 font-italic">Post bearbeiten</h1>
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <form @submit="submitForm($event)">
              <div class="form-floating mb-3">
                <input v-model="form.title" type="text" class="form-control" id="title" placeholder="Titel" required />
                <label for="title">Titel</label>
              </div>

              <div class="form-floating mb-3">
                <input v-model="form.description" type="text" class="form-control" id="description" placeholder="Beschreibung" />
                <label for="description">Kurzbeschreibung</label>
              </div>

              <div class="form-floating mb-3">
                <textarea
                  v-model="form.markdown"
                  class="form-control"
                  placeholder="Blogpost"
                  id="markdown"
                  style="height: 40vh; min-height: 200px"
                  aria-describedby="markdownHelp"
                  required
                ></textarea>
                <label for="markdown">Blogpost</label>
                <div id="markdownHelp" class="form-text">Markdown wird unterstützt.</div>
              </div>

              <button type="submit" class="btn btn-primary float-end">Speichern</button>
              <button type="button" class="btn btn-secondary float-end mx-3" @click="$router.go(-1)">Abbrechen</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <mark-down :markdown="md"></mark-down>
          </div>
        </div>
      </div>
    </div>
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
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import MarkDown from "../components/MarkDown.vue";
import { debounce } from "./../debounce";

export default defineComponent({
  components: { MarkDown },
  setup() {
    const isCreateMode = ref(false);
    const postId = ref<number | null>(null);
    const md = ref<string | null>(null);

    const form = reactive({
      title: "",
      description: "",
      markdown: "",
    });

    return {
      form,
      isCreateMode,
      postId,
      md,
    };
  },

  async mounted() {
    const route = useRoute();
    this.postId = route.query.id as unknown as number;
    // prefill form with values fom loaded post
    if (this.postId) {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/${this.postId}`);
        const resJson = await res.json();
        this.form.title = resJson.data.title;
        this.form.description = resJson.data.description;
        this.form.markdown = resJson.data.markdown;
      } catch (e) {
        console.log("ERROR: ", e);
      }
    }

    this.md = debounce(() => this.form.markdown, 1000) as unknown as string;
  },

  methods: {
    submitForm(e: Event) {
      e.preventDefault();
      this.send(this.postId);
    },

    async send(id: number | null) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.form),
      };
      const formAction = id ? `http://localhost:5000/api/posts/${id}` : "http://localhost:5000/api/posts/new";
      const response = await fetch(formAction, requestOptions);
      const data = await response.json();
      const post = data;
      this.$router.push(`/posts/post/${post.id}`);
    },
  },
});
</script>
