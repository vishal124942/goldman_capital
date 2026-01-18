
import mongoose from "mongoose";
import { User, InvestorProfile, Statement } from "../../models/mongodb";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function debugAnuj() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB via Debug Script");

    // 1. Find Investor Profile for "Anuj"
    const investors = await InvestorProfile.find({
      $or: [
        { firstName: { $regex: "Anuj", $options: "i" } },
        { lastName: { $regex: "Anuj", $options: "i" } }
      ]
    });

    console.log(`Found ${investors.length} investor(s) matching 'Anuj':`);
    
    for (const inv of investors) {
      console.log("------------------------------------------------");
      console.log(`Investor Profile: ${inv.firstName} ${inv.lastName}`);
      console.log(`ID: ${inv._id}`);
      console.log(`Linked UserID: ${inv.userId}`);
      console.log(`Email: ${inv.email}`);
      
      // Check for User with this email
      if (inv.email) {
        const user = await User.findOne({ email: inv.email });
        if (user) {
          console.log(`found User with matching email (${inv.email}):`);
          console.log(`User ID: ${user._id}`);
          console.log(`User Email: ${user.email}`);
          
          if (inv.userId !== user._id.toString()) {
            console.log("!!! MISMATCH: InvestorProfile.userId does NOT match found User._id !!!");
          } else {
             console.log("Linkage OK: InvestorProfile.userId matches User._id");
          }
        } else {
          console.log(`No User found with email: ${inv.email}`);
        }
      }

      // Check statements
      const statements = await Statement.find({ investorId: inv._id });
      console.log(`Found ${statements.length} statements for this investor.`);
      statements.forEach(s => {
          console.log(` - Statement: ${s.fileName} (ID: ${s._id})`);
      });
      console.log("------------------------------------------------");
    }

    // 2. Also check if there's any user named Anuj
    const users = await User.find({
      $or: [
        { firstName: { $regex: "Anuj", $options: "i" } },
        { lastName: { $regex: "Anuj", $options: "i" } }
      ]
    });
    console.log(`Found ${users.length} users matching 'Anuj' in Users collection.`);

  } catch (error) {
    console.error("Debug Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAnuj();
