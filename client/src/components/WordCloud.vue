<template>
  <!-- <div>
    <span v-for="word in words" :key="word.name"> {{ word.name }} ({{ word.value }}) </span>
  </div> -->
  <canvas id="my_canvas" style="width: 100%; height: 270px; border-radius: 10px"></canvas>
</template>

<style lang="scss"></style>

<script lang="ts">
import { defineComponent, onActivated, onMounted, ref } from "vue";
import type { Word } from "@fumix/fu-blog-common";
import WordCloud from "wordcloud";

export default defineComponent({
  components: {},
  setup() {
    const words = ref<Word[]>([]);

    const getWordCloud = async () => {
      const response = await fetch("/api/utility/");
      const data = await response.json();
      words.value = data.data;
    };

    const setCanvasCloud = () => {
      const wordList = words.value.map((word) => [word.name, word.value]);
      wordList.unshift(["", (wordList[0][1] as number) + 1]);
      const cnvs: HTMLCanvasElement = document.getElementById("my_canvas") as HTMLCanvasElement;

      //   const newWordList = wordList.map((word) => {
      //     return [word[0], Math.floor((word[1] as number) / 2)];
      //   });
      console.log("WORDLIST", wordList);

      const config = {
        drawOutOfBound: false,
        gridSize: 1,
        fontFamily: "NerkoOne",
        shuffle: false,
        shrinkToFit: true,
        rotateRatio: 1,
        rotationSteps: 30,
        backgroundColor: "transparent",
        list: wordList,
        wait: 25,
        shape: "circle",
        // weightFactor: function (size: number) {
        // //   return (Math.pow(size, 2) * cnvs.width) / 512;
        // return size * 2;
        // },
        color: function (word: string, weight: number) {
          return `hsl(210, 70%, ${100 - Math.min(weight * 1.5, 100)}%)`;
        },
      };

      WordCloud(cnvs, config);
    };

    onMounted(async () => {
      await getWordCloud();
      setCanvasCloud();
    });

    return {
      words,
    };
  },

  methods: {},
});
</script>
