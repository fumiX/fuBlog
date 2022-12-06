<template>
  <div class="d-flex justify-content-center">
    <button class="btn btn-outline-primary" v-if="showPrevButton()" @click="$emit('paginate', 1)">&lt;&lt;</button>
    <button class="btn btn-secondary" v-for="currentPage in totalPages" :key="currentPage" @click="$emit('paginate', currentPage)">
      {{ currentPage }}
    </button>
    <button class="btn btn-outline-primary" v-if="showNextButton()" @click="$emit('paginate', totalPages)">&gt;&gt;</button>
  </div>
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
