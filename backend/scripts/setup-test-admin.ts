import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function setup() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in environment');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'vishalverma4942@gmail.com';
        const password = 'password123';
        const hashedPassword = await bcryptjs.hash(password, 10);

        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection failed');

        // Update or create user in 'users' collection
        const userResult = await db.collection('users').findOneAndUpdate(
            { email },
            {
                $set: {
                    email,
                    password: hashedPassword,
                    role: 'super_admin',
                    updatedAt: new Date()
                },
                $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true, returnDocument: 'after' }
        );

        const userId = userResult?._id?.toString();
        console.log('User synced:', email, 'ID:', userId);

        if (userId) {
            // Ensure admin user entry exists
            await db.collection('adminusers').findOneAndUpdate(
                { userId: userId },
                {
                    $set: {
                        userId: userId,
                        role: 'super_admin',
                        permissions: ['all'],
                        updatedAt: new Date()
                    },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true }
            );
            console.log('Admin user entry synced for:', email);
        }

        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

setup();
