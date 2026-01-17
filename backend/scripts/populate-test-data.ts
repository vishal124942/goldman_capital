/**
 * Populate MongoDB with comprehensive test data for UI testing
 * Run with: npx tsx scripts/populate-test-data.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
}

// Define schemas inline
const userSchema = new mongoose.Schema({
    _id: String,
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: String,
    firstName: String,
    lastName: String,
    profileImageUrl: String,
    activeSessionToken: String,
}, { timestamps: true });

const adminUserSchema = new mongoose.Schema({
    _id: String,
    userId: { type: String, unique: true },
    role: { type: String, default: "admin" },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const investorProfileSchema = new mongoose.Schema({
    _id: String,
    userId: { type: String, unique: true, sparse: true },
    firstName: String,
    lastName: String,
    email: String,
    investorType: { type: String, default: "individual" },
    panNumber: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    kycStatus: { type: String, default: "pending" },
    riskProfile: { type: String, default: "moderate" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
    _id: String,
    investorId: String,
    fundName: { type: String, default: "Velocity Fund" },
    totalInvested: { type: String, default: "0" },
    currentValue: { type: String, default: "0" },
    returns: { type: String, default: "0" },
    irr: { type: String, default: "0" },
    privateCreditAllocation: String,
    aifExposure: String,
    cashEquivalents: String,
    deploymentStatus: { type: String, default: "pending" },
    inceptionDate: Date,
}, { timestamps: true });

const navHistorySchema = new mongoose.Schema({
    _id: String,
    date: Date,
    nav: String,
    aum: String,
}, { timestamps: true });

const returnsHistorySchema = new mongoose.Schema({
    _id: String,
    period: String,
    year: Number,
    month: Number,
    quarter: Number,
    grossReturn: String,
    netReturn: String,
    benchmark: String,
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
    _id: String,
    title: String,
    content: String,
    type: { type: String, default: "general" },
    priority: { type: String, default: "normal" },
    targetAudience: { type: String, default: "all" },
    isActive: { type: Boolean, default: true },
    publishedAt: Date,
    expiresAt: Date,
    createdBy: String,
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
    _id: String,
    investorId: String,
    portfolioId: String,
    type: String,
    amount: String,
    status: { type: String, default: "pending" },
    paymentMethod: String,
    referenceNumber: String,
    confirmationUrl: String,
    notes: String,
    processedAt: Date,
}, { timestamps: true });

const statementSchema = new mongoose.Schema({
    _id: String,
    investorId: String,
    type: String,
    period: String,
    year: Number,
    month: Number,
    quarter: Number,
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    version: { type: Number, default: 1 },
    generatedAt: Date,
}, { timestamps: true });

const allocationSchema = new mongoose.Schema({
    _id: String,
    portfolioId: String,
    assetClass: String,
    assetName: String,
    percentage: String,
    amount: String,
    status: { type: String, default: "deployed" },
    description: String,
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
    _id: String,
    investorId: String,
    title: String,
    message: String,
    type: { type: String, default: "info" },
    isRead: { type: Boolean, default: false },
    link: String,
}, { timestamps: true });

const supportRequestSchema = new mongoose.Schema({
    _id: String,
    investorId: String,
    type: String,
    subject: String,
    description: String,
    status: { type: String, default: "open" },
    priority: { type: String, default: "normal" },
    assignedTo: String,
    resolvedAt: Date,
}, { timestamps: true });

const activityLogSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    action: String,
    resource: String,
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

const systemSettingSchema = new mongoose.Schema({
    _id: String,
    key: { type: String, unique: true },
    value: String,
    category: { type: String, default: "general" },
    description: String,
    updatedBy: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const AdminUser = mongoose.model("AdminUser", adminUserSchema);
const InvestorProfile = mongoose.model("InvestorProfile", investorProfileSchema);
const Portfolio = mongoose.model("Portfolio", portfolioSchema);
const NavHistory = mongoose.model("NavHistory", navHistorySchema);
const ReturnsHistory = mongoose.model("ReturnsHistory", returnsHistorySchema);
const Announcement = mongoose.model("Announcement", announcementSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Statement = mongoose.model("Statement", statementSchema);
const Allocation = mongoose.model("Allocation", allocationSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

async function populateTestData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // ==================== SUPER ADMIN ====================
        console.log("\n👨‍💼 Creating Super Admin...");
        const superAdminEmail = "2000520320034@ietlucknow.ac.in";
        const superAdminPassword = "2000520320034";

        const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
        let superAdminUserId: string;
        
        if (existingSuperAdmin) {
            console.log(`   ⚠️  Super admin ${superAdminEmail} already exists. Skipping.`);
            superAdminUserId = existingSuperAdmin._id as string;
        } else {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
            superAdminUserId = randomUUID();

            await User.create({
                _id: superAdminUserId,
                email: superAdminEmail,
                password: hashedPassword,
                firstName: "Super",
                lastName: "Admin",
            });

            await AdminUser.create({
                _id: randomUUID(),
                userId: superAdminUserId,
                role: "super_admin",
                permissions: ["all"],
                isActive: true,
            });
            console.log(`   ✅ Super admin created: ${superAdminEmail}`);
        }

        // ==================== GET EXISTING INVESTORS ====================
        const existingInvestors = await InvestorProfile.find().lean();
        console.log(`\n📊 Found ${existingInvestors.length} existing investors`);

        // ==================== NAV HISTORY (12 months) ====================
        console.log("\n📈 Seeding NAV History...");
        const existingNav = await NavHistory.countDocuments();
        if (existingNav > 0) {
            console.log(`   ⚠️  NAV history exists (${existingNav} records). Skipping.`);
        } else {
            const navData = [];
            let baseNav = 100;
            let baseAum = 50000000;
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                baseNav = baseNav * (1 + (Math.random() * 0.03 - 0.005));
                baseAum = baseAum * (1 + (Math.random() * 0.05));
                navData.push({
                    _id: randomUUID(),
                    date,
                    nav: baseNav.toFixed(4),
                    aum: Math.round(baseAum).toString(),
                });
            }
            await NavHistory.insertMany(navData);
            console.log(`   ✅ Created ${navData.length} NAV history entries`);
        }

        // ==================== RETURNS HISTORY ====================
        console.log("\n📊 Seeding Returns History...");
        const existingReturns = await ReturnsHistory.countDocuments();
        if (existingReturns > 0) {
            console.log(`   ⚠️  Returns history exists (${existingReturns} records). Skipping.`);
        } else {
            const returnsData = [];
            for (let q = 1; q <= 4; q++) {
                const grossReturn = (8 + Math.random() * 8).toFixed(2);
                const netReturn = (parseFloat(grossReturn) - 1.5).toFixed(2);
                returnsData.push({
                    _id: randomUUID(),
                    period: "quarterly",
                    year: 2025,
                    quarter: q,
                    grossReturn,
                    netReturn,
                    benchmark: (5 + Math.random() * 3).toFixed(2),
                });
            }
            await ReturnsHistory.insertMany(returnsData);
            console.log(`   ✅ Created ${returnsData.length} returns history entries`);
        }

        // ==================== ANNOUNCEMENTS ====================
        console.log("\n📢 Seeding Announcements...");
        const existingAnnouncements = await Announcement.countDocuments();
        if (existingAnnouncements > 0) {
            console.log(`   ⚠️  Announcements exist (${existingAnnouncements} records). Skipping.`);
        } else {
            const announcements = [
                {
                    _id: randomUUID(),
                    title: "Q4 2025 Performance Report Released",
                    content: "We are pleased to announce that the Q4 2025 performance report is now available. The fund delivered exceptional returns of 18.5% for the quarter, significantly outperforming our benchmark.",
                    type: "performance",
                    priority: "high",
                    targetAudience: "all",
                    isActive: true,
                    publishedAt: new Date(),
                    createdBy: superAdminUserId,
                },
                {
                    _id: randomUUID(),
                    title: "Annual Investor Meeting - Save the Date",
                    content: "Mark your calendars for our Annual Investor Meeting scheduled for February 15, 2026. Join us for insights into our investment strategy and outlook for 2026.",
                    type: "event",
                    priority: "normal",
                    targetAudience: "all",
                    isActive: true,
                    publishedAt: new Date(),
                    createdBy: superAdminUserId,
                },
                {
                    _id: randomUUID(),
                    title: "New Investment Opportunity in Private Credit",
                    content: "We have identified an attractive private credit opportunity with expected returns of 14-16% annually. Contact your relationship manager for details.",
                    type: "opportunity",
                    priority: "high",
                    targetAudience: "all",
                    isActive: true,
                    publishedAt: new Date(),
                    createdBy: superAdminUserId,
                },
            ];
            await Announcement.insertMany(announcements);
            console.log(`   ✅ Created ${announcements.length} announcements`);
        }

        // ==================== SYSTEM SETTINGS ====================
        console.log("\n⚙️  Seeding System Settings...");
        const existingSettings = await SystemSetting.countDocuments();
        if (existingSettings > 0) {
            console.log(`   ⚠️  System settings exist (${existingSettings} records). Skipping.`);
        } else {
            const settings = [
                { _id: randomUUID(), key: "platform_name", value: "Godman Capital", category: "general", description: "Platform display name" },
                { _id: randomUUID(), key: "contact_email", value: "contact@godmancapital.com", category: "general", description: "Primary contact email" },
                { _id: randomUUID(), key: "support_phone", value: "+91 9876543210", category: "general", description: "Support phone number" },
                { _id: randomUUID(), key: "min_investment", value: "1000000", category: "investment", description: "Minimum investment amount in INR" },
                { _id: randomUUID(), key: "management_fee", value: "2.0", category: "fees", description: "Annual management fee percentage" },
                { _id: randomUUID(), key: "performance_fee", value: "20.0", category: "fees", description: "Performance fee percentage" },
                { _id: randomUUID(), key: "hurdle_rate", value: "8.0", category: "fees", description: "Hurdle rate for performance fee" },
                { _id: randomUUID(), key: "statement_generation", value: "monthly", category: "statements", description: "Statement generation frequency" },
                { _id: randomUUID(), key: "otp_expiry_minutes", value: "10", category: "security", description: "OTP expiry time in minutes" },
                { _id: randomUUID(), key: "session_timeout_hours", value: "168", category: "security", description: "Session timeout in hours" },
            ];
            await SystemSetting.insertMany(settings);
            console.log(`   ✅ Created ${settings.length} system settings`);
        }

        // ==================== ACTIVITY LOGS ====================
        console.log("\n📝 Seeding Activity Logs...");
        const existingLogs = await ActivityLog.countDocuments();
        if (existingLogs > 0) {
            console.log(`   ⚠️  Activity logs exist (${existingLogs} records). Skipping.`);
        } else {
            const logs = [
                { _id: randomUUID(), userId: superAdminUserId, action: "login", resource: "auth", details: { method: "email" }, ipAddress: "192.168.1.1" },
                { _id: randomUUID(), userId: superAdminUserId, action: "create", resource: "announcement", resourceId: "ann-001", details: { title: "Q4 Report" } },
                { _id: randomUUID(), userId: superAdminUserId, action: "update", resource: "nav", resourceId: "nav-001", details: { nav: "115.50" } },
                { _id: randomUUID(), userId: superAdminUserId, action: "view", resource: "investors", details: { count: 10 } },
                { _id: randomUUID(), userId: superAdminUserId, action: "generate", resource: "statement", resourceId: "stmt-001", details: { type: "quarterly" } },
            ];
            await ActivityLog.insertMany(logs);
            console.log(`   ✅ Created ${logs.length} activity logs`);
        }

        // ==================== PER-INVESTOR DATA ====================
        for (const investor of existingInvestors) {
            console.log(`\n👤 Processing investor: ${investor.email || investor._id}`);

            // Get or create portfolio
            let portfolio = await Portfolio.findOne({ investorId: investor._id });
            if (!portfolio) {
                portfolio = await Portfolio.create({
                    _id: randomUUID(),
                    investorId: investor._id,
                    fundName: "Velocity Fund",
                    totalInvested: "2500000.00",
                    currentValue: "2875000.00",
                    returns: "15.00",
                    irr: "15.00",
                    privateCreditAllocation: "60",
                    aifExposure: "25",
                    cashEquivalents: "15",
                    deploymentStatus: "deployed",
                    inceptionDate: new Date("2024-01-01"),
                });
                console.log("   ✅ Created portfolio");
            }

            // Transactions
            const existingTxns = await Transaction.countDocuments({ investorId: investor._id });
            if (existingTxns === 0) {
                const transactions = [
                    { _id: randomUUID(), investorId: investor._id, portfolioId: portfolio._id, type: "investment", amount: "1000000.00", status: "processed", paymentMethod: "bank_transfer", referenceNumber: `TXN${Date.now()}001`, processedAt: new Date("2024-01-15") },
                    { _id: randomUUID(), investorId: investor._id, portfolioId: portfolio._id, type: "investment", amount: "500000.00", status: "processed", paymentMethod: "bank_transfer", referenceNumber: `TXN${Date.now()}002`, processedAt: new Date("2024-04-10") },
                    { _id: randomUUID(), investorId: investor._id, portfolioId: portfolio._id, type: "contribution", amount: "1000000.00", status: "processed", paymentMethod: "bank_transfer", referenceNumber: `TXN${Date.now()}003`, processedAt: new Date("2024-07-20") },
                    { _id: randomUUID(), investorId: investor._id, portfolioId: portfolio._id, type: "investment", amount: "250000.00", status: "pending", paymentMethod: "bank_transfer", referenceNumber: `TXN${Date.now()}004` },
                ];
                await Transaction.insertMany(transactions);
                console.log("   ✅ Created 4 transactions");
            }

            // Statements
            const existingStmts = await Statement.countDocuments({ investorId: investor._id });
            if (existingStmts === 0) {
                const statements = [
                    { _id: randomUUID(), investorId: investor._id, type: "quarterly", period: "Q1 2025", year: 2025, quarter: 1, fileName: "Q1_2025_Statement.pdf", fileUrl: "/statements/sample.pdf", fileSize: 245000, version: 1, generatedAt: new Date("2025-04-05") },
                    { _id: randomUUID(), investorId: investor._id, type: "quarterly", period: "Q2 2025", year: 2025, quarter: 2, fileName: "Q2_2025_Statement.pdf", fileUrl: "/statements/sample.pdf", fileSize: 268000, version: 1, generatedAt: new Date("2025-07-05") },
                    { _id: randomUUID(), investorId: investor._id, type: "quarterly", period: "Q3 2025", year: 2025, quarter: 3, fileName: "Q3_2025_Statement.pdf", fileUrl: "/statements/sample.pdf", fileSize: 275000, version: 1, generatedAt: new Date("2025-10-05") },
                    { _id: randomUUID(), investorId: investor._id, type: "annual", period: "Annual 2024", year: 2024, fileName: "Annual_2024_Statement.pdf", fileUrl: "/statements/sample.pdf", fileSize: 520000, version: 1, generatedAt: new Date("2025-01-31") },
                ];
                await Statement.insertMany(statements);
                console.log("   ✅ Created 4 statements");
            }

            // Allocations
            const existingAllocs = await Allocation.countDocuments({ portfolioId: portfolio._id });
            if (existingAllocs === 0) {
                const currentValue = parseFloat(portfolio.currentValue || "2875000");
                const allocations = [
                    { _id: randomUUID(), portfolioId: portfolio._id, assetClass: "Private Credit", assetName: "Senior Secured Loans", percentage: "35", amount: (currentValue * 0.35).toFixed(2), status: "deployed", description: "High-grade corporate lending" },
                    { _id: randomUUID(), portfolioId: portfolio._id, assetClass: "Private Credit", assetName: "Mezzanine Debt", percentage: "25", amount: (currentValue * 0.25).toFixed(2), status: "deployed", description: "Subordinated debt instruments" },
                    { _id: randomUUID(), portfolioId: portfolio._id, assetClass: "AIF", assetName: "Real Estate Fund", percentage: "15", amount: (currentValue * 0.15).toFixed(2), status: "deployed", description: "Commercial real estate exposure" },
                    { _id: randomUUID(), portfolioId: portfolio._id, assetClass: "AIF", assetName: "Infrastructure Fund", percentage: "10", amount: (currentValue * 0.10).toFixed(2), status: "deployed", description: "Infrastructure assets" },
                    { _id: randomUUID(), portfolioId: portfolio._id, assetClass: "Cash", assetName: "Money Market", percentage: "15", amount: (currentValue * 0.15).toFixed(2), status: "deployed", description: "Liquid reserves" },
                ];
                await Allocation.insertMany(allocations);
                console.log("   ✅ Created 5 allocations");
            }

            // Notifications
            const existingNotifs = await Notification.countDocuments({ investorId: investor._id });
            if (existingNotifs === 0) {
                const notifications = [
                    { _id: randomUUID(), investorId: investor._id, title: "Q4 Statement Available", message: "Your Q4 2025 statement is now available for download.", type: "info", isRead: false, link: "/dashboard/statements" },
                    { _id: randomUUID(), investorId: investor._id, title: "New Announcement", message: "Annual Investor Meeting scheduled for February 15, 2026.", type: "info", isRead: false, link: "/dashboard/announcements" },
                    { _id: randomUUID(), investorId: investor._id, title: "Portfolio Update", message: "Your portfolio has been updated with latest NAV values.", type: "success", isRead: true, link: "/dashboard/portfolio" },
                ];
                await Notification.insertMany(notifications);
                console.log("   ✅ Created 3 notifications");
            }

            // Support Requests
            const existingRequests = await SupportRequest.countDocuments({ investorId: investor._id });
            if (existingRequests === 0) {
                const requests = [
                    { _id: randomUUID(), investorId: investor._id, type: "statement", subject: "Request for Previous Year Statements", description: "Please provide statements for fiscal year 2023-24.", status: "resolved", priority: "normal", resolvedAt: new Date("2025-02-10") },
                    { _id: randomUUID(), investorId: investor._id, type: "general", subject: "Update Contact Information", description: "I would like to update my phone number and address on file.", status: "open", priority: "low" },
                ];
                await SupportRequest.insertMany(requests);
                console.log("   ✅ Created 2 support requests");
            }
        }

        // ==================== SUMMARY ====================
        console.log("\n" + "=".repeat(60));
        console.log("🎉 DATA POPULATION COMPLETE!");
        console.log("=".repeat(60));
        console.log("\n📋 SUPER ADMIN CREDENTIALS:\n");
        console.log("┌─────────────────────────────────────────────────────────┐");
        console.log("│ Email: 2000520320034@ietlucknow.ac.in                   │");
        console.log("│ Password: 2000520320034                                 │");
        console.log("└─────────────────────────────────────────────────────────┘");
        console.log("\n💡 OTP will be displayed in the server terminal when you login.\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error);
        process.exit(1);
    }
}

populateTestData();
