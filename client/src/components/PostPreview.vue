<template>
  <div class="row mb-2">
    <div class="col">
      <div class="card flex-md-row mb-4 box-shadow h-md-250">
        <div class="card-body">
          <div class="clearfix mb-4">
            <button class="btn btn-sm btn-outline-primary" @click="$router.push('/posts/post/' + post.id)">
              <fa-icon :icon="['fas', 'book-reader']" />
              Lesen
            </button>
            <button class="btn btn-sm btn-outline-danger float-end" @click="$emit('deletePost', post)">
              <fa-icon :icon="['fas', 'trash']" />
              Löschen
            </button>
            <button class="btn btn-sm btn-outline-secondary float-end mx-2" @click="$emit('changePost', post)">
              <fa-icon :icon="['fas', 'edit']" />
              Ändern
            </button>
          </div>
          <!-- <strong class="d-inline-block mb-2 text-primary">Kategorie</strong> -->
          <h3 class="mb-0">
            <router-link :to="'posts/post/' + post.id" class="text-dark">{{ post.title }}</router-link>
          </h3>
          <div class="mb-1 text-muted">
            <fa-icon :icon="['far', 'clock']" />
            {{ $luxonDateTime.fromISO(post.createdAt).toRelativeCalendar() }}
            <span v-if="post.createdBy"> von </span>
            <i v-if="post.createdBy">{{ post.createdBy.firstName }} {{ post.createdBy.lastName }}</i>
          </div>
          <p class="card-text my-4">{{ post.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script lang="ts">
import { defineComponent } from "vue";
import type { Post } from "./../../../server/src/entity/Post";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    post: {
      type: Object as PropType<Post>,
      required: true,
    },
  },

  emits: ["deletePost", "changePost"],

  setup(props, emits) {
    return {
      props,
      emits,
    };
  },

  methods: {},
});
</script>
