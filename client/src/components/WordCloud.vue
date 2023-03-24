<template>
  <!-- <div>
    <span v-for="word in words" :key="word.name"> {{ word.name }} ({{ word.value }}) </span>
  </div> -->
  <canvas id="my_canvas" width="1000" height="1000" style="width: 100%"></canvas>
</template>

<style lang="scss"></style>

<script lang="ts">
import { defineComponent, defineEmits, onMounted, ref } from "vue";
import type { Word } from "@fumix/fu-blog-common";
import WordCloud from "wordcloud";

export default defineComponent({
  components: {},

  emits: ["wordclicked"],

  setup(props, emits) {
    const words = ref<Word[]>([]);

    const getWordCloud = async () => {
      const response = await fetch("/api/utility/");
      const data = await response.json();
      words.value = data.data;
    };

    const setCanvasCloud = () => {
      const wordList = words.value.map((word) => [word.name, word.value]);
      // hack to make sure first word has the correct font style
      wordList.unshift(["", (wordList[0][1] as number) + 2]);
      wordList.unshift(["", (wordList[0][1] as number) + 1]);
      const cnvs: HTMLCanvasElement = document.getElementById("my_canvas") as HTMLCanvasElement;

      const cnvsRealWidth = cnvs.getBoundingClientRect().width;
      const cnvsWidth = cnvs.width;

      const mostUsedWord = wordList[0][1] as number;
      const leastUsedWord = wordList[wordList.length - 1][1] as number;
      const range = mostUsedWord - leastUsedWord;

      // console.log("WORDLIST", wordList);

      const config = {
        clearCanvas: true,
        orign: [cnvsWidth / 2, cnvsWidth / 2],
        minRotation: -Math.PI / 3,
        maxRotation: Math.PI / 3,
        minSize: 12,
        drawOutOfBound: false,
        gridSize: 1,
        fontFamily: "NerkoOne",
        // shuffle: true,
        // shrinkToFit: true,
        rotateRatio: 0.6,
        // rotationSteps: 30,
        backgroundColor: "transparent",
        list: wordList,
        // wait: 2.5,
        shape: "circle",
        ellipticity: 0.75,
        weightFactor: function (size: number) {
          const perc = Math.floor(((size - leastUsedWord) / range) * 100);
          // word-size is calculated dependent on the canvas width it should be max of 1/8 of the cnvsWidth
          const newSize = Math.floor((cnvsWidth / 800) * perc);
          return newSize;
        },
        color: function (word: string, weight: number) {
          let perc = Math.floor(((weight - leastUsedWord) / range) * 100);
          if (perc < 10) perc = 10;
          // console.log("WORD", word, perc);
          return `hsl(200, ${Math.max(75, perc)}%, ${Math.min(80, perc)}%)`;
        },
        click: function (item: any) {
          emits.emit("wordclicked", item);
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
      emits,
    };
  },

  methods: {},
});
</script>
