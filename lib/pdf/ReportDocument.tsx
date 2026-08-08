import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 16, borderBottom: 2, borderColor: "#1B2A4A", paddingBottom: 10 },
  labName: { fontSize: 16, fontWeight: 700, color: "#1B2A4A" },
  labMeta: { fontSize: 9, color: "#2C2C2A", marginTop: 2 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  patientBlock: { marginTop: 8, marginBottom: 16, borderBottom: 1, borderColor: "#ccc", paddingBottom: 10 },
  table: { marginTop: 8 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#1B2A4A", padding: 6 },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: 1, borderColor: "#eee" },
  colTest: { flex: 2 },
  colResult: { flex: 1, textAlign: "center" },
  colRange: { flex: 1.5, textAlign: "center" },
  headerText: { color: "#FAF7F1", fontWeight: 700, fontSize: 9 },
  flagHigh: { color: "#B91C1C", fontWeight: 700 },
  flagLow: { color: "#B91C1C", fontWeight: 700 },
  signature: { marginTop: 40, flexDirection: "row", justifyContent: "flex-end" },
  signatureBox: { textAlign: "center", borderTop: 1, borderColor: "#000", paddingTop: 4, width: 160 },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, borderTop: 1, borderColor: "#ccc", paddingTop: 8, fontSize: 8, color: "#555" },
  disclaimer: { marginTop: 4, fontStyle: "italic" },
});

export type ReportPdfData = {
  sample_no: string;
  patient_name: string;
  age: string | null;
  sex: string | null;
  ref_by_doctor: string | null;
  sample_received_date: string | null;
  reporting_date: string | null;
  technician_name: string | null;
};

export type ReportResultRow = {
  test_name: string;
  result_value: string;
  normal_range: string | null;
  flag: string | null;
};

export type ReportSiteInfo = {
  name_en: string;
  address_en: string;
  phone: string;
};

export function ReportDocument({
  report,
  results,
  siteInfo,
}: {
  report: ReportPdfData;
  results: ReportResultRow[];
  siteInfo: ReportSiteInfo;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.labName}>{siteInfo.name_en}</Text>
          <Text style={styles.labMeta}>{siteInfo.address_en}</Text>
          <Text style={styles.labMeta}>{siteInfo.phone}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text>Sample No: {report.sample_no}</Text>
          <Text>Sample Received: {report.sample_received_date ?? "—"}</Text>
          <Text>Reporting Date: {report.reporting_date ?? "—"}</Text>
        </View>

        <View style={styles.patientBlock}>
          <View style={styles.metaRow}>
            <Text>Patient Name: {report.patient_name}</Text>
            <Text>Age: {report.age ?? "—"}</Text>
            <Text>Sex: {report.sex ?? "—"}</Text>
          </View>
          <Text style={{ marginTop: 4 }}>Ref. By: {report.ref_by_doctor || "Self"}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colTest, styles.headerText]}>Test</Text>
            <Text style={[styles.colResult, styles.headerText]}>Result</Text>
            <Text style={[styles.colRange, styles.headerText]}>Normal Value</Text>
          </View>
          {results.map((row, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colTest}>{row.test_name}</Text>
              <Text
                style={[
                  styles.colResult,
                  row.flag === "high" ? styles.flagHigh : row.flag === "low" ? styles.flagLow : {},
                ]}
              >
                {row.result_value}
                {row.flag === "high" ? " H" : row.flag === "low" ? " L" : ""}
              </Text>
              <Text style={styles.colRange}>{row.normal_range ?? "—"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text>{report.technician_name || "Technician"}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>All type of blood investigation | Digital X-ray | E.C.G.</Text>
          <Text>{siteInfo.phone}</Text>
          <Text style={styles.disclaimer}>Not valid for medico-legal cases.</Text>
        </View>
      </Page>
    </Document>
  );
}
