/**
 * Script to add the requested investor and admin credentials
 * Run with: npx tsx scripts/add-requested-users.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
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

async function addRequestedUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // ==================== INVESTOR: anujr3259@gmail.com ====================
        console.log("\n👤 Creating investor: anujr3259@gmail.com...");

        const investorEmail = "anujr3259@gmail.com";
        const investorPassword = "anujr3259"; // User provided password

        // Check if already exists
        const existingInvestorUser = await User.findOne({ email: investorEmail });
        if (existingInvestorUser) {
            console.log(`   ⚠️  User with email ${investorEmail} already exists. Skipping.`);
        } else {
            const hashedInvestorPassword = await bcrypt.hash(investorPassword, 10);
            const investorUserId = randomUUID();

            await User.create({
                _id: investorUserId,
                email: investorEmail,
                password: hashedInvestorPassword,
                firstName: "Anuj",
                lastName: "Investor",
            });

            const investorProfileId = randomUUID();
            await InvestorProfile.create({
                _id: investorProfileId,
                userId: investorUserId,
                firstName: "Anuj",
                lastName: "Investor",
                email: investorEmail,
                investorType: "individual",
                kycStatus: "verified",
                riskProfile: "moderate",
                isActive: true,
            });

            await Portfolio.create({
                _id: randomUUID(),
                investorId: investorProfileId,
                fundName: "Velocity Fund",
                totalInvested: "1000000.00",
                currentValue: "1100000.00",
                returns: "10.0000",
                irr: "10.0000",
                deploymentStatus: "deployed",
            });

            console.log(`   ✅ Investor created: ${investorEmail}`);
        }

        // ==================== ADMIN: lalit007lodhi@gmail.com ====================
        console.log("\n👨‍💼 Creating admin: lalit007lodhi@gmail.com...");

        const adminEmail = "lalit007lodhi@gmail.com";
        const adminPassword = "lalit007lodhi"; // User provided password

        // Check if already exists
        const existingAdminUser = await User.findOne({ email: adminEmail });
        if (existingAdminUser) {
            console.log(`   ⚠️  User with email ${adminEmail} already exists. Skipping.`);
        } else {
            const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
            const adminUserId = randomUUID();

            await User.create({
                _id: adminUserId,
                email: adminEmail,
                password: hashedAdminPassword,
                firstName: "Lalit",
                lastName: "Admin",
            });

            await AdminUser.create({
                _id: randomUUID(),
                userId: adminUserId,
                role: "super_admin",
                permissions: ["all"],
                isActive: true,
            });

            console.log(`   ✅ Admin created: ${adminEmail}`);
        }

        // ==================== SUMMARY ====================
        console.log("\n" + "=".repeat(60));
        console.log("🎉 DONE!");
        console.log("=".repeat(60));
        console.log("\n📋 NEW CREDENTIALS:\n");
        console.log("┌─────────────────────────────────────────────────────────┐");
        console.log("│ INVESTOR LOGIN                                          │");
        console.log("│ Email: anujr3259@gmail.com                              │");
        console.log("│ Password: anujr3259                                     │");
        console.log("├─────────────────────────────────────────────────────────┤");
        console.log("│ ADMIN LOGIN                                             │");
        console.log("│ Email: lalit007lodhi@gmail.com                          │");
        console.log("│ Password: lalit007lodhi                                 │");
        console.log("└─────────────────────────────────────────────────────────┘");
        console.log("\n💡 OTP will be displayed in the server terminal when you login.\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error);
        process.exit(1);
    }
}

addRequestedUsers();
