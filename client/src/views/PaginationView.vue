<template>
  <button v-if="showPrevButton()" @click="$emit('paginate', 1)">&lt;&lt;&lt;</button>
  <button v-for="currentPage in totalPages" :key="currentPage" @click="$emit('paginate', currentPage)">
    {{ currentPage }}
  </button>
  <button v-if="showNextButton()" @click="$emit('paginate', totalPages)">&gt;&gt;&gt;</button>
</template>

<script>
export default {
  name: "PaginationView",
  props: ["totalPages", "currentPage"],
  emits: ["paginate"],
  methods: {
    showPrevButton() {
      return this.currentPage > 1;
    },
    showNextButton() {
      return this.currentPage < this.totalPages;
    },
  },
};
</script>

<style scoped></style>
