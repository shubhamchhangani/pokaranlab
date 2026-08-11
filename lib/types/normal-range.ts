/**
 * Shape of `tests.normal_range_template` (jsonb). Decided here once so the admin test form,
 * report entry auto-fill, and the auto High/Low flagging logic all agree on it — see
 * docs/database-schema.md.
 */
export type NormalRangeTemplate =
  | { type: "numeric"; low: number; high: number; unit: string }
  | { type: "text"; display: string }
  | { type: "panel"; parameters: PanelParameter[] }
  | null;

/**
 * One line of a multi-parameter test (e.g. CBC's Hemoglobin, WBC Count, Platelet Count, ...).
 * A `panel`-type NormalRangeTemplate holds a list of these; each one expands into its own row
 * in report entry (`components/admin/ReportForm.tsx`), reusing the same numeric/text
 * flagging logic as a single-value test — see `panelParameterTemplate` below.
 */
export type PanelParameter =
  | { type: "numeric"; name: string; unit: string; low: number; high: number }
  | { type: "text"; name: string; display: string };

/** Reduces a panel parameter to the same shape as a single-value template, for reuse in flagResult/normalRangeDisplay. */
export function panelParameterTemplate(param: PanelParameter): NormalRangeTemplate {
  return param.type === "numeric"
    ? { type: "numeric", low: param.low, high: param.high, unit: param.unit }
    : { type: "text", display: param.display };
}

export function normalRangeDisplay(template: NormalRangeTemplate): string {
  if (!template) return "";
  if (template.type === "numeric") {
    return `${template.low}–${template.high}${template.unit ? ` ${template.unit}` : ""}`;
  }
  if (template.type === "panel") {
    return `Panel (${template.parameters.length} parameters)`;
  }
  return template.display;
}

/** Compares a result value against a numeric template; text/panel/none templates are never auto-flagged. */
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
