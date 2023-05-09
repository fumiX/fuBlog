<template>
  <div v-if="!postHasError" class="container">
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
                <div contenteditable="true" style="overflow-y: scroll; height: 6rem" class="form-control">
                  {{ form.description }}
                </div>
                <label for="description">{{ t("posts.form.description") }}</label>
              </div>

              <div class="form-floating mb-3">
                <label for="stringTags">{{ t("posts.form.tags.tags") }}</label>
                <!-- <vue3-tags-input
                  :tags="form.stringTags"
                  :placeholder="t('posts.form.tags.enter')"
                  @on-tags-changed="handleTagsChanged"
                  :add-tag-on-keys="[13, 188]"
                  @input="handleAutocompletion"
                /> -->

                <vue-tags-input
                  :tags="form.stringTags"
                  :autocomplete-items="tagList"
                  :placeholder="t('posts.form.tags.enter')"
                  @tags-changed="handleTagsChanged"
                  @input="handleAutocompletion"
                />

                <!-- <auto-complete :list="tagList" @selectItem="selectItem($event)" /> -->
              </div>

              <div class="mb-3">
                <ai-summaries :full-text="form.markdown" :onSetDescription="setDescription" :onAddTag="addTag"></ai-summaries>
              </div>

              <div class="form-floating mb-3">
                <textarea
                  v-model="form.markdown"
                  class="form-control"
                  placeholder="Blogpost"
                  ref="markdownArea"
                  style="height: 40vh; min-height: 200px"
                  aria-describedby="markdownHelp"
                  v-on:drop="dropMarkdown($event)"
                  required
                ></textarea>
                <label for="markdown">{{ t("posts.form.message.label") }}</label>
                <div id="markdownHelp" class="form-text">{{ t("posts.form.message.hint") }}</div>
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
        <h2 class="display-6">{{ (form?.title?.length ?? 0) > 0 ? form?.title : t("posts.form.preview.title") }}</h2>
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body" style="max-width: 100%">
            <div v-if="loading" style="position: absolute; width: 100%; margin-top: 10vh; text-align: center" class="text-primary">
              <loading-spinner />
            </div>
            <mark-down
              :markdown="md"
              v-bind:custom-image-urls="files"
              @loading="loading = $event"
              :style="loading ? 'opacity:0.2' : 'opacity:1'"
            ></mark-down>
          </div>
        </div>
      </div>
    </div>
    <div class="card mb-4 box-shadow h-md-250">
      <div class="card-body">
        <h3>
          {{ tc("posts.form.imageupload", Object.keys(files).length) }}
          <small class="text-body-secondary f-4" v-if="Object.keys(files).length > 0"
            >({{ convertToHumanReadableFileSize(totalBytesInFiles) }})</small
          >
        </h3>
        <!-- Hidden file input, used to open the file dialog, when the dropzone is clicked -->
        <input
          style="display: none"
          type="file"
          id="file"
          multiple
          v-on:change="handleFileChange($event)"
          accept=".png, .gif, .jpg, .jpeg, image/png, image/jpeg, image/gif"
        />
        <div
          id="dropzone"
          v-on:click="openFileDialog()"
          v-on:drop="handleFileChange($event)"
          v-on:dragover="highlightDropzone($event, true)"
          v-on:dragleave="highlightDropzone($event, false)"
          :class="{ active: dropzoneHighlight }"
        >
          <div class="plus"><fa-icon :icon="faUpload"></fa-icon></div>
          <span class="label" v-if="dropzoneHighlight">Dateien fallen lassen</span>
          <span class="label" v-else>Neue Dateien hierher ziehen oder hier klicken um Dateien auszuwählen</span>
        </div>
        <Suspense v-for="hash in Object.keys(files)" v-bind:key="hash">
          <ImagePreview :value="files[hash]" :hash="hash" @paste="pasteImageFileToMarkdown" @delete="delete files[hash]"> </ImagePreview>
        </Suspense>
      </div>
    </div>
  </div>
  <post-not-available v-else></post-not-available>
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

