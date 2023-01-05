import type { ComputedRef, Ref } from "vue";
import { computed, ref, watchEffect } from "vue";

export const debounce = <T>(callback: () => T, timeout = 500): ComputedRef<T> => {
  let isFirstRun = false; // < don't use a ref, otherwise it will loop indefinitely
  const current = ref<T>(null as unknown as T) as Ref<T>;
  let lastTimeout: number | null = null;

  watchEffect(() => {
    const newValue = callback();
    // First call: Set immediately
    if (isFirstRun) {
      current.value = newValue;
      isFirstRun = false;
    } else {
      if (lastTimeout !== null) {
        clearTimeout(lastTimeout);
      }
      lastTimeout = window.setTimeout(() => {
        current.value = newValue;
      }, Math.max(timeout, 1));
    }
  });
  return computed(() => current.value);
};
