<template>
  <div class="preview-container">
    <div class="erase" @click="$emit('delete')" :title="t('app.base.delete_audio')"></div>
    <div class="audio-container">
      <div class="audio-icon" v-on:dragstart="onDragStart($event)" :draggable="showPaste">
        <fa-icon :icon="faMusic" />
      </div>
    </div>
    <div class="info-container">
      <div class="code">{{ hash.substring(0, Math.min(7, hash.length)) }} / {{ convertToHumanReadableFileSize(value.size) }}</div>
      <strong :title="value.name">{{ value.name }}</strong>
      <div class="button-container">
        <button
          class="btn btn-paste mx-1"
          type="button"
          v-if="showPaste"
          @click="$emit('paste', getMarkdownString())"
          :title="t('app.base.insert_audio')"
        >
          <fa-icon :icon="faFileImport"></fa-icon>
        </button>
        <button class="btn btn-softdelete mx-1" type="button" v-if="showDelete" @click="$emit('softdelete')" :title="t('app.base.remove')">
          <fa-icon :icon="faEraser"></fa-icon>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.erase {
  width: 16px;
  height: 16px;
  right: -7px;
  top: -7px;

  display: block;
  position: absolute;
  z-index: 999;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 50%;
  cursor: pointer;
  transition-duration: 0.4s;

  &:hover {
    transition-duration: 0.4s;
    background-color: #a00;
  }

  &:before {
    position: absolute;
    top: 0;
    left: calc(50% - 3px);
    z-index: 1000;
    content: "\d7";
    line-height: 12px;
    font-size: 12px;
    padding: 0;
    margin: 0;
    transform: scale(1.25);
    color: #fff;
    text-align: center;
  }
}

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

  .btn-softdelete {
    color: #f18901;

    &:hover {
      color: #ffa836;
    }
  }

  &:not(:last-child) {
    margin-right: 15px;
  }

  .audio-container {
    display: flex;
    width: 148px;
    height: auto;
    aspect-ratio: 1/1;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
  }

  .audio-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background-color: #e9ecef;
    border: 2px solid #6c757d;
    border-radius: 50%;
    color: #6c757d;
    font-size: 2rem;
    transition-duration: 0.3s;

    &[draggable="true"] {
      cursor: move;
      /* fallback if grab cursor is unsupported */
      cursor: grab;
      cursor: -moz-grab;
      cursor: -webkit-grab;

      &:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
      }
    }

    &:hover {
      background-color: #dee2e6;
      border-color: #495057;
      color: #495057;
    }
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

    .button-container {
      display: flex;
      justify-content: center;
      align-items: space-between;
    }
  }
}
</style>

<script setup lang="ts">
import { t } from "@client/plugins/i18n.js";
import { faFileImport, faEraser, faMusic } from "@fortawesome/free-solid-svg-icons";
import { convertToHumanReadableFileSize, escapeMarkdownAltText } from "@fumix/fu-blog-common";
import type { PropType } from "vue";

const getMarkdownString = () => {
  return `![audio:${escapeMarkdownAltText(props.value.name)}](${props.hash})`;
};

const onDragStart = (event: DragEvent) => {
  if (props.showPaste) {
    const audioIcon = event.target as HTMLElement;
    event.dataTransfer?.setDragImage(audioIcon, 0, 0);
    event.dataTransfer?.setData("text/plain", getMarkdownString());
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

const emits = defineEmits(["paste", "delete", "softdelete"]);
</script>
