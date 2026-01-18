
import mongoose from "mongoose";
import { User, InvestorProfile } from "../../models/mongodb";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function fixAnuj() {
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
    logMsg("Connected to MongoDB via Fix Script");

    // 1. Find Investor Profile for "Anuj"
    const investors = await InvestorProfile.find({
      $or: [
        { firstName: { $regex: "Anuj", $options: "i" } },
        { lastName: { $regex: "Anuj", $options: "i" } }
      ]
    });

    logMsg(`Found ${investors.length} investor(s) matching 'Anuj'`);
    
    for (const inv of investors) {
      logMsg("------------------------------------------------");
      logMsg(`Processing Investor: ${inv.firstName} ${inv.lastName} (ID: ${inv._id})`);
      logMsg(`Current userId: ${inv.userId}`);
      logMsg(`Email: ${inv.email}`);

      if (inv.email) {
        const user = await User.findOne({ email: inv.email });
        if (user) {
          logMsg(`Found matching User: ${user._id} (${user.email})`);
          
          if (inv.userId !== user._id.toString()) {
            logMsg("Linkage is MISSING or WRONG. Fixing...");
            inv.userId = user._id.toString();
            await inv.save();
            logMsg("SUCCESS: Updated InvestorProfile with correct userId.");
          } else {
            logMsg("Linkage is already CORRECT.");
          }
        } else {
          logMsg(`No User found with email: ${inv.email}`);
        }
      } else {
        logMsg("Investor has no email, cannot link by email.");
      }
      logMsg("------------------------------------------------");
    }

  } catch (error: any) {
    logMsg("Fix Error: " + error.message);
    if (error.stack) logMsg(error.stack);
  } finally {
    await mongoose.disconnect();
    fs.writeFileSync("fix_output.txt", log.join("\n"));
  }
}

fixAnuj();
