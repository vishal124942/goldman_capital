import multer from "multer";
import path from "path";
import fs from "fs";

// Upload directory for temporary files
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File filter to only accept Excel and PDF files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/pdf",
    "text/csv",
    "application/octet-stream", // Some browsers send this for xlsx files
  ];
  
  // Also check by file extension as fallback
  const allowedExtensions = [".xlsx", ".xls", ".csv", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  console.log(`Upload file: ${file.originalname}, mimetype: ${file.mimetype}, ext: ${ext}`);
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    console.error(`Rejected file: ${file.originalname} with mimetype: ${file.mimetype}`);
    cb(new Error("Invalid file type. Only Excel, CSV, and PDF files are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}
