type SearchOperator = "and" | "or";

export function asSearchOperator(s: string | undefined | null): SearchOperator {
  return s?.toLowerCase() === "or" ? "or" : "and";
}
