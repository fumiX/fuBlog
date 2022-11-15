<template>
  <div class="container">
    <div class="jumbotron mb-4 p-3 p-md-5 rounded post-bg">
      <div class="col-md-6 px-0">
        <h1 class="display-2 font-italic">Post erstellen</h1>
        <!-- <p class="lead my-3">Liste aller Blogposts.</p> -->
        <!-- <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p> -->
      </div>
    </div>

    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <form @submit="submitForm">
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
                  style="height: 200px"
                  aria-describedby="markdownHelp"
                  required
                ></textarea>
                <label for="markdown">Blogpost</label>
                <div id="markdownHelp" class="form-text">Markdown wird unterstützt.</div>
              </div>

              <button type="submit" class="btn btn-primary float-end">Speichern</button>
            </form>
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
import { defineComponent, reactive } from "vue";

export default defineComponent({
  setup() {
    const form = reactive({
      title: "",
      description: "",
      markdown: "",
    });

    return {
      form,
    };
  },

  methods: {
    submitForm(e: FormDataEvent) {
      e.preventDefault();
      this.send();
    },

    async send() {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.form),
      };
      const formAction = "http://localhost:5000/api/posts/new";
      const response = await fetch(formAction, requestOptions);
      const data = await response.json();
      const post = data;
      this.$router.push(`/posts/post/${post.id}`);
    },
  },
});
</script>
