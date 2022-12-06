<template>
  <nav aria-label="Page navigation">
    <ul class="pagination justify-content-end">
      <li v-if="showPrevButton()" @click="$emit('paginate', currentPage - 1)" class="page-item">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">Previous</span>
        </a>
      </li>
      <li class="page-item" v-for="currentPage in totalPages" :key="currentPage" @click="$emit('paginate', currentPage)">
        <a class="page-link" href="#">{{ currentPage }}</a>
      </li>
      <li v-if="showNextButton()" @click="$emit('paginate', currentPage + 1)" class="page-item">
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    totalPages: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },

  emits: ["paginate"],

  setup(props, emits) {
    return {
      props,
      emits,
    };
  },

  methods: {
    showPrevButton() {
      return this.$props.currentPage > 1;
    },
    showNextButton() {
      return this.$props.currentPage < this.$props.totalPages;
    },
    showPagination() {
      return this.totalPages > 1;
    },
  },
});
</script>

<style scoped></style>
