import dotenv from 'dotenv';
import User from '../models/User.js';
import { supabase } from '../config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('🔗 Connecting to Supabase...');

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@7supercity.com' });

        if (adminExists) {
            console.log('⚠️  Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@7supercity.com',
            password: 'admin123',
            role: 'admin',
            isActive: true,
        });

        console.log('✅ Admin user created successfully');
        console.log('📧 Email: admin@7supercity.com');
        console.log('🔑 Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
