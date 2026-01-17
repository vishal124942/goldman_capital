import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

import { registerRoutes } from "./routes.js";

const app = express();
const httpServer = createServer(app);

// CORS configuration for frontend
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://goldman-capital.vercel.app"
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,  // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve generated statement PDFs
app.use("/statements", express.static(path.join(process.cwd(), "statements")));

// Logging middleware
function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (reqPath.startsWith("/api")) {
            let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                const responseStr = JSON.stringify(capturedJsonResponse);
                logLine += ` :: ${responseStr.substring(0, 200)}${responseStr.length > 200 ? '...' : ''}`;
            }
            log(logLine);
        }
    });

    next();
});

// Register all routes
(async () => {
    await registerRoutes(httpServer, app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Error:", err);
        res.status(status).json({ message });
    });

    const port = parseInt(process.env.PORT || "3001", 10);
    httpServer.listen(
        {
            port,
            host: "0.0.0.0",
        },
        () => {
            log(`Backend API server running on port ${port}`);
            log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
        },
    );
})();
