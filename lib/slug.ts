export function createProductSlug(id: number | string, name?: string): string {
  if (!name) return String(id);
  const cleanName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${id}-${cleanName}`;
}

export function parseProductIdFromSlug(param: string | number): number {
  if (typeof param === "number") return param;
  if (!param) return 0;
  const match = String(param).match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const parsed = parseInt(param, 10);
  return isNaN(parsed) ? 0 : parsed;
}
