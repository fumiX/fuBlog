<template>
  <form class="d-flex" @submit="$event.preventDefault()">
    <!-- <button class="btn btn-sm btn-outline-primary" @click="toggleOperator()">{{ operator === "and" ? "UND" : "ODER" }}</button> -->
    <input
      class="form-control mx-2 search"
      v-model="search"
      type="search"
      placeholder="Suche"
      aria-label="Suche"
      @keydown.enter="$emit('searched', search)"
    />
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

  emits: ["searched", "operatorChanged"],

  setup(props, emits) {
    const search = ref<string>("");
    const operator = ref<string>("and");

    watch(props, (props) => {
      search.value = props.searchString as string;
    });

    watch(search, (value) => {
      if (!value) {
        emits.emit("searched", "");
      }
    });

    const toggleOperator = () => {
      operator.value = operator.value === "and" ? "or" : "and";
      emits.emit("operatorChanged", operator.value);
    };

    return {
      props,
      emits,
      search,
      operator,
      toggleOperator,
    };
  },
});
</script>
