export type HyperlinkDto = {
  label: string;
  url: string;
};

export function asHyperlinkDto(label: string | undefined, url: string | undefined): HyperlinkDto | undefined {
  return label !== undefined && url !== undefined ? { label, url } : undefined;
}
