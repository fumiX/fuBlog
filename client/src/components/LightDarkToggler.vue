<template>
  <div class="toggler">
    <input @change="toggleTheme" id="checkbox" type="checkbox" class="modeswitch-checkbox" />
    <label for="checkbox" class="modeswitch-label">
      <span class="emoji">🌙</span>
      <span class="emoji">☀️</span>
      <div class="modeswitch-toggle" :class="{ 'modeswitch-toggle-checked': userTheme === 'darkTheme' }"></div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { saveCssPreference, loadCssPreference } from "@client/util/storage.js";
import type { UserTheme } from "@fumix/fu-blog-common";

const emit = defineEmits(["themeChanged"]);

const setTheme = (theme: UserTheme) => {
  saveCssPreference(theme);
  userTheme.value = theme;
  emit("themeChanged", userTheme.value);
};

const toggleTheme = (): void => {
  const activeTheme = localStorage.getItem("cssTheme");
  if (activeTheme === "lightTheme") {
    setTheme("darkTheme");
  } else {
    setTheme("lightTheme");
  }
};

const getMediaPreference = (): UserTheme => {
  const hasDarkPreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (hasDarkPreference) {
    return "darkTheme";
  } else {
    return "lightTheme";
  }
};

const userTheme = ref<UserTheme>(loadCssPreference() || getMediaPreference());

onMounted(() => setTheme(userTheme.value));
</script>

<style lang="scss">
.emoji {
  font-family: Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, EmojiSymbols, EmojiOne Mozilla, Twemoji Mozilla,
    Segoe UI Symbol, Noto Color Emoji Compat, emoji, noto-emojipedia-fallback;
  font-weight: 400;
}

:root {
  --element-size: 3rem;
  --background-color-primary: #ebebeb;
  --background-color-secondary: #fafafa;
  --accent-color: #cacaca;
  --text-primary-color: #222;

  .darkTheme {
    --background-color-primary: #1e1e1e;
    --background-color-secondary: #2d2d30;
    --accent-color: #3f3f3f;
    --text-primary-color: #ddd;
  }
}

.toggler {
  .modeswitch-checkbox {
    display: none;
  }

  .modeswitch-label {
    align-items: center;
    background: var(--text-primary-color);
    border: calc(var(--element-size) * 0.025) solid var(--accent-color);
    border-radius: var(--element-size);
    cursor: pointer;
    display: flex;
    font-size: calc(var(--element-size) * 0.3);
    height: calc(var(--element-size) * 0.35);
    position: relative;
    padding: calc(var(--element-size) * 0.25) calc(var(--element-size) * 0.1);
    transition: background 0.5s ease;
    justify-content: space-between;
    width: var(--element-size);
    z-index: 1;
  }

  .modeswitch-toggle {
    position: absolute;
    background-color: var(--background-color-primary);
    border-radius: 50%;
    top: calc(var(--element-size) * 0.05);
    left: calc(var(--element-size) * 0.06);
    height: calc(var(--element-size) * 0.4);
    width: calc(var(--element-size) * 0.4);
    transform: translateX(0);
    transition: transform 0.3s ease, background-color 0.5s ease;
  }

  .modeswitch-toggle-checked {
    transform: translateX(calc(var(--element-size) * 0.45)) !important;
  }
}
</style>
