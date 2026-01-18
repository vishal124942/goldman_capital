
import mongoose from "mongoose";
import { User, InvestorProfile, Portfolio } from "../../models/mongodb";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function debugPortfolio() {
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
    logMsg("Connected to MongoDB via Debug Portfolio Script");

    // 1. Find Anuj's Profile
    const investors = await InvestorProfile.find({
      $or: [
        { firstName: { $regex: "Anuj", $options: "i" } },
        { lastName: { $regex: "Anuj", $options: "i" } }
      ]
    });

    logMsg(`\nFound ${investors.length} investor(s) named 'Anuj':`);

    for (const inv of investors) {
      logMsg(`\n[Investor Profile]`);
      logMsg(` - Name: ${inv.firstName} ${inv.lastName}`);
      logMsg(` - ID: ${inv._id}`);
      logMsg(` - UserID: ${inv.userId}`);
      
      // 2. Find Portfolio by investorId
      logMsg(`\n   Searching for Portfolio using investorId: ${inv._id}`);
      const portfolios = await Portfolio.find({ investorId: inv._id });
      
      if (portfolios.length === 0) {
           logMsg("   ⚠️ NO PORTFOLIO FOUND for this investor ID.");
           
           // Extra check: try searching by string vs objectId if applicable (though schema says string)
           // But just in case
           const p2 = await Portfolio.find({ investorId: inv._id.toString() });
           if (p2.length > 0) logMsg("   (Found by manual string conversion)");
      } else {
           for (const p of portfolios) {
               logMsg(`   ✅ Found Portfolio: ${p._id}`);
               logMsg(`      - Total Invested: "${p.totalInvested}" (Type: ${typeof p.totalInvested})`);
               logMsg(`      - Current Value: "${p.currentValue}"`);
               logMsg(`      - Created At: ${p.createdAt}`);
           }
      }
    }

  } catch (error: any) {
    logMsg("Error: " + error.message);
  } finally {
    await mongoose.disconnect();
    fs.writeFileSync("debug_portfolio_output.txt", log.join("\n"));
  }
}

debugPortfolio();
