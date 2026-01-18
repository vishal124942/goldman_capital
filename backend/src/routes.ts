import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateAndSendOtp,
  verifyOtp,
  authenticateJWT
} from "./auth";
import { sendContactInquiryEmail } from "./mail";
import { upload } from "./upload";

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  authenticateJWT(req, res, () => next());
};

const requireInvestor = async (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const investorProfile = await storage.getInvestorProfile(user.id);
  if (!investorProfile) return res.status(403).json({ message: "Investor access required" });

  (req as any).investorProfile = investorProfile;
  next();
};

const requireAdmin = async (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const adminUser = await storage.getAdminUser(user.id);
  if (!adminUser) return res.status(403).json({ message: "Admin access required" });

  (req as any).adminUser = adminUser;
  next();
};

const requireSuperAdmin = async (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const adminUser = await storage.getAdminUser(user.id);
  if (!adminUser || adminUser.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }

  (req as any).adminUser = adminUser;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Authentication Routes
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      console.log("[LOGIN] Request received");
      const { email, password } = req.body;

      if (!email || !email.includes("@")) {
        console.log("[LOGIN] Invalid email format");
        return res.status(400).json({ message: "Valid email is required" });
      }

      console.log("[LOGIN] Looking up user:", email);
      const user = await storage.getUserByEmail(email);

      if (!user || !user.password) {
        console.log("[LOGIN] User not found or no password");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("[LOGIN] Comparing password");
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        console.log("[LOGIN] Password mismatch");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const userId = (user as any)._id || (user as any).id;
      console.log("[LOGIN] Generating OTP for userId:", userId);
      await generateAndSendOtp(userId, email, "email");

      console.log("[LOGIN] OTP sent successfully");
      res.json({ message: "OTP sent successfully", tempUserId: userId });
    } catch (error: any) {
      console.error("[LOGIN] CRITICAL ERROR:", error.message);
      console.error("[LOGIN] Stack trace:", error.stack);
      res.status(500).json({ message: "Failed to login", details: error.message });
    }
  });

  app.post("/api/verify-otp", async (req: Request, res: Response) => {
    try {
      const { tempUserId, code } = req.body;
      const isValid = await verifyOtp(tempUserId, code);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      const user = await storage.getUser(tempUserId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const adminUser = await storage.getAdminUser(tempUserId);
      const role = adminUser ? adminUser.role : "investor";

      const token = generateToken({ ...user, role });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user: { ...user, role }, token });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  app.get("/api/auth/user", authenticateJWT, async (req: Request, res: Response) => {
    try {
      const jwtUser = (req as any).user;
      const user = await storage.getUser(jwtUser.id);
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const adminUser = await storage.getAdminUser(user.id);
      const role = adminUser ? adminUser.role : "investor";

      res.json({ ...user, role });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/user/role", authenticateJWT, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user.id;

      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const adminUser = await storage.getAdminUser(userId);
      const investorProfile = await storage.getInvestorProfile(userId);

      let role = "user";
      if (adminUser) {
        role = adminUser.role === "super_admin" ? "super_admin" : "admin";
      } else if (investorProfile) {
        role = "investor";
      }

      res.json({
        role,
        investorId: investorProfile?.id || null,
        adminId: adminUser?.id || null,
        isSuperAdmin: adminUser?.role === "super_admin" || false,
      });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional(),
        investmentRange: z.string().optional(),
        message: z.string().min(10),
      });

      const data = schema.parse(req.body);
      const lead = await storage.createLeadCapture({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        investmentRange: data.investmentRange || null,
        message: data.message || null,
        source: "website",
        status: "new",
      });

      res.status(201).json(lead);

      // Send email notification
      await sendContactInquiryEmail(data).catch(err => console.error("Contact email failed:", err));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Lead capture error:", error);
      res.status(500).json({ message: "Failed to submit lead" });
    }
  });

  app.get("/api/announcements", async (req: Request, res: Response) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ message: "Failed to get announcements" });
    }
  });

  // ==================== INVESTOR ENDPOINTS ====================

  app.get("/api/investor/dashboard", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const portfolio = await storage.getPortfolio(investorProfile._id);
      const recentTransactions = await storage.getTransactions(investorProfile._id);
      const announcements = await storage.getActiveAnnouncements();

      res.json({
        profile: investorProfile,
        portfolio: portfolio || { totalInvested: "0", currentValue: "0", returns: "0", irr: "0" },
        recentTransactions: recentTransactions.slice(0, 5),
        announcements: announcements.slice(0, 3),
      });
    } catch (error) {
      console.error("Get investor dashboard error:", error);
      res.status(500).json({ message: "Failed to get dashboard" });
    }
  });

  app.get("/api/investor/profile", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      res.json((req as any).investorProfile);
    } catch (error) {
      console.error("Get investor profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.put("/api/investor/profile", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const schema = z.object({
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateInvestorProfile(investorProfile._id, data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update investor profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });



  app.get("/api/investor/allocations", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const portfolio = await storage.getPortfolio(investorProfile._id);

      if (!portfolio) {
        return res.json([]);
      }

      const allocations = await storage.getAllocations(portfolio._id);
      res.json(allocations);
    } catch (error) {
      console.error("Get allocations error:", error);
      res.status(500).json({ message: "Failed to get allocations" });
    }
  });

  app.get("/api/investor/transactions", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const transactions = await storage.getTransactions(investorProfile._id);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  app.post("/api/investor/transactions/upload-confirmation", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const schema = z.object({
        transactionId: z.string(),
        confirmationUrl: z.string(),
      });

      const data = schema.parse(req.body);
      const transaction = await storage.getTransactionById(data.transactionId);

      if (!transaction || transaction.investorId !== investorProfile._id) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const updated = await storage.updateTransaction(data.transactionId, {
        confirmationUrl: data.confirmationUrl,
        status: "pending_verification",
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Upload confirmation error:", error);
      res.status(500).json({ message: "Failed to upload confirmation" });
    }
  });



  app.get("/api/investor/statements/:id/download", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const statement = await storage.getStatementById(req.params.id as string);

      if (!statement || statement.investorId !== investorProfile._id) {
        return res.status(404).json({ message: "Statement not found" });
      }

      // 1. Check if content is stored directly in DB (Buffer)
      if (statement.fileContent) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${statement.fileName}"`);
        return res.send(statement.fileContent);
      }

      // 2. Check for local file
      // We need to dynamically import or use path joining if getStatementsDir isn't available in scope
      // Assuming simple path usage for now based on fileUrl or common 'statements' dir
      const fs = require('fs');
      const path = require('path');
      const STATEMENTS_DIR = path.join(process.cwd(), "statements");

      const filePath = path.join(STATEMENTS_DIR, statement.fileName);

      if (fs.existsSync(filePath)) {
        return res.download(filePath, statement.fileName);
      }

      // 3. Fallback: Check if fileUrl is actually a public URL (e.g. S3)
      if (statement.fileUrl && statement.fileUrl.startsWith("http")) {
        return res.redirect(statement.fileUrl);
      }

      console.error("File found in DB record but not on disk:", filePath);
      return res.status(404).json({ message: "File not found on server" });

    } catch (error) {
      console.error("Download statement error:", error);
      res.status(500).json({ message: "Failed to download statement" });
    }
  });

  app.get("/api/investor/requests", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const requests = await storage.getSupportRequests(investorProfile._id);
      res.json(requests);
    } catch (error) {
      console.error("Get requests error:", error);
      res.status(500).json({ message: "Failed to get requests" });
    }
  });

  app.post("/api/investor/requests", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const schema = z.object({
        type: z.string().min(1),
        subject: z.string().min(5),
        description: z.string().min(20),
        priority: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const request = await storage.createSupportRequest({
        investorId: investorProfile._id,
        type: data.type,
        subject: data.subject,
        description: data.description,
        status: "open",
        priority: data.priority || "normal",
      });

      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create request error:", error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.put("/api/investor/requests/:id", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const existing = await storage.getSupportRequestById(req.params.id as string);

      if (!existing || existing.investorId !== investorProfile._id) {
        return res.status(404).json({ message: "Request not found" });
      }

      const schema = z.object({
        description: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateSupportRequest(req.params.id as string, data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update request error:", error);
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  // Investor Dashboard Data
  app.get("/api/investor/dashboard", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const portfolio = await storage.getPortfolio(investorProfile._id);
      const transactions = await storage.getTransactions(investorProfile._id);
      const announcements = await storage.getActiveAnnouncements();

      res.json({
        profile: investorProfile,
        portfolio,
        recentTransactions: transactions.slice(0, 5),
        announcements: announcements.slice(0, 3),
      });
    } catch (error) {
      console.error("Get dashboard data error:", error);
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  // Investor Portfolio Data
  app.get("/api/investor/portfolio", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const portfolio = await storage.getPortfolio(investorProfile._id);

      if (!portfolio) {
        return res.json(null);
      }

      const allocations = await storage.getAllocations(portfolio._id);
      res.json({ ...portfolio, allocations });
    } catch (error) {
      console.error("Get portfolio error:", error);
      res.status(500).json({ message: "Failed to get portfolio" });
    }
  });

  app.get("/api/investor/notifications", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const notifications = await storage.getNotifications(investorProfile._id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.put("/api/investor/notifications/:id/read", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      await storage.markNotificationRead(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Announcement read tracking for investors
  app.get("/api/investor/unread-announcements", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const count = await storage.getUnreadAnnouncementCount(investorProfile._id);
      res.json({ count });
    } catch (error) {
      console.error("Get unread announcements count error:", error);
      res.status(500).json({ message: "Failed to get unread announcements count" });
    }
  });

  // Investor Support Requests
  app.get("/api/investor/support-requests", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const investorProfile = await storage.getInvestorProfile(user.id);

      if (!investorProfile) {
        return res.json([]);
      }

      const requests = await storage.getSupportRequests(investorProfile._id);
      res.json(requests);
    } catch (error) {
      console.error("Get investor support requests error:", error);
      res.status(500).json({ message: "Failed to get support requests" });
    }
  });

  app.post("/api/investor/announcements/mark-all-read", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const announcements = await storage.getActiveAnnouncements();

      // Mark all active announcements as read for this investor
      await Promise.all(
        announcements.map(announcement =>
          storage.markAnnouncementAsRead(announcement._id, investorProfile._id)
        )
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Mark all announcements read error:", error);
      res.status(500).json({ message: "Failed to mark announcements as read" });
    }
  });

  // ==================== ADMIN ENDPOINTS ====================

  // Admin Notification Counts
  app.get("/api/admin/notifications/counts", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const ticketsCount = await storage.getOpenSupportRequestsCount();
      const announcementsCount = await storage.getActiveAdminAnnouncementsCount();
      res.json({ tickets: ticketsCount, announcements: announcementsCount });
    } catch (error) {
      console.error("Get notification counts error:", error);
      res.status(500).json({ message: "Failed to get notification counts" });
    }
  });

  // Admin Stats (New)
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const statements = await storage.getAllStatements();
      // Assuming 'status' field might be missing or optional, we check logic or default
      // If Statement schema doesn't have status, we might need to add it or infer it.
      // For now, let's assume if it exists we count 'pending'.
      const pendingStatements = statements.filter(s => (s as any).status === 'pending').length;

      // Also get real allocation data if possible, or leave it for specific reports API
      res.json({
        pendingStatements
      });

    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  // System Settings (New)
  app.get("/api/system/settings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSystemSettings();
      // Transform to object for easier frontend consumption
      const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);

      res.json(settingsMap);
    } catch (error) {
      console.error("Get system settings error:", error);
      res.status(500).json({ message: "Failed to get system settings" });
    }
  });

  app.put("/api/admin/support-requests/:id/status", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!["open", "resolved", "closed", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedRequest = await storage.updateSupportRequest(id, {
        status,
        updatedAt: new Date(),
        resolvedAt: (status === "resolved" || status === "closed") ? new Date() : undefined
      });

      if (!updatedRequest) {
        return res.status(404).json({ message: "Support request not found" });
      }

      const investor = await storage.getInvestorProfileById(updatedRequest.investorId);
      const enrichedRequest = {
        ...updatedRequest,
        investorName: investor ? `${investor.firstName} ${investor.lastName}` : "Unknown Investor",
        email: investor ? investor.email : "",
      };

      res.json(enrichedRequest);
    } catch (error) {
      console.error("Update support request status error:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.get("/api/admin/support-requests", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const requests = await storage.getAllSupportRequests();

      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const investor = await storage.getInvestorProfileById(request.investorId);
          return {
            ...request, // request is a lean object if getAllSupportRequests uses lean(), otherwise .toObject() or spread might copy Mongoose internals. Assuming lean()
            investorName: investor ? `${investor.firstName} ${investor.lastName}` : "Unknown Investor",
            email: investor ? investor.email : "",
          };
        })
      );

      res.json(enrichedRequests);
    } catch (error) {
      console.error("Get admin support requests error:", error);
      res.status(500).json({ message: "Failed to get support requests" });
    }
  });

  app.get("/api/admin/investors", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const investors = await storage.getAllInvestors();
      const investorsWithPortfolios = await Promise.all(
        investors.map(async (investor) => {
          const investorId = (investor as any)._id;
          const portfolios = await storage.getPortfoliosByInvestorId(investorId);
          return {
            ...investor,
            id: investorId,
            portfolio: portfolios[0] || null,
          };
        })
      );
      res.json(investorsWithPortfolios);
    } catch (error) {
      console.error("Get investors error:", error);
      res.status(500).json({ message: "Failed to get investors" });
    }
  });

  // Investor handling - Allow both Admin and Super Admin to create investors
  app.post("/api/investors", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        panNumber: z.string().optional(),
        investmentAmount: z.string().optional(),
        investorType: z.string().optional(),
        password: z.string().optional(),
        confirmPassword: z.string().optional()
      }).refine((data) => {
        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
          return false;
        }
        return true;
      }, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });

      const data = schema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Generate or use provided password
      const password = data.password || `GC${Math.random().toString(36).substring(2, 8).toUpperCase()}@2025`;
      const hashedPassword = await hashPassword(password);

      // Create User Record first
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || "",
      });

      // Create Investor Profile linked to User
      const investorProfile = await storage.createInvestorProfile({
        userId: user._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || "",
        panNumber: data.panNumber || "",
        kycStatus: "pending",
        investorType: data.investorType || "individual",
      });

      if (investorProfile) {
        await storage.createPortfolio({
          investorId: investorProfile._id,
          totalInvested: data.investmentAmount || "0",
          currentValue: data.investmentAmount || "0",
          returns: "0",
          irr: "0",
        });
      }

      res.status(201).json({
        ...investorProfile,
        credentials: {
          email: data.email,
          tempPassword: password, // Return password so admin can see it (if generated or manual) - typically only once
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create investor error:", error);
      res.status(500).json({ message: "Failed to create investor" });
    }
  });

  app.post("/api/admin/investors", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        panNumber: z.string().optional(),
        investmentAmount: z.string().optional(),
        investorType: z.string().optional(),
        password: z.string().optional(),
        confirmPassword: z.string().optional()
      }).refine((data) => {
        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
          return false;
        }
        return true;
      }, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });

      const data = schema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      if (data.phone) {
        const existingPhone = await storage.getUserByPhone(data.phone);
        if (existingPhone) {
          return res.status(400).json({ message: "User with this phone number already exists" });
        }
      }

      // Generate or use provided password
      const password = data.password || `GC${Math.random().toString(36).substring(2, 8).toUpperCase()}@2025`;
      const hashedPassword = await hashPassword(password);

      // Create User Record first
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });

      // Create Investor Profile linked to User
      const investorProfile = await storage.createInvestorProfile({
        userId: user._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        panNumber: data.panNumber || "",
        kycStatus: "pending",
        investorType: data.investorType || "individual",
      });

      if (investorProfile) {
        await storage.createPortfolio({
          investorId: investorProfile._id,
          totalInvested: data.investmentAmount || "0",
          currentValue: data.investmentAmount || "0",
          returns: "0",
          irr: "0",
        });
      }

      res.status(201).json({
        ...investorProfile,
        credentials: {
          email: data.email,
          tempPassword: password, // Return password so admin can see it (if generated or manual) - typically only once
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create investor error:", error);
      res.status(500).json({ message: "Failed to create investor" });
    }
  });

  app.get("/api/admin/investors/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const investor = await storage.getInvestorProfileById(req.params.id as string);
      if (!investor) {
        return res.status(404).json({ message: "Investor not found" });
      }

      const portfolios = await storage.getPortfoliosByInvestorId(investor.id);
      res.json({ ...investor, portfolio: portfolios[0] || null });
    } catch (error) {
      console.error("Get investor error:", error);
      res.status(500).json({ message: "Failed to get investor" });
    }
  });

  app.put("/api/admin/investors/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        kycStatus: z.string().optional(),
        investorType: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateInvestorProfile(req.params.id as string, data);

      if (!updated) {
        return res.status(404).json({ message: "Investor not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update investor error:", error);
      res.status(500).json({ message: "Failed to update investor" });
    }
  });

  app.delete("/api/admin/investors/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteInvestorProfile(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete investor error:", error);
      res.status(500).json({ message: "Failed to delete investor" });
    }
  });

  app.post("/api/admin/investors/bulk-upload", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        investors: z.array(z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          phone: z.string(),
          panNumber: z.string(),
          investmentAmount: z.string(),
          investorType: z.string(),
        })),
      });

      const data = schema.parse(req.body);
      const results = [];

      for (const inv of data.investors) {
        const profile = await storage.createInvestorProfile({
          userId: null,
          firstName: inv.firstName,
          lastName: inv.lastName,
          email: inv.email,
          phone: inv.phone,
          panNumber: inv.panNumber,
          kycStatus: "pending",
          investorType: inv.investorType,
        });

        if (profile) {
          await storage.createPortfolio({
            investorId: profile.id,
            totalInvested: inv.investmentAmount,
            currentValue: inv.investmentAmount,
            returns: "0",
            irr: "0",
          });
        }

        results.push(profile);
      }

      res.status(201).json({ created: results.length, investors: results });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Bulk upload error:", error);
      res.status(500).json({ message: "Failed to bulk upload investors" });
    }
  });

  app.post("/api/admin/investors/:id/send-credentials", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const investor = await storage.getInvestorProfileById(req.params.id as string);
      if (!investor) {
        return res.status(404).json({ message: "Investor not found" });
      }

      const tempPassword = `GC${Math.random().toString(36).substring(2, 8).toUpperCase()}@2025`;
      res.json({ success: true, email: investor.email, tempPassword });
    } catch (error) {
      console.error("Send credentials error:", error);
      res.status(500).json({ message: "Failed to send credentials" });
    }
  });

  app.get("/api/admin/transactions", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const investorId = req.query.investorId as string | undefined;

      if (investorId) {
        // Filter transactions by investor ID
        const transactions = await storage.getTransactions(investorId);
        return res.json(transactions);
      }

      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Get all transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  app.put("/api/admin/transactions/:id/verify", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateTransaction(req.params.id as string, { status: "verified" });
      if (!updated) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Verify transaction error:", error);
      res.status(500).json({ message: "Failed to verify transaction" });
    }
  });

  app.put("/api/admin/transactions/:id/process", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateTransaction(req.params.id as string, {
        status: "processed",
        processedAt: new Date(),
      });
      if (!updated) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Process transaction error:", error);
      res.status(500).json({ message: "Failed to process transaction" });
    }
  });

  app.post("/api/admin/statements/generate", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        investorId: z.string(),
        type: z.string(),
        period: z.string(),
        year: z.number(),
        month: z.number().optional(),
        quarter: z.number().optional(),
      });

      const data = schema.parse(req.body);

      // Get investor profile for PDF
      const investor = await storage.getInvestorProfileById(data.investorId);
      if (!investor) {
        return res.status(404).json({ message: "Investor not found" });
      }

      // Get portfolio data
      const portfolio = await storage.getPortfolio(data.investorId);

      // Generate actual PDF file
      const { generateStatementPDF } = await import("./pdf-generator");
      const pdfResult = await generateStatementPDF(data.investorId, {
        investorName: `${investor.firstName} ${investor.lastName}`,
        investorEmail: investor.email || "",
        type: data.type,
        period: data.period,
        year: data.year,
        investmentAmount: portfolio?.totalInvested,
        currentValue: portfolio?.currentValue,
        returns: portfolio?.returns,
      });

      const statement = await storage.createStatement({
        investorId: data.investorId,
        type: data.type,
        period: data.period,
        year: data.year,
        month: data.month,
        quarter: data.quarter,
        fileName: pdfResult.fileName,
        fileUrl: pdfResult.fileUrl, // Will be updated
        fileContent: pdfResult.buffer, // Save buffer to DB
        version: 1,
      });

      // Update fileUrl to use the database download endpoint
      const downloadUrl = `/api/statements/${statement._id}/download`;
      const updatedStatement = await storage.updateStatement(statement._id, { fileUrl: downloadUrl });

      res.status(201).json(updatedStatement || statement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Generate statement error:", error);
      res.status(500).json({ message: "Failed to generate statement" });
    }
  });

  // Excel file upload for bulk statement generation
  app.post("/api/admin/statements/upload", isAuthenticated, requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = (req as any).file;
      console.log("Upload request received, file:", file ? file.originalname : "NO FILE");

      if (!file) {
        return res.status(400).json({ message: "No file uploaded. Please select an Excel file." });
      }

      console.log("Reading Excel file:", file.path);

      // Parse Excel file - use dynamic import to avoid ESM/CJS issues
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default || xlsxModule;

      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet) as any[];

      console.log("Parsed data rows:", data.length, "First row:", data[0]);

      if (!data || data.length === 0) {
        return res.status(400).json({ message: "Excel file is empty or invalid" });
      }

      const results: any[] = [];
      const errors: any[] = [];

      for (const row of data) {
        try {
          // Expected columns: investorId OR investorName, type, period, year
          let investorId = row.investorId || row.investor_id || row.InvestorId;
          const investorName = row.investorName || row.investor_name || row.InvestorName || row.name || row.Name;
          const type = row.type || row.Type || "monthly";
          const period = row.period || row.Period || "January";
          const year = parseInt(row.year || row.Year || new Date().getFullYear());

          let investor = null;

          // If investorId is provided, use it directly
          if (investorId) {
            investor = await storage.getInvestorProfileById(investorId);
          }
          // Otherwise, try to find investor by name
          else if (investorName) {
            const allInvestors = await storage.getAllInvestors();
            const nameParts = investorName.trim().split(/\s+/);

            if (nameParts.length >= 2) {
              const firstName = nameParts[0].toLowerCase();
              const lastName = nameParts.slice(1).join(" ").toLowerCase();

              investor = allInvestors.find(inv =>
                inv.firstName.toLowerCase() === firstName &&
                inv.lastName.toLowerCase() === lastName
              ) || null;
            } else {
              // Try to match by first name or last name alone
              const searchName = nameParts[0].toLowerCase();
              investor = allInvestors.find(inv =>
                inv.firstName.toLowerCase() === searchName ||
                inv.lastName.toLowerCase() === searchName
              ) || null;
            }

            if (investor) {
              investorId = (investor as any)._id || investor.id;
            }
          }

          if (!investor) {
            errors.push({ row, error: `Investor not found: ${investorName || investorId || "No name/ID provided"}` });
            continue;
          }

          investorId = investorId || (investor as any)._id || investor.id;

          // Get portfolio data
          const portfolio = await storage.getPortfolio(investorId);

          // Generate PDF
          const { generateStatementPDF } = await import("./pdf-generator");
          const pdfResult = await generateStatementPDF(investorId, {
            investorName: `${investor.firstName} ${investor.lastName}`,
            investorEmail: investor.email || "",
            type,
            period,
            year,
            investmentAmount: portfolio?.totalInvested,
            currentValue: portfolio?.currentValue,
            returns: portfolio?.returns,
          });

          // Create statement record
          // Create statement record
          const statement = await storage.createStatement({
            investorId,
            type,
            period,
            year,
            fileName: pdfResult.fileName,
            fileUrl: pdfResult.fileUrl, // Will be updated
            fileContent: pdfResult.buffer, // Save buffer to DB
            version: 1,
          });

          // Update fileUrl to use the database download endpoint
          const downloadUrl = `/api/statements/${statement._id}/download`;
          const updatedStatement = await storage.updateStatement(statement._id, { fileUrl: downloadUrl });

          results.push(updatedStatement || statement);
        } catch (rowError) {
          errors.push({ row, error: String(rowError) });
        }
      }

      // Clean up uploaded file
      const fs = await import("fs");
      fs.unlinkSync(file.path);

      console.log("Processed", results.length, "statements with", errors.length, "errors");
      if (errors.length > 0) {
        console.log("Row errors:", JSON.stringify(errors, null, 2));
      }

      res.status(201).json({
        message: `Processed ${results.length} statements, ${errors.length} errors`,
        statements: results,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      console.error("Upload statement error:", error);
      res.status(500).json({
        message: "Failed to process uploaded file",
        error: error?.message || String(error),
      });
    }
  });

  app.get("/api/admin/statements", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const statements = await storage.getAllStatements();
      res.json(statements);
    } catch (error) {
      console.error("Get statements error:", error);
      res.status(500).json({ message: "Failed to get statements" });
    }
  });

  app.delete("/api/admin/statements/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteStatement(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete statement error:", error);
      res.status(500).json({ message: "Failed to delete statement" });
    }
  });

  // Download statement from DB
  app.get("/api/statements/:id/download", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log(`[Download] Request for statement ${req.params.id}`);
      const statement = await storage.getStatementById(req.params.id as string);

      if (!statement) {
        console.error(`[Download] Statement ${req.params.id} not found in DB`);
        return res.status(404).json({ message: "Statement file not found" });
      }

      if (!statement.fileContent) {
        console.error(`[Download] Statement ${req.params.id} found but has NO fileContent. URL: ${statement.fileUrl}`);
        return res.status(404).json({ message: "Statement file content missing" });
      }

      console.log(`[Download] Statement found. Size: ${statement.fileContent.length} bytes`);

      // Check authorization
      const user = (req as any).user;

      // Verify admin status from DB to be consistent with middleware
      const adminUser = await storage.getAdminUser(user.id);
      const isAdmin = !!adminUser;

      if (!isAdmin && statement.investorId !== user.id) {
        console.error(`[Download] Unauthorized access. User ${user.id} tried to access statement for ${statement.investorId}`);
        return res.status(403).json({ message: "Unauthorized access to statement" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${statement.fileName}"`);

      let content = statement.fileContent;
      if (!Buffer.isBuffer(content)) {
        // Handle potential BSON Binary type or other non-Buffer formats
        if (content && typeof content === 'object' && 'buffer' in content && Buffer.isBuffer((content as any).buffer)) {
          content = (content as any).buffer;
        } else {
          content = Buffer.from(content as any);
        }
      }

      res.send(content);

    } catch (error) {
      console.error("Download statement error:", error);
      res.status(500).json({ message: "Failed to download statement" });
    }
  });

  // Download filtered statements as ZIP
  app.post("/api/admin/statements/download-filtered", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { type, period, year, investorId } = req.body;

      console.log("[Bulk Download] Request with filters:", { type, period, year, investorId });

      const allStatements = await storage.getAllStatements();

      // Filter statements
      const filteredStatements = allStatements.filter(s => {
        let match = true;
        if (type && s.type !== type) match = false;
        if (period && s.period.toLowerCase() !== period.toLowerCase()) match = false;
        if (year && s.year !== parseInt(year)) match = false;
        if (investorId && s.investorId !== investorId) match = false;
        return match;
      });

      if (filteredStatements.length === 0) {
        return res.status(404).json({ message: "No statements found matching the selected filters" });
      }

      console.log(`[Bulk Download] Found ${filteredStatements.length} matching statements`);

      // Dynamically import JSZip
      const JSZipModule = await import("jszip");
      const JSZip = (JSZipModule.default || JSZipModule) as any;
      const zip = new JSZip();

      // Add files to ZIP
      let fileCount = 0;
      for (const statement of filteredStatements) {
        if (statement.fileContent) {
          let content = statement.fileContent;

          // Ensure content is a Buffer
          if (!Buffer.isBuffer(content)) {
            if (content && typeof content === 'object' && 'buffer' in content && Buffer.isBuffer((content as any).buffer)) {
              content = (content as any).buffer;
            } else {
              content = Buffer.from(content as any);
            }
          }

          zip.file(statement.fileName, content);
          fileCount++;
        }
      }

      if (fileCount === 0) {
        return res.status(404).json({ message: "No file content found for matching statements" });
      }

      // Generate ZIP buffer
      const zipContent = await zip.generateAsync({ type: "nodebuffer" });

      const zipFileName = `statements_${type || 'all'}_${period || 'all'}_${year || 'all'}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
      res.send(zipContent);

    } catch (error) {
      console.error("Bulk download error:", error);
      res.status(500).json({ message: "Failed to generate download package" });
    }
  });

  app.get("/api/admin/nav", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const navHistory = await storage.getNavHistory();
      res.json(navHistory);
    } catch (error) {
      console.error("Get NAV history error:", error);
      res.status(500).json({ message: "Failed to get NAV history" });
    }
  });

  app.post("/api/admin/nav", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        date: z.string().min(1),
        nav: z.string().min(1),
        aum: z.string().min(1),
      });

      const data = schema.parse(req.body);
      const navEntry = await storage.createNavHistory({
        date: new Date(data.date),
        nav: data.nav,
        aum: data.aum,
      });

      res.status(201).json(navEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create NAV entry error:", error);
      res.status(500).json({ message: "Failed to create NAV entry" });
    }
  });

  app.put("/api/admin/nav/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        nav: z.string().optional(),
        aum: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateNavHistory(req.params.id as string, data);

      if (!updated) {
        return res.status(404).json({ message: "NAV entry not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update NAV error:", error);
      res.status(500).json({ message: "Failed to update NAV" });
    }
  });

  app.get("/api/admin/returns", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const returns = await storage.getReturnsHistory();
      res.json(returns);
    } catch (error) {
      console.error("Get returns error:", error);
      res.status(500).json({ message: "Failed to get returns" });
    }
  });

  app.post("/api/admin/returns", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        period: z.string(),
        year: z.number(),
        month: z.number().optional(),
        quarter: z.number().optional(),
        grossReturn: z.string(),
        netReturn: z.string(),
        benchmark: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const returns = await storage.createReturnsHistory(data);

      res.status(201).json(returns);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create returns error:", error);
      res.status(500).json({ message: "Failed to create returns" });
    }
  });

  app.put("/api/admin/returns/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        grossReturn: z.string().optional(),
        netReturn: z.string().optional(),
        benchmark: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateReturnsHistory(req.params.id as string, data);

      if (!updated) {
        return res.status(404).json({ message: "Returns entry not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update returns error:", error);
      res.status(500).json({ message: "Failed to update returns" });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Get admin announcements error:", error);
      res.status(500).json({ message: "Failed to get announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const schema = z.object({
        title: z.string().min(5),
        content: z.string().min(20),
        type: z.string().min(1),
        priority: z.string().min(1),
        targetAudience: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const announcement = await storage.createAnnouncement({
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority,
        targetAudience: data.targetAudience || "all",
        isActive: true, // Immediately publish
        publishedAt: new Date(),
        createdBy: userId,
      });

      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create announcement error:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put("/api/admin/announcements/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        type: z.string().optional(),
        priority: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateAnnouncement(req.params.id as string, data);

      if (!updated) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update announcement error:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteAnnouncement(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.post("/api/admin/announcements/:id/publish", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateAnnouncement(req.params.id as string, {
        isActive: true,
        publishedAt: new Date(),
      });

      if (!updated) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Publish announcement error:", error);
      res.status(500).json({ message: "Failed to publish announcement" });
    }
  });

  // Retrieve active announcements for investors
  app.get("/api/announcements", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ message: "Failed to get announcements" });
    }
  });

  // Investor Statements
  app.get("/api/investor/statements", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      console.log("DEBUG: fetching statements for user", user.id);
      const investorProfile = await storage.getInvestorProfile(user.id);

      if (!investorProfile) {
        console.log("DEBUG: Investor profile NOT found for user", user.id);
        return res.json([]);
      }

      console.log("DEBUG: Found Investor Profile:", investorProfile._id);
      const statements = await storage.getStatements(investorProfile._id);
      console.log("DEBUG: storage.getStatements returned count:", statements.length);

      res.json(statements);
    } catch (error) {
      console.error("Get investor statements error:", error);
      res.status(500).json({ message: "Failed to get statements" });
    }
  });

  // Admin Reports
  app.get("/api/admin/reports/aum", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const navHistory = await storage.getNavHistory();
      const investors = await storage.getAllInvestors();

      const latestNav = navHistory[0];
      res.json({
        totalAum: latestNav?.aum || "0",
        investorCount: investors.length,
        history: navHistory.slice(0, 12),
      });
    } catch (error) {
      console.error("Get AUM report error:", error);
      res.status(500).json({ message: "Failed to get AUM report" });
    }
  });

  app.get("/api/admin/reports/inflows", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getAllTransactions();
      const inflows = transactions.filter(t => t.type === "investment" || t.type === "contribution");
      const outflows = transactions.filter(t => t.type === "redemption" || t.type === "withdrawal");

      res.json({
        totalInflows: inflows.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0),
        totalOutflows: outflows.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0),
        recentInflows: inflows.slice(0, 10),
        recentOutflows: outflows.slice(0, 10),
      });
    } catch (error) {
      console.error("Get inflows report error:", error);
      res.status(500).json({ message: "Failed to get inflows report" });
    }
  });

  app.get("/api/admin/reports/allocations", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const investors = await storage.getAllInvestors();
      let totalPrivateCredit = 0;
      let totalAif = 0;
      let totalCash = 0;

      for (const investor of investors) {
        const portfolio = await storage.getPortfolio(investor._id);
        if (portfolio) {
          totalPrivateCredit += parseFloat(portfolio.privateCreditAllocation || "0");
          totalAif += parseFloat(portfolio.aifExposure || "0");
          totalCash += parseFloat(portfolio.cashEquivalents || "0");
        }
      }

      res.json({
        privateCredit: totalPrivateCredit,
        aifExposure: totalAif,
        cashEquivalents: totalCash,
      });
    } catch (error) {
      console.error("Get allocations report error:", error);
      res.status(500).json({ message: "Failed to get allocations report" });
    }
  });

  app.get("/api/admin/reports/investor-segments", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const investors = await storage.getAllInvestors();
      const segments = {
        byType: {} as Record<string, number>,
        byKycStatus: {} as Record<string, number>,
        byInvestmentTier: { small: 0, medium: 0, large: 0, vip: 0 },
      };

      for (const investor of investors) {
        segments.byType[investor.investorType] = (segments.byType[investor.investorType] || 0) + 1;
        segments.byKycStatus[investor.kycStatus] = (segments.byKycStatus[investor.kycStatus] || 0) + 1;

        const portfolio = await storage.getPortfolio(investor._id);
        const invested = parseFloat(portfolio?.totalInvested || "0");
        if (invested < 1000000) segments.byInvestmentTier.small++;
        else if (invested < 5000000) segments.byInvestmentTier.medium++;
        else if (invested < 10000000) segments.byInvestmentTier.large++;
        else segments.byInvestmentTier.vip++;
      }

      res.json(segments);
    } catch (error) {
      console.error("Get investor segments error:", error);
      res.status(500).json({ message: "Failed to get investor segments" });
    }
  });

  // Export Report (Real Implementation)
  app.post("/api/admin/reports/export", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { reportType, format } = req.body;

      if (format !== 'csv') {
        return res.status(400).json({ message: "Only CSV format is currently supported for direct download." });
      }

      let csvContent = "";
      let filename = `report_${reportType}_${Date.now()}.csv`;

      if (reportType === 'aum') {
        const history = await storage.getNavHistory();
        const investors = await storage.getAllInvestors();
        const portfolios = await Promise.all(investors.map(inv => storage.getPortfolio(inv._id)));
        const totalAum = portfolios.reduce((sum, p) => sum + parseFloat(p?.totalInvested || "0"), 0);

        csvContent = "Date,Total AUM (INR),Active Investors\n";
        // Simple summary row
        csvContent += `${new Date().toISOString().split('T')[0]},${totalAum},${investors.length}\n\n`;
        csvContent += "History Date,NAV\n";
        history.forEach(h => {
          csvContent += `${new Date(h.date).toISOString().split('T')[0]},${h.nav}\n`;
        });

      } else if (reportType === 'inflows') {
        // Logic similar to /reports/inflows
        const transactions = await storage.getAllTransactions();
        csvContent = "Date,Type,Amount (INR),Investor ID\n";
        transactions.forEach(t => {
          csvContent += `${new Date(t.createdAt).toISOString().split('T')[0]},${t.type},${t.amount},${t.investorId}\n`;
        });

      } else if (reportType === 'allocations') {
        const investors = await storage.getAllInvestors();
        const portfolios = await Promise.all(investors.map(inv => storage.getPortfolio(inv._id)));

        csvContent = "Investor,Total Invested,Private Credit,AIF,Cash\n";
        portfolios.forEach((p, idx) => {
          if (!p) return;
          const invName = investors[idx]?.firstName + " " + investors[idx]?.lastName;
          csvContent += `${invName},${p.totalInvested},${p.privateCreditAllocation || 0},${p.aifExposure || 0},${p.cashEquivalents || 0}\n`;
        });

      } else if (reportType === 'segments') {
        const investors = await storage.getAllInvestors();
        csvContent = "Investor,Type,KYC Status,Risk Profile\n";
        investors.forEach(inv => {
          csvContent += `${inv.firstName} ${inv.lastName},${inv.investorType},${inv.kycStatus},${inv.riskProfile}\n`;
        });
      } else {
        // Summary / Default
        csvContent = "Report,Date\n";
        csvContent += `Summary Report,${new Date().toISOString()}\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(csvContent);

    } catch (error) {
      console.error("Export report error:", error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

  // ==================== SUPERADMIN ENDPOINTS ====================

  app.get("/api/superadmin/users", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const adminUsers = await storage.getAllAdminUsers();
      const adminsWithUserData = await Promise.all(
        adminUsers.map(async (admin) => {
          const userData = await storage.getUser(admin.userId);
          return {
            ...admin,
            firstName: userData?.firstName || null,
            lastName: userData?.lastName || null,
            email: userData?.email || null,
          };
        })
      );
      res.json(adminsWithUserData);
    } catch (error) {
      console.error("Get superadmin users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/superadmin/users", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["super_admin", "admin", "read_only"]),
        permissions: z.array(z.string()).optional(),
        userId: z.string().optional(), // Allow optional manual override if absolutely needed, but usually generated
      });

      const data = schema.parse(req.body);

      // 1. Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // 2. Create base User record
      const hashedPassword = await hashPassword(data.password);
      const newUser = await storage.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        activeSessionToken: undefined,
      });

      // 3. Create AdminUser record linked to the new User
      const newAdmin = await storage.createAdminUser({
        userId: newUser._id, // Link to the MongoDB _id of the User
        role: data.role,
        permissions: data.permissions || [],
      });

      res.status(201).json({ ...newAdmin, user: newUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create admin error:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });


  app.put("/api/superadmin/users/:id", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        role: z.enum(["super_admin", "admin", "read_only"]).optional(),
        permissions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      });

      const data = schema.parse(req.body);
      const updated = await storage.updateAdminUser(req.params.id as string, data);

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update superadmin user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/superadmin/users/:id", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteAdminUser(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete superadmin user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/superadmin/activity-logs", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get activity logs error:", error);
      res.status(500).json({ message: "Failed to get activity logs" });
    }
  });

  app.get("/api/superadmin/system-settings", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get system settings error:", error);
      res.status(500).json({ message: "Failed to get system settings" });
    }
  });

  app.put("/api/superadmin/system-settings", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const schema = z.object({
        key: z.string(),
        value: z.string(),
        category: z.string().optional(),
        description: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const setting = await storage.upsertSystemSetting({
        key: data.key,
        value: data.value,
        category: data.category || "general",
        description: data.description,
        updatedBy: userId,
      });

      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update system settings error:", error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  app.put("/api/superadmin/system-settings/:key", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const key = req.params.key as string;

      const schema = z.object({
        value: z.any(),
      });

      const data = schema.parse(req.body);
      const setting = await storage.upsertSystemSetting({
        key,
        value: String(data.value),
        updatedBy: userId,
      });

      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update system setting error:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Superadmin - Admin users management
  app.get("/api/superadmin/users", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const admins = await storage.getAllAdminUsers();

      // Join with user data to get full details
      const adminWithDetails = await Promise.all(admins.map(async (admin) => {
        const user = await storage.getUser(admin.userId);
        return {
          id: (admin as any)._id || admin.userId,
          odminId: (admin as any)._id,
          userId: admin.userId,
          role: admin.role,
          isActive: admin.isActive,
          permissions: admin.permissions || [],
          createdAt: (admin as any).createdAt || new Date().toISOString(),
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          email: user?.email || null,
        };
      }));

      res.json(adminWithDetails);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ message: "Failed to get admin users" });
    }
  });

  app.post("/api/superadmin/users", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string(),
        role: z.enum(["admin", "super_admin"]),
      });

      const data = schema.parse(req.body);

      // Check if user exists
      const user = await storage.getUser(data.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already an admin
      const existingAdmin = await storage.getAdminUser(data.userId);
      if (existingAdmin) {
        return res.status(400).json({ message: "User is already an admin" });
      }

      const admin = await storage.createAdminUser({
        userId: data.userId,
        role: data.role,
        permissions: data.role === "super_admin" ? ["all"] : [],
        isActive: true,
      });

      res.status(201).json(admin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create admin user error:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  app.put("/api/superadmin/users/:id", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        role: z.enum(["admin", "super_admin"]).optional(),
        permissions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      });

      const data = schema.parse(req.body);

      // Update permissions based on role
      let permissions = data.permissions;
      if (data.role === "super_admin") {
        permissions = ["all"];
      }

      const updated = await storage.updateAdminUser(req.params.id as string, {
        ...data,
        permissions,
      });

      if (!updated) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update admin user error:", error);
      res.status(500).json({ message: "Failed to update admin user" });
    }
  });

  app.delete("/api/superadmin/users/:id", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteAdminUser(req.params.id as string);
      res.json({ message: "Admin user removed successfully" });
    } catch (error) {
      console.error("Delete admin user error:", error);
      res.status(500).json({ message: "Failed to remove admin user" });
    }
  });

  // Legacy support endpoints (deprecated but kept for backward compatibility)
  app.get("/api/investor/support-requests", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;
      const requests = await storage.getSupportRequests(investorProfile._id);
      res.json(requests);
    } catch (error) {
      console.error("Get support requests error:", error);
      res.status(500).json({ message: "Failed to get support requests" });
    }
  });

  app.post("/api/support-requests", isAuthenticated, requireInvestor, async (req: Request, res: Response) => {
    try {
      const investorProfile = (req as any).investorProfile;

      const schema = z.object({
        type: z.string().min(1),
        subject: z.string().min(5),
        description: z.string().min(20),
      });

      const data = schema.parse(req.body);
      const request = await storage.createSupportRequest({
        investorId: (investorProfile as any)._id,
        type: data.type,
        subject: data.subject,
        description: data.description,
        status: "open",
        priority: "normal",
      });

      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create support request error:", error);
      res.status(500).json({ message: "Failed to create support request" });
    }
  });

  // Keep legacy admin users endpoint for backward compatibility
  app.get("/api/admin/users", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const adminUsers = await storage.getAllAdminUsers();
      const adminsWithUserData = await Promise.all(
        adminUsers.map(async (admin) => {
          const userData = await storage.getUser(admin.userId);
          return {
            ...admin,
            firstName: userData?.firstName || null,
            lastName: userData?.lastName || null,
            email: userData?.email || null,
          };
        })
      );
      res.json(adminsWithUserData);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ message: "Failed to get admin users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1),
        role: z.enum(["super_admin", "admin", "read_only"]),
        permissions: z.array(z.string()).optional(),
      });

      const data = schema.parse(req.body);
      const newAdmin = await storage.createAdminUser({
        userId: data.userId,
        role: data.role,
        permissions: data.permissions || [],
      });

      res.status(201).json(newAdmin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create admin user error:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  return httpServer;
}