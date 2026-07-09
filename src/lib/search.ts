export function normalizeSearch(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearch(
  query: string,
  fields: (string | number | undefined | null)[]
): boolean {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  return fields.some((field) =>
    String(field ?? "")
      .toLowerCase()
      .includes(normalized)
  );
}
