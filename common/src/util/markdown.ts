export function escapeMarkdownAltText(altText: string): string {
  return altText.replace("]", "\\]").replace("[", "\\[");
}