.v3ti-tag {
  background: $badge-background-color !important;
  color: $badge-text-color !important;
}

#dropzone {
  color: #555;
  cursor: pointer;
  vertical-align: top;
  display: inline-block;
  width: 12rem;
  min-height: 15rem;
  padding: 1rem 0.25rem;
  margin: 0.25rem;
  text-align: center;
  border: 2px solid #ddd;
  box-shadow: inset 0 0 0 0 #ffc377;
  transition: 0.5s ease-out box-shadow, 3s ease border-color;

  .plus {
    font-size: 5rem;
    line-height: 7rem;
  }

  .label {
    font-size: 1rem;
  }

  &.active,
  &:active {
    border: 2px dashed #aaa;
    box-shadow: inset 0 -15rem 0 0 #ffc377;
    transition: 0.5s ease-in box-shadow, 3s ease border-color;
  }
}

.card-body .vue-tags-input {
  max-width: none !important;
  width: 100%;
  background-color: #dee2e6 !important;
  border-radius: 0.375rem;

  .ti-input {
    transition: 0.3s;
    border: 1px solid #404040 !important;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0.375rem;
  }

  .ti-new-tag-input {
    background-color: transparent !important;
  }

  &.ti-focus .ti-input {
    border: 1px solid #ffce80 !important;
  }

  .ti-tag {
    background: #75d6fd !important;
    color: #333 !important;
    border: 1px solid #ccc;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.75rem;
    padding: 3px 0px 0 5px !important;
    /*border-radius: 0;*/
  }

  .ti-deletion-mark {
    background: #aa0000 !important;
    span,
    .ti-actions i {
      color: #ffffff !important;
    }
  }
}
</style>

<script setup lang="ts">
import AiSummaries from "@client/components/AiSummaries.vue";
import ImagePreview from "@client/components/ImagePreview.vue";
import LoadingSpinner from "@client/components/LoadingSpinner.vue";
import MarkDown from "@client/components/MarkDown.vue";
import PostNotAvailable from "@client/components/PostNotAvailable.vue";
import { debounce } from "@client/debounce.js";
import { PostEndpoints } from "@client/util/api-client.js";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { t, tc } from "@fumix/fu-blog-client/src/plugins/i18n.js";
import type { DraftResponseDto, NewPostRequestDto, Post, Tag } from "@fumix/fu-blog-common";
import { bytesToBase64URL, convertToHumanReadableFileSize } from "@fumix/fu-blog-common";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import VueTagsInput from "@sipec/vue3-tags-input";

const tag = ref<string>("");
const md = ref<string | null>(null);
const loading = ref<boolean>(false);
const files = reactive<{ [sha256: string]: File }>({});
const dropzoneHighlight = ref<boolean>(false);
const router = useRouter();
const markdownArea = ref(null);
const postHasError = ref<boolean>(false);
const tagList = ref<Tag[]>([]);

const form = reactive<NewPostRequestDto>({
  title: "",
  description: "",
  markdown: "",
  draft: false,
  stringTags: [],
});

const props = defineProps({
  postId: {
    type: Number,
    required: false,
  },
});

const totalBytesInFiles = computed(() =>
  Object.values(files)
    .map((it) => it.size)
    .reduce((acc, x) => acc + x, 0),
);

onMounted(async () => {
  const route = useRoute();
  // prefill form with values fom loaded post
  if (props.postId) {
    try {
      const res = await fetch(`/api/posts/${props.postId}`);
      const resJson = (await res.json())?.data as Post;
      form.title = resJson.title;
      form.description = resJson.description;
      form.markdown = resJson.markdown;
      form.draft = resJson.draft;
      form.stringTags = resJson.tags?.map((tag) => tag.name) || [];
      postHasError.value = false;
    } catch (e) {
      postHasError.value = true;
      console.log("ERROR: ", e);
    }
  }

  debounce(() => {
    loading.value = true;
    md.value = form.markdown;
  }, 1000);
});

