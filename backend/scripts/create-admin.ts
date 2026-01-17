import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { users, adminUsers } from "../shared/schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || "super_admin";
  const phone = process.argv[5];

  if (!email || !password) {
    console.log("Usage: npx tsx scripts/create-admin.ts <email> <password> [role] [phone]");
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
      firstName: "System",
      lastName: "Admin",
    });

    // Create admin record
    await db.insert(adminUsers).values({
      id: randomUUID(),
      userId,
      role: role as any,
      permissions: ["all"],
      isActive: true,
    });

    console.log(`Admin user created successfully: ${email}${phone ? ` with phone ${phone}` : ""}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
