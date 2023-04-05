<template>
  <div class="img-container">
    <img :src="dataUrl" class="img-thumbnail" v-on:dragstart="onDragStart($event)" :draggable="showPaste" />
    <div>
      <strong :title="value.name">{{ value.name }}</strong>
      <span>{{ convertToHumanReadableFileSize(value.size) }}</span
      ><br />
      <button class="btn btn-primary mx-1" v-if="showPaste" @click="$emit('paste', getMarkdownString())">
        <fa-icon :icon="faPaste"></fa-icon>
      </button>
      <button class="btn btn-outline-danger mx-1" v-if="showDelete" @click="$emit('delete')"><fa-icon :icon="faTrash"></fa-icon></button>
    </div>
  </div>
</template>
<script lang="ts">
import { faPaste, faTrash } from "@fortawesome/free-solid-svg-icons";
import { blobToArray, bytesToDataUrl, convertToHumanReadableFileSize, escapeMarkdownAltText } from "@fumix/fu-blog-common";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  emits: ["paste", "delete"],
  methods: {
    convertToHumanReadableFileSize,
    getMarkdownString() {
      return `![${escapeMarkdownAltText(this.value.name)}](${this.hash})`;
    },
    onDragStart(event: DragEvent) {
      if (this.showPaste) {
        event.dataTransfer?.setData("text/markdown", this.getMarkdownString());
      }
    },
  },
  props: {
    hash: {
      type: String,
      required: true,
    },
    value: {
      type: Object as PropType<File>,
      required: true,
    },
    showDelete: {
      type: Boolean,
      default: true,
    },
    showPaste: {
      type: Boolean,
      default: true,
    },
  },
  async setup(props) {
    const dataUrl = await blobToArray(props.value).then((it) => bytesToDataUrl(props.value.type, it));
    return {
      dataUrl,
      faPaste,
      faTrash,
    };
  },
});
</script>
<style scoped lang="scss">
div.img-container {
  width: 12rem;
  margin: 0.25rem;
  position: relative;
  display: inline-block;
  text-align: center;
  vertical-align: bottom;
  img {
    &[draggable="true"] {
      cursor: move;
    }
    min-width: 2rem;
    min-height: 2rem;
    max-width: 12rem;
    max-height: 12rem;
  }
  div {
    font-size: 0.75em;
    strong {
      font-weight: bold;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: clip;
      display: block;
    }
    display: block;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>
