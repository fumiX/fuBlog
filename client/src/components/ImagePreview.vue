<template>
  <div class="preview-container">
    <div class="img-container">
      <img :src="dataUrl" v-on:dragstart="onDragStart($event)" :draggable="showPaste" />
    </div>
    <div class="info-container">
      <div class="code">{{ hash.substring(0, Math.min(7, hash.length)) }} / {{ convertToHumanReadableFileSize(value.size) }}</div>
      <strong :title="value.name">{{ value.name }}</strong>
      <button class="btn btn-paste mx-1" v-if="showPaste" @click="$emit('paste', getMarkdownString())">
        <fa-icon :icon="faPaste"></fa-icon>
      </button>
      <button class="btn btn-delete mx-1" v-if="showDelete" @click="$emit('delete')"><fa-icon :icon="faTrash"></fa-icon></button>
    </div>
  </div>
</template>
<style scoped lang="scss">
.preview-container {
  width: 150px;
  margin: 0;
  position: relative;
  display: inline-block;
  text-align: center;
  background-color: #f8f9fa55;
  border-radius: 0.375rem;
  border: 1px solid #ccc;

  .btn-paste {
    color: #222;
    &:hover {
      color: #22222255;
    }
  }

  .btn-delete {
    color: #a00;
    &:hover {
      color: #e00;
    }
  }

  &:hover {
    img {
      transition-duration: 0.3s;
      opacity: 1;
    }
  }

  &:not(:last-child) {
    margin-right: 10px;
  }

  .img-container {
    display: flex;
    width: 148px;
    height: auto;
    aspect-ratio: 1/1;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    // border:1px solid red;
  }

  img {
    transition-duration: 0.3s;
    display: flex;
    border: 1px solid #999;

    &[draggable="true"] {
      cursor: move;
    }

    // margin-left:-4px;

    max-width: 134px;
    max-height: 134px;
    opacity: 0.75;
    margin: 0;
    padding: 0;
  }

  .info-container {
    font-size: 0.75em;
    margin-bottom: 7px;
    padding-top: 5px;

    strong {
      font-weight: bold;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: clip;
      display: block;
      padding: 0 5px 7px 5px;
    }

    .code {
      font-family: monospace;
      font-size: 10px;
      margin-bottom: 5px;
    }
  }
}
</style>

<script setup lang="ts">
import { faPaste, faTrash } from "@fortawesome/free-solid-svg-icons";
import { blobToArray, bytesToDataUrl, convertToHumanReadableFileSize, escapeMarkdownAltText } from "@fumix/fu-blog-common";
import type { PropType } from "vue";

const getMarkdownString = () => {
  return `![${escapeMarkdownAltText(props.value.name)}](${props.hash})`;
};

const onDragStart = (event: DragEvent) => {
  if (props.showPaste) {
    event.dataTransfer?.setData("text/markdown", getMarkdownString());
  }
};

const props = defineProps({
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
});

const emits = defineEmits(["paste", "delete"]);
const dataUrl = await blobToArray(props.value).then((it) => bytesToDataUrl(props.value.type, it));
</script>
