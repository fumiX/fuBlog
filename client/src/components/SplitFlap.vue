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

const alphabet = [..." ÄÖÜ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const currentChar = ref<string>(" ");
const nextChar = ref<string>(findNextChar(currentChar.value) ?? " ");
const timeout = ref<number>(100);
// noinspection JSUnusedGlobalSymbols
const cssTimeout = computed(() => timeout.value + "ms");
const isAnimated = reactive({ isAnimated: false });

watch(() => props.targetChar, animate);

animate();

function animate() {
  const targetChar = props.targetChar && alphabet.includes(props.targetChar) ? props.targetChar : " ";
  const numStepsRemaining = stepsRemaining(currentChar.value, targetChar);
  if (numStepsRemaining > 4) {
    // If the target is far away, animate faster
    timeout.value = 80;
  } else {
    // The closer the target, the slower the animation
    timeout.value = 1000 - numStepsRemaining * 200;
  }
  if (numStepsRemaining > 0) {
    isAnimated.isAnimated = true;
    // Wait for the animation to finish
    setTimeout(
      () => {
        currentChar.value = nextChar.value;
        // Execute immediately before the style calculations for the next frame
        requestAnimationFrame(() => {
          isAnimated.isAnimated = false;
          nextChar.value = findNextChar(currentChar.value) ?? " ";
          // Wait with continuing the animation until immediately before the style calculations for the next frame
          requestAnimationFrame(animate);
        });
      },
      timeout.value + Math.random() * 50,
    );
  }
}

function stepsRemaining(currentChar: string, targetChar: string): number {
  const currentIndex = alphabet.indexOf(currentChar);
  const targetIndex = alphabet.indexOf(targetChar);
  if (targetIndex < 0 || currentIndex < 0) {
    return 1;
  }
  if (targetIndex >= currentIndex) {
    return targetIndex - currentIndex;
  } else {
    return alphabet.length - currentIndex + targetIndex;
  }
}

function findNextChar(current: string): string | undefined {
  const nextIndex = alphabet.indexOf(current) + 1;
  return alphabet[nextIndex >= alphabet.length ? 0 : nextIndex];
}
</script>

<style lang="scss" scoped>
div.outline {
  margin: 0 2px;
  padding: 0;
  div {
    width: 5rem;
    height: 8rem;
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
      border: 1px solid #ff9c00;
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
          top: -4.2rem;
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
