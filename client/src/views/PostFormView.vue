<template>
  <div class="container">
    <div class="row mb-2">
      <div class="col w-50">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <form @submit="submitForm($event)">
              <div class="form-floating mb-3">
                <input v-model="form.title" type="text" class="form-control" id="title" placeholder="Titel" required />
                <label for="title">{{ t("posts.form.title") }}</label>
              </div>

              <div class="form-floating mb-3">
                <input v-model="form.description" type="text" class="form-control" id="description" placeholder="Beschreibung" />
                <label for="description">{{ t("posts.form.description") }}</label>
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
                <label for="markdown">{{ t("posts.form.message.label") }}</label>
                <div id="markdownHelp" class="form-text">{{ t("posts.form.message.hint") }}</div>
              </div>

              <!-- <div class="form-control file-upload">
                <input type="file" id="file" ref="file" v-on:change="handleFileChange($event)" accept="image/png, image/jpeg" />
              </div> -->
              <div class="mb-3">
                <label for="formFile" class="form-label">{{ t("posts.form.imageupload") }}</label>
                <input
                  class="form-control"
                  type="file"
                  id="file"
                  ref="file"
                  v-on:change="handleFileChange($event)"
                  accept="image/png, image/jpeg"
                />
              </div>

              <div class="form-floating mb-3">
                <label for="tags">{{ t("posts.form.tags") }}</label>
                <vue3-tags-input :tags="form.tags" placeholder="Geben Sie Schlagwörter ein..." @on-tags-changed="handleTagsChanged" />
              </div>

              <div class="form-check form-switch">
                <input v-model="form.draft" class="form-check-input" type="checkbox" id="draft" />
                <label class="form-check-label" for="draft">{{ t("posts.form.draft") }}</label>
              </div>

              <button type="submit" class="btn btn-sm btn-primary float-end">{{ t("app.base.save") }}</button>
              <button type="button" class="btn btn-sm btn-secondary float-end mx-3" @click="$router.go(-1)">
                {{ t("app.base.cancel") }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col w-50">
        <h2 class="display-6">{{ t("posts.form.preview.title") }}</h2>
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div v-if="loading" style="position: absolute; width: 100%; margin-top: 10vh; text-align: center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ t("app.base.loading") }}</span>
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
  background-image: url("@client/assets/images/post-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.w-50 {
  width: 50%;
}
</style>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import MarkDown from "@client/components/MarkDown.vue";
import { debounce } from "@client/debounce.js";
import Vue3TagsInput from "vue3-tags-input";

export default defineComponent({
  components: { MarkDown, Vue3TagsInput },
  setup() {
    const { t } = useI18n();
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
      tags: [],
    });

    return {
      form,
      isCreateMode,
      postId,
      md,
      loading,
      file: "",
      t,
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
          fileExtension = tempFile.name.split(".").pop(),
          fileName = tempFile.name.split(".").shift(),
          isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
        this.file = tempFile;
      }
      this.saveDraft(this.postId);
    },

    handleTagsChanged(tags: any) {
      this.form.tags = tags;
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
