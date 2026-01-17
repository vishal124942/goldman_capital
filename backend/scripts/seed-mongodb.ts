/**
 * Seed script to populate MongoDB with test data
 * Run with: npx tsx scripts/seed-mongodb.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
}

// Define schemas inline for seeding
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
    deploymentStatus: { type: String, default: "pending" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const AdminUser = mongoose.model("AdminUser", adminUserSchema);
const InvestorProfile = mongoose.model("InvestorProfile", investorProfileSchema);
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear ALL existing data
        console.log("🗑️  Clearing ALL existing data...");
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const collection of collections) {
            await mongoose.connection.db.dropCollection(collection.name);
            console.log(`   Dropped: ${collection.name}`);
        }

        // Bcrypt hash for "password123" - verified to work
        const testPasswordHash = "$2b$10$UAK8akTpGkHml2STuxZ2aOOExQiaWfG1BQWfSOTMIOxz2kO2fgFJC";

        // All users use the same phone number for testing
        const YOUR_PHONE = "7310885365";
        const YOUR_EMAIL = "vishalverma4942@gmail.com";

        // ==================== SEED USERS ====================
        console.log("\n👤 Seeding users...");

        const users = [
            {
                _id: "admin-user-001",
                email: YOUR_EMAIL,
                phone: YOUR_PHONE,
                password: testPasswordHash,
                firstName: "Vishal",
                lastName: "Verma (Admin)",
            },
        ];

        await User.insertMany(users);
        console.log(`   ✅ Created ${users.length} users`);

        // ==================== SEED ADMIN USERS ====================
        console.log("👨‍💼 Seeding admin users...");

        const adminUsers = [
            {
                _id: "admin-profile-001",
                userId: "admin-user-001",
                role: "super_admin",
                permissions: ["all"],
                isActive: true,
            },
        ];

        await AdminUser.insertMany(adminUsers);
        console.log(`   ✅ Created ${adminUsers.length} admin users`);

        // ==================== SEED INVESTOR PROFILES ====================
        console.log("💰 Seeding investor profiles...");

        // Same user is also an investor for testing
        const investorProfiles = [
            {
                _id: "investor-profile-001",
                userId: "admin-user-001",
                firstName: "Vishal",
                lastName: "Verma",
                email: YOUR_EMAIL,
                investorType: "individual",
                phone: YOUR_PHONE,
                kycStatus: "verified",
                riskProfile: "moderate",
                isActive: true,
            },
        ];

        await InvestorProfile.insertMany(investorProfiles);
        console.log(`   ✅ Created ${investorProfiles.length} investor profiles`);

        // ==================== SEED PORTFOLIOS ====================
        console.log("📊 Seeding portfolios...");

        const portfolios = [
            {
                _id: "portfolio-001",
                investorId: "investor-profile-001",
                fundName: "Velocity Fund",
                totalInvested: "5000000.00",
                currentValue: "5750000.00",
                returns: "15.0000",
                irr: "15.0000",
                deploymentStatus: "deployed",
            },
        ];

        await Portfolio.insertMany(portfolios);
        console.log(`   ✅ Created ${portfolios.length} portfolios`);

        // ==================== SUMMARY ====================
        console.log("\n" + "=".repeat(60));
        console.log("🎉 SEED COMPLETE!");
        console.log("=".repeat(60));
        console.log("\n📋 TEST CREDENTIALS:\n");
        console.log("┌─────────────────────────────────────────────────────────┐");
        console.log("│ YOUR LOGIN (Admin + Investor)                           │");
        console.log("│ Email: " + YOUR_EMAIL.padEnd(43) + "│");
        console.log("│ Phone: " + YOUR_PHONE.padEnd(43) + "│");
        console.log("│ Password: password123                                   │");
        console.log("└─────────────────────────────────────────────────────────┘");
        console.log("\n💡 OTP will be displayed in the server terminal when you login.\n");
        console.log("📧 Contact form emails will be sent to: vv0895188@gmail.com\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seed();
