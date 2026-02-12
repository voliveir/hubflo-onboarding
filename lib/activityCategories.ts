/**
 * Categories for activity groups and manual time blocks.
 * Used in timeline, list, and analytics (Lunch excluded from work hours when desired).
 */

export const ACTIVITY_GROUP_CATEGORIES = [
  { value: "", label: "No category" },
  { value: "call", label: "Call" },
  { value: "form", label: "Form" },
  { value: "smartdoc", label: "SmartDoc" },
  { value: "automation_integration", label: "Automation / Integration" },
  { value: "prep", label: "Prep" },
  { value: "setup", label: "Setup" },
  { value: "lunch", label: "Lunch" },
  { value: "other", label: "Other" },
] as const

export type ActivityGroupCategory = (typeof ACTIVITY_GROUP_CATEGORIES)[number]["value"]

/** Categories that add +1 to the client's project tracking when assigned */
export const PROJECT_TRACKING_CATEGORIES = [
  "call",
  "form",
  "smartdoc",
  "automation_integration",
] as const

export const MANUAL_BLOCK_CATEGORIES = [
  { value: "lunch", label: "Lunch" },
  { value: "break", label: "Break" },
  { value: "other", label: "Other" },
] as const

/** Categories that should be excluded from "work hours" in analytics (non-billable) */
export const NON_WORK_CATEGORIES = ["lunch", "break"]

export function isNonWorkCategory(category: string | null | undefined): boolean {
  if (!category) return false
  return NON_WORK_CATEGORIES.includes(category.toLowerCase())
}

export function getCategoryLabel(
  value: string | null | undefined,
  list: readonly { value: string; label: string }[]
): string {
  if (!value) return ""
  const found = list.find((c) => c.value === value)
  return found?.label ?? value
}

/** Colors for timeline bar and list by category (inline-style friendly) */
export const CATEGORY_COLORS: Record<
  string,
  { bar: string; barMuted: string; border: string; bg: string; bgMuted: string }
> = {
  call: {
    bar: "rgb(59 130 246)",
    barMuted: "rgba(59, 130, 246, 0.5)",
    border: "rgb(96 165 250)",
    bg: "rgba(239, 246, 255, 1)",
    bgMuted: "rgba(239, 246, 255, 0.6)",
  },
  automation_integration: {
    bar: "rgb(139 92 246)",
    barMuted: "rgba(139, 92, 246, 0.5)",
    border: "rgb(167 139 250)",
    bg: "rgba(245, 243, 255, 1)",
    bgMuted: "rgba(245, 243, 255, 0.6)",
  },
  form: {
    bar: "rgb(34 197 94)",
    barMuted: "rgba(34, 197, 94, 0.5)",
    border: "rgb(74 222 128)",
    bg: "rgba(240, 253, 244, 1)",
    bgMuted: "rgba(240, 253, 244, 0.6)",
  },
  smartdoc: {
    bar: "rgb(6 182 212)",
    barMuted: "rgba(6, 182, 212, 0.5)",
    border: "rgb(34 211 238)",
    bg: "rgba(236, 254, 255, 1)",
    bgMuted: "rgba(236, 254, 255, 0.6)",
  },
  prep: {
    bar: "rgb(245 158 11)",
    barMuted: "rgba(245, 158, 11, 0.5)",
    border: "rgb(251 191 36)",
    bg: "rgba(255, 251, 235, 1)",
    bgMuted: "rgba(255, 251, 235, 0.6)",
  },
  setup: {
    bar: "rgb(20 184 166)",
    barMuted: "rgba(20, 184, 166, 0.5)",
    border: "rgb(45 212 191)",
    bg: "rgba(240, 253, 250, 1)",
    bgMuted: "rgba(240, 253, 250, 0.6)",
  },
  lunch: {
    bar: "rgb(107 114 128)",
    barMuted: "rgba(107, 114, 128, 0.5)",
    border: "rgb(156 163 175)",
    bg: "rgba(243, 244, 246, 1)",
    bgMuted: "rgba(243, 244, 246, 0.6)",
  },
  other: {
    bar: "rgb(212 175 55)",
    barMuted: "rgba(212, 175, 55, 0.5)",
    border: "rgb(217 119 6)",
    bg: "rgba(255, 251, 235, 0.9)",
    bgMuted: "rgba(255, 251, 235, 0.5)",
  },
}

const DEFAULT_CATEGORY_COLOR = {
  bar: "var(--brand-gold, #d4af37)",
  barMuted: "rgba(212, 175, 55, 0.5)",
  border: "rgba(212, 175, 55, 0.8)",
  bg: "rgba(212, 175, 55, 0.08)",
  bgMuted: "rgba(212, 175, 55, 0.04)",
}

export function getCategoryColor(category: string | null | undefined) {
  if (!category) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR
}
