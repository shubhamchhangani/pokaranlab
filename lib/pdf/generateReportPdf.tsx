import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument, type ReportPdfData, type ReportResultRow, type ReportSiteInfo } from "./ReportDocument";

export async function generateReportPdf(
  report: ReportPdfData,
  results: ReportResultRow[],
  siteInfo: ReportSiteInfo
): Promise<Buffer> {
  return renderToBuffer(
    <ReportDocument report={report} results={results} siteInfo={siteInfo} />
  );
}
