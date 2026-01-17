import * as XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data for statement upload - using investor names instead of IDs
const sampleData = [
  {
    investorName: "Anuj Investor",
    type: "monthly",
    period: "January",
    year: 2025,
  },
  {
    investorName: "Anuj Investor",
    type: "monthly",
    period: "February",
    year: 2025,
  },
  {
    investorName: "Anuj Investor",
    type: "quarterly",
    period: "Q1",
    year: 2025,
  },
  {
    investorName: "Vishal Verma",
    type: "monthly",
    period: "January",
    year: 2025,
  },
  {
    investorName: "Vishal Verma",
    type: "annual",
    period: "Annual",
    year: 2024,
  },
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Set column widths for better readability
worksheet["!cols"] = [
  { wch: 25 }, // investorName
  { wch: 12 }, // type
  { wch: 12 }, // period
  { wch: 8 },  // year
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Statements");

// Write file
const outputPath = path.join(__dirname, "sample_statements_upload.xlsx");
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Sample Excel file created: ${outputPath}`);
console.log("");
console.log("Required columns:");
console.log("  - investorName: Full name of the investor (e.g., 'John Doe')");
console.log("  - type: monthly, quarterly, or annual");
console.log("  - period: e.g., 'January', 'Q1', 'Annual'");
console.log("  - year: e.g., 2025");
console.log("");
console.log("The system will automatically find the investor by matching the name.");
