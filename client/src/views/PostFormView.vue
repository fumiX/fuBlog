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
                <textarea
                  v-model="form.description"
                  style="overflow-y: scroll; height: 6rem"
                  class="form-control"
                  id="description"
                ></textarea>
                <label for="description">{{ t("posts.form.description") }}</label>
              </div>

              <div class="form-floating mb-3">
                <label for="stringTags">{{ t("posts.form.tags.tags") }}</label>
                <vue-tags-input
                  v-model="tag"
                  :tags="tags"
                  :autocomplete-items="tagList"
                  :placeholder="t('posts.form.tags.enter')"
                  @tags-changed="handleTagsChanged"
                  @input="handleAutocompletion"
                  @before-adding-tag="checkTag"
                />
              </div>

              <div class="mb-3">
                <ai-summaries
                  :full-text="form.markdown"
                  :onSetDescription="setDescription"
                  :onAddTag="addTag"
                  :onSetKeyvisual="setKeyvisual"
                ></ai-summaries>
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

              <div class="form-floating mb-3 uploadCard">
                <h4>
                  {{ tc("posts.form.imageupload", Object.keys(files).length) }}
                  <small class="text-body-secondary f-4" v-if="Object.keys(files).length > 0">
                    ({{ convertToHumanReadableFileSize(totalBytesInFiles) }})
                  </small>
                </h4>
                <!-- Hidden file input, used to open the file dialog, when the dropzone is clicked -->
                <input
                  style="display: none"
                  type="file"
                  id="file"
                  multiple
                  v-on:change="handleFileChange($event)"
                  accept=".png, .gif, .jpg, .jpeg, image/png, image/jpeg, image/gif"
                />

                <div class="imagesPreviewContaier" v-if="Object.keys(files).length">
                  <div class="inner">
                    <Suspense v-for="hash in Object.keys(files).reverse()" v-bind:key="hash">
                      <ImagePreview
                        :value="files[hash]"
                        :hash="hash"
                        @paste="pasteImageFileToMarkdown($event, 'afterCursor')"
                        @delete="
                          removeImageFileFromMarkdown(files[hash]);
                          delete files[hash];
                        "
                      >
                      </ImagePreview>
                    </Suspense>
                  </div>
                </div>

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
              </div>

              <button type="submit" class="btn btn-sm btn-primary float-end">{{ t("app.base.save") }}</button>
              <button type="button" class="btn btn-sm btn-secondary float-end mx-3" @click="router.go(-1)">
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

.uploadCard {
  border: 1px solid #404040;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
  background-color: #dee2e6;
}

.imagesPreviewContaier {
  width: 100%;
  max-width: 100%;
  min-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0 0 10px 0;
  padding: 0;
  overflow-x: auto;
  height: auto;
  min-height: 270px;
}

.inner {
  position: absolute;
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 100%;
  min-width: 100%;
}

#dropzone {
  background-color: #f8f9fa55;
  border: 1px solid #ccc;
  color: #222;
  cursor: pointer;
  vertical-align: top;
  display: inline-block;
  min-height: 15rem;
  padding: 1rem 0.25rem;
  margin: 0;
  text-align: center;
  border-radius: 0.375rem;
  box-shadow: inset 0 0 0 0 #ffc377;
  transition: 0.5s ease-out box-shadow, 3s ease border-color;
  width: 100%;

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
    background: #75d6fd;
    color: #333;
    border: 1px solid #ccc;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.75rem;
    padding: 3px 0px 0 5px !important;
  }

  .ti-deletion-mark {
    background: #aa0000 !important;
    border-radius: 0.25rem;

    span,
    .ti-actions i {
      color: #ffffff !important;
    }
  }

  .ti-autocomplete {
    transition: 0.3s;
    border: 1px solid #404040 !important;
    border-top: none;
    outline: none !important;
    border-radius: 0.375rem;
    background-color: #dee2e6 !important;
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.35);
    font-size: 0.95rem;

    .ti-item.ti-selected-item {
      background: #ffce80;
      color: #333;
    }

    .ti-item:first-child {
      border-top-left-radius: 0.375rem;
      border-top-right-radius: 0.375rem;
    }

    .ti-item:last-child {
      border-bottom-left-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
  }

  @keyframes shake {
    10%,
    90% {
      transform: scale(0.9) translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: scale(0.9) translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: scale(0.9) translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: scale(0.9) translate3d(4px, 0, 0);
    }
  }

  .ti-exists {
    transition-duration: 0.5s;
    background-color: #ffce80;
    animation: shake 0.5s;
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
import { t, tc } from "@client/plugins/i18n.js";
import type { DraftResponseDto, NewPostRequestDto, Post, Tag, SupportedInsertPositionType, Attachment } from "@fumix/fu-blog-common";
import { bytesToBase64URL, convertToHumanReadableFileSize } from "@fumix/fu-blog-common";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import VueTagsInput from "@sipec/vue3-tags-input";

const tag = ref<string>("");
const tags = ref<{ text: string; tiClasses?: string[] }[]>([]); // vue-tags-input internal format
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

watch(tags, (value) => {
  // keep tag array in sync with form.stringTags
  form.stringTags = value ? value.map((tag) => tag.text) : [];
});

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
      tags.value = resJson.tags ? resJson.tags?.map((tag) => ({ text: tag.name })) : [];
      postHasError.value = false;

      if (resJson.attachments) {
        // ADD already existing attachments to files
        processAttachments(resJson.attachments);
      }
    } catch (e) {
      postHasError.value = true;
    }
  }

  debounce(() => {
    loading.value = true;
    md.value = form.markdown;
  }, 1000);
});

