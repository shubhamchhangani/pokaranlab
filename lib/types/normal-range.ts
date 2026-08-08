/**
 * Shape of `tests.normal_range_template` (jsonb). Decided here once so the admin test form,
 * report entry auto-fill, and the auto High/Low flagging logic all agree on it — see
 * docs/database-schema.md.
 */
export type NormalRangeTemplate =
  | { type: "numeric"; low: number; high: number; unit: string }
  | { type: "text"; display: string }
  | null;

export function normalRangeDisplay(template: NormalRangeTemplate): string {
  if (!template) return "";
  if (template.type === "numeric") {
    return `${template.low}–${template.high}${template.unit ? ` ${template.unit}` : ""}`;
  }
  return template.display;
}

/** Compares a result value against a numeric template; text/none templates are never auto-flagged. */
export function flagResult(
  template: NormalRangeTemplate,
  resultValue: string
): "low" | "normal" | "high" | null {
  if (!template || template.type !== "numeric") return null;
  const value = Number(resultValue);
  if (Number.isNaN(value)) return null;
  if (value < template.low) return "low";
  if (value > template.high) return "high";
  return "normal";
}
