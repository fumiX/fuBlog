/** Data returned from the AI summary endpoint */
export type AiSummaryData = SuccessfulAiSummaryData | FailedAiSummaryData;

export type SuccessfulAiSummaryData = {
  summary: string;
  keywords: string[];
  imagePrompts: string[];
};

export type FailedAiSummaryData = { error: string };

/**
 * Type guard for SuccessfulAiSummaryData
 */
export function isSuccessfulAiSummaryData(data: AiSummaryData): data is SuccessfulAiSummaryData {
  return (data as SuccessfulAiSummaryData)?.summary !== undefined;
}
