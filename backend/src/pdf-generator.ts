import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define fonts
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

// Ensure statements directory exists
const STATEMENTS_DIR = path.join(process.cwd(), "statements");
if (!fs.existsSync(STATEMENTS_DIR)) {
  fs.mkdirSync(STATEMENTS_DIR, { recursive: true });
}

interface StatementData {
  investorName: string;
  investorEmail: string;
  type: string;
  period: string;
  year: number;
  investmentAmount?: string;
  currentValue?: string;
  returns?: string;
}

export async function generateStatementPDF(
  investorId: string,
  data: StatementData
): Promise<{ fileName: string; filePath: string; fileUrl: string; buffer: Buffer }> {
  const fileName = `${data.type}_${data.period.replace(/\s/g, "_")}_${data.year}_${investorId.substring(0, 8)}.pdf`;
  const filePath = path.join(STATEMENTS_DIR, fileName);
  const fileUrl = `/statements/${fileName}`;

  // Use require directly with exhaustive fallback attempts
  let PdfPrinter: any;
  const requirePaths = [
    "pdfmake/js/Printer",
    "pdfmake/src/Printer",
    "pdfmake",
    "pdfmake/build/pdfmake"
  ];

  for (const p of requirePaths) {
    try {
      const mod = require(p);
      console.log(`Checking require('${p}'). Type: ${typeof mod}`);

      // Try every common pattern
      if (typeof mod === 'function') {
        PdfPrinter = mod;
      } else if (mod && typeof mod.default === 'function') {
        PdfPrinter = mod.default;
      } else if (mod && typeof mod.Printer === 'function') {
        PdfPrinter = mod.Printer;
      }

      if (PdfPrinter) {
        console.log(`Successfully loaded PdfPrinter from '${p}'`);
        break;
      }
    } catch (e: any) {
      console.warn(`Failed require('${p}'): ${e.message}`);
    }
  }

  if (!PdfPrinter) {
    console.error("CRITICAL: All pdfmake loading attempts failed.");
  }

  // Create PDF document definition
  const docDefinition: any = {
    content: [
      {
        text: "GODMAN CAPITAL",
        style: "header",
        alignment: "center",
      },
      {
        text: "Investment Statement",
        style: "subheader",
        alignment: "center",
        margin: [0, 10, 0, 30],
      },
      {
        columns: [
          {
            width: "50%",
            text: [
              { text: "Investor: ", bold: true },
              data.investorName,
            ],
          },
          {
            width: "50%",
            text: [
              { text: "Email: ", bold: true },
              data.investorEmail,
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
        margin: [0, 10, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*"],
          body: [
            [
              { text: "Statement Details", colSpan: 2, style: "tableHeader", alignment: "center" },
              {},
            ],
            ["Statement Type", data.type.charAt(0).toUpperCase() + data.type.slice(1)],
            ["Period", data.period],
            ["Year", data.year.toString()],
            ["Date Generated", new Date().toLocaleDateString("en-IN")],
          ],
        },
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*"],
          body: [
            [
              { text: "Portfolio Summary", colSpan: 2, style: "tableHeader", alignment: "center" },
              {},
            ],
            ["Total Invested", data.investmentAmount ? `₹${Number(data.investmentAmount).toLocaleString("en-IN")}` : "N/A"],
            ["Current Value", data.currentValue ? `₹${Number(data.currentValue).toLocaleString("en-IN")}` : "N/A"],
            ["Returns", data.returns ? `${data.returns}%` : "N/A"],
          ],
        },
        margin: [0, 0, 0, 30],
      },
      {
        text: "This is a computer-generated statement and does not require a signature.",
        style: "footer",
        alignment: "center",
        margin: [0, 30, 0, 0],
      },
      {
        text: `Generated on ${new Date().toLocaleString("en-IN")}`,
        style: "footer",
        alignment: "center",
        margin: [0, 5, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        color: "#1a365d",
      },
      subheader: {
        fontSize: 16,
        color: "#4a5568",
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: "white",
        fillColor: "#2d3748",
      },
      footer: {
        fontSize: 10,
        color: "#718096",
        italics: true,
      },
    },
    defaultStyle: {
      fontSize: 11,
      font: "Helvetica"
    },
  };

  // Create PDF
  try {
    if (!PdfPrinter) throw new Error("PdfMake library not loaded");

    const printer = new PdfPrinter(fonts);
    let pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Handle compiled pdfmake / potential async implementation
    if (pdfDoc && typeof pdfDoc.then === 'function') {
      pdfDoc = await pdfDoc;
    }

    return new Promise((resolve, reject) => {
      const chunks: any[] = [];

      if (!pdfDoc || typeof pdfDoc.on !== "function") {
        // Should not happen after await, but safety check
        reject(new Error("pdfDoc is not a stream after creation"));
        return;
      }

      pdfDoc.on("data", (chunk: any) => chunks.push(chunk));
      pdfDoc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          fileName,
          filePath,
          fileUrl,
          buffer
        });
      });
      pdfDoc.on("error", (err: any) => reject(err));

      pdfDoc.end();
    });

  } catch (error) {
    console.error("PDF generation error [Primary]:", error);

    // Try reliable PDFKit fallback
    try {
      return await new Promise((resolve) => {
        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument();
        const chunks: any[] = [];

        doc.on('data', (chunk: any) => chunks.push(chunk));
        doc.on('end', () => {
          resolve({
            fileName,
            filePath,
            fileUrl,
            buffer: Buffer.concat(chunks)
          });
        });

        doc.fontSize(20).text("Statement Generation Failed", 100, 100);
        doc.fontSize(12).text("Please contact support. Error details have been logged.", 100, 140);
        doc.text("\nTechnical Error: " + (error instanceof Error ? error.message : String(error)));

        doc.end();
      });
    } catch (fallbackError) {
      console.error("PDF generation error [Fallback]:", fallbackError);

      const content = "BT /F1 12 Tf 50 750 Td (Critical Error: PDF generation completely failed) Tj ET";
      const streamLen = content.length;

      // Note: Offset calculation for xref is approximate but strict enough for simple readers if structure is simple
      // 1 0 obj (Catalog) -> 10
      // 2 0 obj (Pages) -> 60
      // 3 0 obj (Page) -> 117
      // 4 0 obj (Content) -> 206 (approx, assumes standard length of 3 0 obj)

      const minimalPdf = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R>> endobj
4 0 obj <</Length ${streamLen}>> stream
${content}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000206 00000 n 
trailer <</Size 5 /Root 1 0 R>>
startxref
342
%%EOF`;
      return { fileName, filePath, fileUrl, buffer: Buffer.from(minimalPdf) };
    }
  }
}

export function getStatementsDir(): string {
  return STATEMENTS_DIR;
}
