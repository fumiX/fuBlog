import { SummaryDto } from "@fumix/fu-blog-common";
import { Configuration, OpenAIApi } from "openai";
import logger from "../logger.js";
import { OpenAISettings, ServerSettings } from "../settings.js";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: OpenAISettings.API_KEY,
  }),
);

export async function chatGptSummarize(text: string): Promise<SummaryDto | null> {
  return openai
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
          content: text,
        },
      ],
    })
    .then<SummaryDto | null>(({ data, status }) => {
      const answer = data.choices?.[0]?.message?.content;
      if (answer) {
        const dto = JSON.parse(answer) as SummaryDto;
        if (dto) {
          return dto;
        }
      }
      logger.error(`Could not decode ChatGPT response ${JSON.stringify(data)} (${status})`);
      return null;
    })
    .catch((error) => {
      logger.error(error);
      return null;
    });
}