// Function to process attachments and populate the files object
const processAttachments = (attachments: Attachment[]) => {
  attachments.forEach((attachment) => {
    const blob = new Uint8Array((attachment.file.binaryData as any).data);
    const file = new File([blob], attachment.filename, { type: attachment.file.mimeType });
    files[attachment.file.sha256] = file;
  });
};

const pasteImageFileToMarkdown = (markdown: string, insertPosition: SupportedInsertPositionType = "afterCursor") => {
  form.markdown = insertIntoTextarea(markdown, markdownArea.value as unknown as HTMLTextAreaElement, insertPosition);
};

const removeImageFileFromMarkdown = (file: File) => {
  const strToRemove = `![${file.name}](${Object.keys(files).find((key) => files[key] === file)})`.trim();
  setTimeout(() => {
    // give the preview time to update
    form.markdown = form.markdown.split(strToRemove).join("");
  }, 0);
};

const dropMarkdown = (evt: DragEvent) => {
  const items = evt.dataTransfer?.items;
  const textArea = evt.target as HTMLTextAreaElement;
  if (items && textArea) {
    for (const item of items) {
      if (item.kind === "string" && item.type === "text/markdown") {
        evt.preventDefault();
        item.getAsString((markdown) => {
          form.markdown = insertIntoTextarea(markdown, textArea, "beforeCursor");
        });
      }
    }
  }
};

const openFileDialog = (): void => {
  document.getElementById("file")?.click();
};

const highlightDropzone = (event: DragEvent, value: boolean = false): void => {
  event.preventDefault();
  dropzoneHighlight.value = value && [...(event.dataTransfer?.items ?? [])].some((it) => it.kind === "file");
};

const handleFileChange = (e: Event): void => {
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

const handleTagsChanged = (newTags: any[]) => {
  tags.value = newTags;
};

const handleAutocompletion = async (event: any) => {
  if (event.target.value) {
    let response = await fetch(`/api/posts/tags/` + event.target.value).then((response) =>
      response.json().then((json) => {
        tagList.value = json.data ? json.data.map((it: Tag) => ({ text: it.name })) : [];
      }),
    );
  }
};

const addTag = (currentTag: string) => {
  const objTag = { text: currentTag };
  tags.value = !tags.value.map((it) => it.text).includes(currentTag) ? [...tags.value, objTag] : [...tags.value];
};

const checkTag = (obj: any) => {
  if (tags.value.map((it) => it.text).includes(obj.tag.text)) {
    const foundTag = tags.value.find((it) => it.text === obj.tag.text);
    if (foundTag) {
      tag.value = "";
      const span = querySelectorIncludesText(".ti-tags li .ti-tag-center span", obj.tag.text);
      const parent = span?.parentElement?.parentElement?.parentElement?.classList.add("ti-exists");
      const to = setTimeout((parent) => {
        document.querySelector(".ti-exists")?.classList.remove("ti-exists");
        clearTimeout(to);
      }, 600);
    }
    return;
  } else {
    obj.addTag();
  }
};

const querySelectorIncludesText = (selector: string, text: string) => {
  return Array.from(document.querySelectorAll(selector)).find((el) => el.textContent?.includes(text));
};

const setDescription = (description: string) => {
  form.description = description;
};

const setKeyvisual = (base64Str: string) => {
  fetch(base64Str)
    .then((res) => res.blob())
    .then((blob) => {
      const file = new File([blob], "keyvisual", { type: "image/png" });
      // add keyvisual to files
      addFile(file);
      // add keyvisual to markdown
      getBase64Hash(file).then((it) => pasteImageFileToMarkdown(`![keyvisual](${bytesToBase64URL(new Uint8Array(it))})  \n\n`, "top"));
    });
};

const getBase64Hash = (file: File): Promise<ArrayBuffer> => {
  return file.arrayBuffer().then((it) => window.crypto.subtle.digest("SHA-256", it));
};

const addFile = (file: File) => {
  getBase64Hash(file)
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
  insertPosition: SupportedInsertPositionType = "afterCursor",
): string => {
  const start = insertPosition === "top" ? 0 : area.selectionStart;
  const end = insertPosition === "top" ? 0 : area.selectionEnd;
  const text = area.value;
  const before = text.substring(0, insertPosition === "afterCursor" ? end : start);
  const after = text.substring(insertPosition === "beforeCursor" ? start : end);

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
