import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { users, investorProfiles, portfolios } from "../shared/schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

async function createInvestor() {
  const email = process.argv[2];
  const password = process.argv[3];
  const phone = process.argv[4] || "9876543210";

  if (!email || !password) {
    console.log("Usage: npx tsx scripts/create-investor.ts <email> <password> [phone]");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    // Create user
    await db.insert(users).values({
      id: userId,
      email,
      phone,
      password: hashedPassword,
      firstName: "Test",
      lastName: "Investor",
    });

    const investorId = randomUUID();
    // Create investor profile
    await db.insert(investorProfiles).values({
      id: investorId,
      userId,
      firstName: "Test",
      lastName: "Investor",
      email,
      phone,
      kycStatus: "verified",
      investorType: "individual",
    });

    // Create initial portfolio
    await db.insert(portfolios).values({
      id: randomUUID(),
      investorId,
      totalInvested: "1000000",
      currentValue: "1100000",
      returns: "10.0",
      irr: "10.0",
    });

    console.log(`Investor user created successfully: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating investor user:", error);
    process.exit(1);
  }
}

createInvestor();
