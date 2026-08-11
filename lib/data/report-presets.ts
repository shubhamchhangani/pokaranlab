import type { PanelParameter } from "@/lib/types/normal-range";

/**
 * Starting parameter lists for common multi-parameter tests, so staff aren't typing out ~15
 * rows by hand every time they set up a CBC or LFT. Selecting one from `TestForm`'s "Load
 * preset" dropdown fills the panel editor, which is then fully editable/removable before
 * saving — nothing here is written to the database until the admin explicitly saves.
 *
 * Values are commonly-published general adult reference ranges (the kind printed on most small
 * diagnostic lab report formats in India), NOT this lab's calibrated equipment ranges — normal
 * ranges vary by analyzer/reagent/lab. Verify against Pokaran Lab's actual equipment before
 * relying on the auto-generated High/Low flag for real patient reports; every value stays
 * editable per-report in `ReportForm` regardless.
 */
export type ReportPreset = {
  id: string;
  label: string;
  parameters: PanelParameter[];
};

export const REPORT_PRESETS: ReportPreset[] = [
  {
    id: "cbc",
    label: "CBC (Complete Blood Count)",
    parameters: [
      { type: "numeric", name: "Hemoglobin (Hb)", unit: "g/dL", low: 12.0, high: 16.0 },
      { type: "numeric", name: "Total WBC Count", unit: "/cumm", low: 4000, high: 11000 },
      { type: "numeric", name: "RBC Count", unit: "million/cumm", low: 4.5, high: 5.5 },
      { type: "numeric", name: "Platelet Count", unit: "/cumm", low: 150000, high: 450000 },
      { type: "numeric", name: "Hematocrit (PCV)", unit: "%", low: 36, high: 46 },
      { type: "numeric", name: "MCV", unit: "fL", low: 80, high: 100 },
      { type: "numeric", name: "MCH", unit: "pg", low: 27, high: 32 },
      { type: "numeric", name: "MCHC", unit: "g/dL", low: 32, high: 36 },
      { type: "numeric", name: "Neutrophils", unit: "%", low: 40, high: 75 },
      { type: "numeric", name: "Lymphocytes", unit: "%", low: 20, high: 45 },
      { type: "numeric", name: "Eosinophils", unit: "%", low: 1, high: 6 },
      { type: "numeric", name: "Monocytes", unit: "%", low: 2, high: 10 },
      { type: "numeric", name: "Basophils", unit: "%", low: 0, high: 1 },
      { type: "numeric", name: "ESR", unit: "mm/hr", low: 0, high: 20 },
    ],
  },
  {
    id: "diabetes-profile",
    label: "Diabetes Profile (HbA1c + Blood Sugar)",
    parameters: [
      { type: "numeric", name: "HbA1c", unit: "%", low: 4.0, high: 5.6 },
      { type: "numeric", name: "Fasting Blood Sugar", unit: "mg/dL", low: 70, high: 100 },
      { type: "numeric", name: "Postprandial Blood Sugar (PP)", unit: "mg/dL", low: 70, high: 140 },
    ],
  },
  {
    id: "malaria",
    label: "Malaria (MP Smear / Antigen)",
    parameters: [
      { type: "text", name: "Malaria Parasite (P. vivax)", display: "Negative" },
      { type: "text", name: "Malaria Parasite (P. falciparum)", display: "Negative" },
      { type: "text", name: "Malarial Antigen Test", display: "Negative" },
    ],
  },
  {
    id: "urine-routine",
    label: "Urine Routine & Microscopy",
    parameters: [
      { type: "text", name: "Colour", display: "Pale Yellow" },
      { type: "text", name: "Appearance", display: "Clear" },
      { type: "numeric", name: "pH", unit: "", low: 4.5, high: 8.0 },
      { type: "numeric", name: "Specific Gravity", unit: "", low: 1.003, high: 1.03 },
      { type: "text", name: "Protein (Albumin)", display: "Nil" },
      { type: "text", name: "Glucose", display: "Nil" },
      { type: "text", name: "Ketone Bodies", display: "Nil" },
      { type: "text", name: "Bilirubin", display: "Nil" },
      { type: "text", name: "Urobilinogen", display: "Normal" },
      { type: "numeric", name: "Pus Cells (WBC)", unit: "/hpf", low: 0, high: 5 },
      { type: "numeric", name: "RBCs", unit: "/hpf", low: 0, high: 2 },
      { type: "text", name: "Epithelial Cells", display: "Few" },
      { type: "text", name: "Casts", display: "Nil" },
      { type: "text", name: "Crystals", display: "Nil" },
    ],
  },
  {
    id: "lipid-profile",
    label: "Lipid Profile",
    parameters: [
      { type: "numeric", name: "Total Cholesterol", unit: "mg/dL", low: 0, high: 200 },
      { type: "numeric", name: "Triglycerides", unit: "mg/dL", low: 0, high: 150 },
      { type: "numeric", name: "HDL Cholesterol", unit: "mg/dL", low: 40, high: 60 },
      { type: "numeric", name: "LDL Cholesterol", unit: "mg/dL", low: 0, high: 100 },
      { type: "numeric", name: "VLDL Cholesterol", unit: "mg/dL", low: 5, high: 30 },
      { type: "numeric", name: "Total Cholesterol / HDL Ratio", unit: "", low: 0, high: 5 },
    ],
  },
  {
    id: "lft",
    label: "Liver Function Test (LFT)",
    parameters: [
      { type: "numeric", name: "Total Bilirubin", unit: "mg/dL", low: 0.3, high: 1.2 },
      { type: "numeric", name: "Direct Bilirubin", unit: "mg/dL", low: 0.1, high: 0.3 },
      { type: "numeric", name: "Indirect Bilirubin", unit: "mg/dL", low: 0.2, high: 0.9 },
      { type: "numeric", name: "SGOT (AST)", unit: "U/L", low: 5, high: 40 },
      { type: "numeric", name: "SGPT (ALT)", unit: "U/L", low: 7, high: 56 },
      { type: "numeric", name: "Alkaline Phosphatase (ALP)", unit: "U/L", low: 44, high: 147 },
      { type: "numeric", name: "Total Protein", unit: "g/dL", low: 6.0, high: 8.3 },
      { type: "numeric", name: "Albumin", unit: "g/dL", low: 3.5, high: 5.0 },
      { type: "numeric", name: "Globulin", unit: "g/dL", low: 2.0, high: 3.5 },
      { type: "numeric", name: "A/G Ratio", unit: "", low: 1.0, high: 2.5 },
    ],
  },
  {
    id: "kft",
    label: "Kidney Function Test (KFT/RFT)",
    parameters: [
      { type: "numeric", name: "Blood Urea", unit: "mg/dL", low: 15, high: 40 },
      { type: "numeric", name: "Serum Creatinine", unit: "mg/dL", low: 0.6, high: 1.3 },
      { type: "numeric", name: "Uric Acid", unit: "mg/dL", low: 3.5, high: 7.2 },
      { type: "numeric", name: "Sodium", unit: "mEq/L", low: 135, high: 145 },
      { type: "numeric", name: "Potassium", unit: "mEq/L", low: 3.5, high: 5.1 },
      { type: "numeric", name: "Chloride", unit: "mEq/L", low: 96, high: 106 },
    ],
  },
  {
    id: "thyroid-profile",
    label: "Thyroid Profile (T3, T4, TSH)",
    parameters: [
      { type: "numeric", name: "Total T3", unit: "ng/dL", low: 80, high: 200 },
      { type: "numeric", name: "Total T4", unit: "µg/dL", low: 5.0, high: 12.0 },
      { type: "numeric", name: "TSH", unit: "µIU/mL", low: 0.4, high: 4.0 },
    ],
  },
];
