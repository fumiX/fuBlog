import { SummaryDto } from "@fumix/fu-blog-common";
import logger from "@server/logger.js";
import { OpenAISettings } from "@server/settings.js";
import console from "console";
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: OpenAISettings.API_KEY,
  }),
);
/*
export async function askChatGptForSummary(text: string): SummaryDto {

}*/

export async function testAI() {
  logger.info("Asking ChatGPT …");
  openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Du bist eine hilfreiche JSON-Schnittstelle. Der User gibt dir einen Text in Form von Markdown und du lieferst ein JSON-Objekt zurück, das den Text beschreibt.
Deine Antworten bestehen ausschließlich aus diesem JSON-Objekt mit genau zwei Attributen:
 * "summary" enthält als Wert einen \`string\`, der eine Zusammenfassung des gegebenen Textes in 50 bis 100 Worten ist.
 * "keywords" enthält als Wert ein \`string[]\`, das bis zu 15 der wichtigsten Schlagwörter enthält, die den gegebenen Text beschreiben.
`,
        },
        {
          role: "user",
          content: "…",
        },
      ],
    })
    .then(({ data, status }) => {
      console.log("Completion ", JSON.stringify(data));
    })
    .catch((error) => {
      logger.error(error);
    });
}
