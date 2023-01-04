<template>
  <div class="row mb-2">
    <div class="col">
      <div class="card flex-md-row mb-4 box-shadow h-md-250">
        <div class="card-body">
          <div class="clearfix mb-4">
            <button class="btn btn-sm btn-primary" @click="$router.push('/posts/post/' + post.id)">
              <fa-icon :icon="faBookReader" />
              Lesen
            </button>
            <button class="btn btn-sm btn-danger float-end" @click="$emit('deletePost', post)">
              <fa-icon :icon="faTrash" />
              Löschen
            </button>
            <button class="btn btn-sm btn-secondary float-end mx-2" @click="$emit('changePost', post)">
              <fa-icon :icon="faEdit" />
              Ändern
            </button>
          </div>
          <!-- <strong class="d-inline-block mb-2 text-primary">Kategorie</strong> -->
          <h3 class="mb-0 display-4 clickable" @click="goTo('/posts/post/' + post.id)">{{ post.title }}</h3>
          <div class="mb-1 text-muted">
            <fa-icon :icon="faClock" />
            {{ $luxonDateTime.fromISO(post.createdAt.toString()).toRelativeCalendar() }}
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
import type { Post } from "@fumix/fu-blog-common";
import type { PropType } from "vue";
import { faBookReader, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";

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
      faBookReader,
      faTrash,
      faEdit,
      faClock,
    };
  },

  methods: {
    goTo(path: string) {
      this.$router.push(path);
    },
  },
});
</script>
