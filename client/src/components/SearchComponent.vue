<template>
  <form class="d-flex" @submit="$event.preventDefault()">
    <input class="form-control me-2 search" v-model="search" type="search" placeholder="Suche" aria-label="Suche" @keydown.enter="$emit('searched', search)" />
    <button class="btn btn-sm btn-outline-primary" type="button" @click="$emit('searched', search)">Suche</button>
  </form>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: {
    searchString: {
      type: String,
      required: true,
    },
  },

  emits: ["searched"],

  setup(props, emits) {
    const search = ref<string>("");

    watch(props, (props) => {
      search.value = props.searchString as string;
    });

    watch(search, (value) => {
      if (!value) {
        emits.emit("searched", "");
      }
    });

    return {
      props,
      emits,
      search,
    };
  },
});
</script>
