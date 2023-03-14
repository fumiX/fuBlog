<template>
  <div class="container">
    <div class="jumbotron rounded mb-4 p-3 p-md-5 post-bg">
      <div class="col-md-6 px-0">
        <h1 v-if="isCreateMode" class="display-2 font-italic">Post erstellen</h1>
        <h1 v-if="!isCreateMode" class="display-2 font-italic">Post bearbeiten</h1>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col w-50">
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
                  ref="markdownArea"
                  style="height: 40vh; min-height: 200px"
                  aria-describedby="markdownHelp"
                  required
                ></textarea>
                <label for="markdown">Blogpost</label>
                <div id="markdownHelp" class="form-text">Markdown wird unterstützt.</div>
              </div>

              <div class="form-check">
                <input v-model="form.draft" type="checkbox" id="draft" placeholder="Entwurf" />
                <label for="draft">Entwurf</label>
              </div>

              <div class="file-upload">
                <input type="file" id="file" ref="file" v-on:change="handleFileChange($event)" accept="image/png, image/jpeg" />
              </div>

              <button type="submit" class="btn btn-sm btn-primary float-end">Speichern</button>
              <button type="button" class="btn btn-sm btn-secondary float-end mx-3" @click="$router.go(-1)">Abbrechen</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col w-50">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div v-if="loading" style="position: absolute; width: 100%; margin-top: 10vh; text-align: center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <mark-down :markdown="md" @loading="loading = $event" :style="loading ? 'opacity:0.2' : 'opacity:1'"></mark-down>
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
  // min-height: 250px;
}

.w-50 {
  width: 50%;
}
</style>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import MarkDown from "../components/MarkDown.vue";
import { debounce } from "../debounce.js";

export default defineComponent({
  components: { MarkDown },
  setup() {
    const isCreateMode = ref(false);
    const postId = ref<number | null>(null);
    const md = ref<string | null>(null);
    const loading = ref<boolean>(false);

    const form = reactive({
      title: "",
      description: "",
      markdown: "",
      draft: true,
      attachments: [],
    });

    return {
      form,
      isCreateMode,
      postId,
      md,
      loading,
      file: "",
    };
  },

  async mounted() {
    const route = useRoute();
    this.postId = route.query.id as unknown as number;
    // prefill form with values fom loaded post
    if (this.postId) {
      try {
        const res = await fetch(`/api/posts/${this.postId}`);
        const resJson = await res.json();
        this.form.title = resJson.data.title;
        this.form.description = resJson.data.description;
        this.form.markdown = resJson.data.markdown;
        this.form.draft = resJson.data.draft;
      } catch (e) {
        console.log("ERROR: ", e);
      }
    }

    this.md = debounce(() => {
      this.loading = true;
      return this.form.markdown;
    }, 1000) as unknown as string;
  },

  methods: {
    handleFileChange(e: any) {
      // Check if file is selected
      if (e.target.files && e.target.files[0]) {
        // Get uploaded file
        const tempFile = e.target.files[0],
          // Get file size
          fileSize = Math.round((tempFile.size / 1024 / 1024) * 100) / 100,
          // Get file extension
          fileExtension = tempFile.name.split(".").pop(),
          // Get file name
          fileName = tempFile.name.split(".").shift(),
          // Check if file is an image
          isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
        // Print to console
        console.log(fileSize, fileExtension, fileName, isImage);
        this.file = tempFile;
      }
      this.saveDraft(this.postId);
    },

    submitForm(e: Event) {
      e.preventDefault();
      this.send(this.postId);
    },

    insertIntoTextarea(newText: string, area: HTMLTextAreaElement): string {
      const start = area.selectionStart;
      const end = area.selectionEnd;
      const text = area.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      return before + newText + after;
    },

    async send(id: number | null) {
      let postable = new FormData();
      postable.append("body", JSON.stringify(this.form));
      postable.append("file", this.file);
      const requestOptions = {
        method: "POST",
        body: postable,
      };
      const formAction = id ? `/api/posts/${id}` : `/api/posts/new`;
      const response = await fetch(formAction, requestOptions);
      const data = await response.json();
      const post = data;
      this.$router.push(`/posts/post/${post.postId}`);
    },

    async saveDraft(id: number | null) {
      let postable = new FormData();
      postable.append("body", JSON.stringify(this.form));
      postable.append("file", this.file);
      const requestOptions = {
        method: "POST",
        body: postable,
      };
      const formAction = id ? `/api/posts/${id}` : `/api/posts/new`;
      const response = await fetch(formAction, requestOptions);
      const data = await response.json();
      this.postId = data.postId;
      const baseAttachmentUrl = "/api/attachments/attachment/";

      const insertImageMD = "![](" + baseAttachmentUrl + data.attachments[0]?.id + "/" + encodeURI(data.attachments[0].filename) + ")";
      this.form.markdown = this.insertIntoTextarea(insertImageMD, this.$refs.markdownArea as HTMLTextAreaElement);

      this.isCreateMode = false;
    },
  },
});
</script>
