
import mongoose from "mongoose";
import { User, InvestorProfile, Statement } from "../../models/mongodb";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function debugStatements() {
  const log: string[] = [];
  function logMsg(msg: string) {
    console.log(msg);
    log.push(msg);
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    logMsg("Connected to MongoDB via Debug Statements Script");

    // 1. Find Anuj's Profile again
    const investors = await InvestorProfile.find({
      $or: [
        { firstName: { $regex: "Anuj", $options: "i" } },
        { lastName: { $regex: "Anuj", $options: "i" } }
      ]
    });

    logMsg(`\nFound ${investors.length} investor(s) named 'Anuj':`);
    const anujIds: string[] = [];

    for (const inv of investors) {
      logMsg(` - Name: ${inv.firstName} ${inv.lastName}`);
      logMsg(`   ID (InvestorProfile._id): ${inv._id}`);
      logMsg(`   UserID link: ${inv.userId}`);
      anujIds.push(inv._id.toString());
      if (inv.userId) anujIds.push(inv.userId); // Add UserID to search too, just in case
    }

    // 2. Dump ALL statements to see what's in there
    const allStatements = await Statement.find({});
    logMsg(`\nTotal Statements in DB: ${allStatements.length}`);
    
    // 3. Check for exact matches
    logMsg("\nChecking Statements associated with Anuj:");
    let foundCount = 0;
    
    for (const stmt of allStatements) {
        let isMatch = false;
        if (anujIds.includes(stmt.investorId)) {
            isMatch = true;
            foundCount++;
        }

        // Only log if it matches OR if it's one of the first few to see formatting
        if (isMatch || foundCount < 3) {
             const matchStr = isMatch ? "MATCHES ANUJ" : "NO MATCH";
             logMsg(` - Statement ID: ${stmt._id}, investorId: ${stmt.investorId} [${matchStr}]`);
             logMsg(`   File: ${stmt.fileName}`);
        }
    }
    
    if (foundCount === 0) {
        logMsg("\nWARNING: No statements found matching Anuj's IDs.");
        logMsg("Listing all unique investorIds found in statements:");
        const uniqueIds = Array.from(new Set(allStatements.map(s => s.investorId)));
        uniqueIds.forEach(uid => logMsg(` - ${uid}`));
        
        // Check if any of these "uniqueIds" look like they exist in InvestorProfile
        for (const uid of uniqueIds) {
            const p = await InvestorProfile.findById(uid);
            if (p) {
                logMsg(`   -> Points to Profile: ${p.firstName} ${p.lastName}`);
            } else {
                const u = await User.findById(uid);
                if (u) {
                     logMsg(`   -> Points to USER (Incorrect!): ${u.firstName} ${u.lastName} (${u.email})`);
                } else {
                     logMsg(`   -> Points to NOTHING`);
                }
            }
        }
    }

  } catch (error: any) {
    logMsg("Error: " + error.message);
  } finally {
    await mongoose.disconnect();
    fs.writeFileSync("debug_statements_output.txt", log.join("\n"));
  }
}

debugStatements();
