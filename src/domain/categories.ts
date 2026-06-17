import type { Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-dining", key: "dining", label: "\u9910\u996e", sortOrder: 10 },
  { id: "cat-groceries-daily", key: "groceries_daily", label: "\u8d85\u5e02\u65e5\u7528", sortOrder: 20 },
  { id: "cat-rent-utilities", key: "rent_utilities", label: "\u623f\u79df\u6c34\u7535", sortOrder: 30 },
  { id: "cat-transport", key: "transport", label: "\u4ea4\u901a", sortOrder: 40 },
  { id: "cat-entertainment", key: "entertainment", label: "\u5a31\u4e50", sortOrder: 50 },
  { id: "cat-medical", key: "medical", label: "\u533b\u7597", sortOrder: 60 },
  { id: "cat-travel", key: "travel", label: "\u65c5\u884c", sortOrder: 70 },
  { id: "cat-other", key: "other", label: "\u5176\u4ed6", sortOrder: 80 },
];

export function getCategoryLabel(categoryId: string, categories = DEFAULT_CATEGORIES): string {
  return categories.find((category) => category.id === categoryId)?.label ?? "\u5176\u4ed6";
}
