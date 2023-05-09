<template>
  <ul v-show="list.length" class="list">
    <li v-for="item in list" :key="item.id" @click="clickItem($event, item)">{{ item.name }}</li>
  </ul>
</template>

<style lang="scss">
.list {
  position: absolute;
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: $autocomplete-panel-background-color;
  border: 1px solid $autocomplete-panel-border-color;
  border-radius: 3px;
  z-index: 2;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.35);
  li {
    color: $autocomplete-item-color;
    padding: 0.125rem 0.5rem;

    &:hover {
      color: $autocomplete-item-color-hover;
      background-color: $autocomplete-item-background-color-hover;
      cursor: pointer;
    }
  }
}
</style>

<script setup lang="ts">
import type { Tag } from "@fumix/fu-blog-common";
import type { PropType } from "vue";

const props = defineProps({ list: { type: Array as PropType<Tag[]>, required: true } });
const emit = defineEmits(["selectItem"]);

const clickItem = (e: MouseEvent, item: Tag) => {
  e.preventDefault();
  emit("selectItem", item);
};
</script>
