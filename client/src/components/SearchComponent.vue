<template>
  <form class="d-flex" @submit="$event.preventDefault()">
    <!-- <button class="btn btn-sm btn-outline-primary" @click="toggleOperator()">{{ operator === "and" ? "UND" : "ODER" }}</button> -->
    <input
      class="form-control mx-2 search"
      v-model="search"
      type="search"
      :placeholder="t('search.placeholder')"
      :aria-label="t('search.title')"
      @keydown.enter="$emit('searched', search)"
    />
    <button class="btn btn-sm btn-outline-primary" type="button" @click="$emit('searched', search)">
      {{ t("search.title") }}
    </button>
  </form>
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const search = ref<string>("");
const operator = ref<string>("and");

const props = defineProps({
  searchString: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(["searched", "operatorChanged"]);

const toggleOperator = () => {
  operator.value = operator.value === "and" ? "or" : "and";
  emits("operatorChanged", operator.value);
};

watch(props, (props) => {
  search.value = props.searchString as string;
});

watch(search, (value) => {
  if (!value) {
    emits("searched", "");
  }
});
</script>
