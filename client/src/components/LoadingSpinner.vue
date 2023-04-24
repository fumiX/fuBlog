<template>
  <div class="spinner-border" role="status">
    <span class="visually-hidden">{{ t("app.base.loading") }}</span>
  </div>
</template>
<script setup lang="ts">
import { t } from "@client/plugins/i18n.js";
</script>
