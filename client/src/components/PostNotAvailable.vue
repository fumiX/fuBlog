<template>
  <div class="container">
    <div class="row mb-2">
      <div class="col">
        <div class="card flex-md-row mb-4 box-shadow h-md-250">
          <div class="card-body">
            <div class="clearfix mb-4">
              <h1 class="mb-0 display-4">{{ t("posts.post.not-available.title") }}</h1>

              <p class="card-text my-4 fst-italic text-muted">{{ t("posts.post.not-available.message") }}.</p>

              <button class="btn btn-sm btn-outline-primary" @click="$router.push('/')">
                <fa-icon :icon="faArrowLeft" />
                {{ t("app.base.startpage") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
