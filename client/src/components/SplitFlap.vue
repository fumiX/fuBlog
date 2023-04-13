<template>
  <div class="outline">
    <div>
      <span class="bottom a"
        ><span>{{ currentChar }}</span></span
      >
      <span class="top b">{{ nextChar }}</span>
      <span class="top a" :class="{ animated: isAnimated.isAnimated }">{{ currentChar }}</span>
      <span class="bottom b" :class="{ animated: isAnimated.isAnimated }"
        ><span>{{ nextChar }}</span></span
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

const props = defineProps({ targetChar: String });

const r = reactive({ char: props.targetChar });

const alphabet = [..." 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ"];
const currentChar = ref<string>("0");
const nextChar = ref<string>(findNextChar(currentChar.value) ?? " ");
const timeout = ref<number>(100);
// noinspection JSUnusedGlobalSymbols
const cssTimeout = computed(() => timeout.value + "ms");
const isAnimated = reactive({ isAnimated: false });

watch(() => props.targetChar, animate);

animate();

function animate() {
  if (currentChar.value != props.targetChar) {
    isAnimated.isAnimated = true;
    setTimeout(() => {
      currentChar.value = nextChar.value;
      requestAnimationFrame(() => {
        isAnimated.isAnimated = false;
        nextChar.value = findNextChar(currentChar.value) ?? " ";
        requestAnimationFrame(animate);
      });
    }, timeout.value + Math.floor(Math.random() * 61 - 30));
  }
}

function findNextChar(current: string): string | undefined {
  const nextIndex = alphabet.indexOf(current) + 1;
  return alphabet[nextIndex >= alphabet.length ? 0 : nextIndex];
}
</script>

<style lang="scss" scoped>
div.outline {
  display: inline-block;
  border: solid #ff9c00;
  border-width: 0 0.1rem;
  margin: 0 0.1rem 0;
  div {
    font-family: "Roboto Condensed";
    font-weight: bold;
    width: 5rem;
    height: 8rem;
    background: #ccc;
    perspective: 30rem;

    span {
      background: #333;
      color: #fff;
      width: 5rem;
      height: 4rem;
      font-size: 5rem;
      text-align: center;
      line-height: 8rem;
      display: block;
      position: absolute;
      overflow: clip;
      backface-visibility: hidden;
      border: 0.1rem solid #ff9c00;
      user-select: none;

      span {
        border: none;
        top: -1px;
        left: -1px;
      }

      &.top.a {
        user-select: text;
        transform-origin: bottom center;
        transform: rotateX(0deg);
        &.animated {
          animation: v-bind("cssTimeout") ease-in topAFlap 1 forwards;
        }
      }

      &.bottom {
        top: 4rem;
        span {
          top: -4.1rem;
          overflow: visible;
        }
        &.b {
          transform-origin: top center;
          transform: rotateX(180deg);
          &.animated {
            animation: v-bind("cssTimeout") ease-in bottomBFlap 1 forwards;
          }
        }
      }

      @keyframes topAFlap {
        from {
          transform: rotateX(0deg);
        }
        to {
          transform: rotateX(-180deg);
        }
      }
      @keyframes bottomBFlap {
        from {
          transform: rotateX(180deg);
        }
        to {
          transform: rotateX(0deg);
        }
      }
    }
  }
}
</style>
