import { AiSummaryData } from "@fumix/fu-blog-common";
import console from "console";
import { Configuration, OpenAIApi } from "openai";
import logger from "../logger.js";
import { OpenAISettings } from "../settings.js";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: OpenAISettings.API_KEY,
  }),
);

export async function image() {
  console.log("Create image");
  await openai
    .createImage({
      prompt: "…",
      size: "1024x1024",
      n: 1,
    })
    .then(({ data, status }) => {
      console.log("Image created", JSON.stringify(data), status);
    })
    .catch((it) => {
      console.error(it);
    });
}

export async function chatGptSummarize(text: string): Promise<AiSummaryData> {
  return openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Du bist eine hilfreiche JSON-Schnittstelle.
Der User gibt dir ein JSON-Objekt mit genau einem Attribut "text" vom Typ \`string\` mit einem Text, den du zusammenfassen sollst.
Du lieferst ebenfalls ein JSON-Objekt zurück, das den Text beschreibt.
Deine Antworten bestehen ausschließlich aus diesem JSON-Objekt mit genau drei Attributen:
 * "summary" enthält einen Wert vom Typ \`string\`: Eine Zusammenfassung des gegebenen Textes in 50 bis 100 Worten.
 * "keywords" enthält einen Wert vom Typ \`string[]\`: Bis zu 15 der wichtigsten Schlagwörter, die den gegebenen Text beschreiben und die man zum Kategorisieren des Textes verwenden kann.
 * "imagePrompts" enthält einen Wert vom Typ \`string[]\`: Beschreibungen zu drei Bildern, die den Text dynamisch und unterhaltsam illustrieren können.
Solltest Du unerwartete Eingaben erhalten oder kein solches JSON-Objekt wie oben beschrieben liefern können, antworte stattdessen einfach mit einem JSON-Objekt mit nur einem einzigen Attribut: \`error\` vom Typ \`string\`.
Es enthält eine knappe für Endnutzer verständliche Beschreibung, was das Problem ist.`,
        },
        {
          role: "user",
          content: JSON.stringify({ text }),
        },
      ],
    })
    .then<AiSummaryData>(({ data, status }) => {
      const answer = data.choices?.[0]?.message?.content;
      if (answer) {
        const dto = JSON.parse(answer) as AiSummaryData;
        if (dto) {
          return dto;
        }
      }
      logger.error(`Could not decode ChatGPT response ${JSON.stringify(data)} (${status})`);
      return { error: `Could not decode ChatGPT response (${status})` };
    })
    .catch((error) => {
      logger.error(error);
      return { error: "An unknown error has occurred: " + error };
    });
}