const pasteImageFileToMarkdown = (markdown: string) => {
  form.markdown = insertIntoTextarea(markdown, markdownArea.value as unknown as HTMLTextAreaElement);
};

const dropMarkdown = (evt: DragEvent) => {
  const items = evt.dataTransfer?.items;
  const textArea = evt.target as HTMLTextAreaElement;
  if (items && textArea) {
    for (const item of items) {
      if (item.kind === "string" && item.type === "text/markdown") {
        evt.preventDefault();
        item.getAsString((markdown) => {
          form.markdown = insertIntoTextarea(markdown, textArea, "before");
        });
      }
    }
  }
};

const openFileDialog = () => {
  document.getElementById("file")?.click();
};

const highlightDropzone = (event: DragEvent, value: boolean = false) => {
  event.preventDefault();
  dropzoneHighlight.value = value && [...(event.dataTransfer?.items ?? [])].some((it) => it.kind === "file");
};

const handleFileChange = (e: Event) => {
  if (e instanceof DragEvent) {
    e.preventDefault();
    const items: DataTransferItemList | undefined = e.dataTransfer?.items as DataTransferItemList;
    if (items) {
      [...items].forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            addFile(file);
          } else {
            console.error("Can't process null file!");
          }
        } else {
          console.error("Can't process item of kind " + item.kind);
          item.getAsString((it) => console.log("Item", item.kind, it));
        }
      });
    }
    highlightDropzone(e, false);
  } else if (e.target instanceof HTMLInputElement && e.target.files) {
    Array.from(e.target.files).forEach((it) => addFile(it));
  }
};

const handleTagsChanged = (tags: any) => {
  form.stringTags = tags.map((it: any) => it.text);
};

const handleAutocompletion = async (event: any) => {
  if (event.target.value) {
    let response = await fetch(`/api/posts/tags/` + event.target.value).then((response) =>
      response.json().then((json) => {
        console.log(JSON.stringify(json.data));
        tagList.value = json.data ? json.data.map((it: Tag) => it.name) : [];
      }),
    );
  }
};

const addTag = (tag: string) => {
  form.stringTags.push(tag);
  form.stringTags = [...new Set(form.stringTags)].sort((a, b) => a.localeCompare(b));
};

const selectItem = (item: Tag) => {
  addTag(item.name);
};

const setDescription = (description: string) => {
  form.description = description;
};

const addFile = (file: File) => {
  file
    .arrayBuffer()
    .then((it) => window.crypto.subtle.digest("SHA-256", it))
    .then((it) => bytesToBase64URL(new Uint8Array(it)))
    .then((it) => (files[it] = file))
    .catch((it) => console.error("Failed to calculate SHA-256 hash!"));
};

const submitForm = (e: Event) => {
  e.preventDefault();
  send(props.postId);
};

const insertIntoTextarea = (
  insertedText: string,
  area: HTMLTextAreaElement,
  insertPosition: "before" | "after" | "replace" = "after",
): string => {
  const start = area.selectionStart;
  const end = area.selectionEnd;
  const text = area.value;
  const before = text.substring(0, insertPosition == "after" ? end : start);
  const after = text.substring(insertPosition == "before" ? start : end);
  return before + insertedText + after;
};

const send = async (id: number | undefined) => {
  const successAction = (r: DraftResponseDto) => {
    router.push(`/posts/post/${r.postId}`);
  };
  if (!id) {
    await PostEndpoints.createPost(form, Object.values(files))
      .then(successAction)
      .catch((reason) => console.log("Create post request failed", reason));
  } else {
    await PostEndpoints.editPost(Object.assign(form, { id }), Object.values(files))
      .then(successAction)
      .catch((reason) => console.log("Edit post request failed", reason));
  }
};
</script>
