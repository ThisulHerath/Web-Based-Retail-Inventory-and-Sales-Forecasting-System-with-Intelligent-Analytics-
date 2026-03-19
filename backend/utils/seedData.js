import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { supabase } from '../config/db.js';

dotenv.config();

const seedData = async () => {
    try {
        console.log('🔗 Connecting to Supabase...');
        console.log('✅ Supabase Connected');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // await Product.deleteMany({});

        // Create users with different roles
        const users = [
            {
                name: 'Admin User',
                email: 'admin@7supercity.com',
                password: 'admin123',
                role: 'admin',
                isActive: true,
            },
            {
                name: 'Manager User',
                email: 'manager@7supercity.com',
                password: 'manager123',
                role: 'manager',
                isActive: true,
            },
            {
                name: 'Cashier User',
                email: 'cashier@7supercity.com',
                password: 'cashier123',
                role: 'cashier',
                isActive: true,
            },
        ];

        // Create users (skip if already exists)
        for (const userData of users) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.email} (${userData.role})`);
            } else {
                console.log(`⚠️  User already exists: ${userData.email}`);
            }
        }

        // Create sample products
        const products = [
            {
                productName: 'Rice 1kg',
                category: 'Groceries',
                costPrice: 50,
                sellingPrice: 70,
                currentStock: 100,
                minimumStockLevel: 20,
            },
            {
                productName: 'Sugar 1kg',
                category: 'Groceries',
                costPrice: 40,
                sellingPrice: 55,
                currentStock: 80,
                minimumStockLevel: 15,
            },
            {
                productName: 'Cooking Oil 1L',
                category: 'Groceries',
                costPrice: 120,
                sellingPrice: 150,
                currentStock: 50,
                minimumStockLevel: 10,
            },
            {
                productName: 'Milk 1L',
                category: 'Dairy',
                costPrice: 45,
                sellingPrice: 60,
                currentStock: 30,
                minimumStockLevel: 10,
            },
            {
                productName: 'Bread',
                category: 'Bakery',
                costPrice: 25,
                sellingPrice: 35,
                currentStock: 40,
                minimumStockLevel: 15,
            },
            {
                productName: 'Eggs (12 pcs)',
                category: 'Dairy',
                costPrice: 60,
                sellingPrice: 80,
                currentStock: 25,
                minimumStockLevel: 10,
            },
            {
                productName: 'Tomato Sauce',
                category: 'Condiments',
                costPrice: 30,
                sellingPrice: 45,
                currentStock: 60,
                minimumStockLevel: 20,
            },
            {
                productName: 'Biscuits Pack',
                category: 'Snacks',
                costPrice: 20,
                sellingPrice: 30,
                currentStock: 8,
                minimumStockLevel: 10,
            },
            {
                productName: 'Soap Bar',
                category: 'Personal Care',
                costPrice: 15,
                sellingPrice: 25,
                currentStock: 70,
                minimumStockLevel: 25,
            },
            {
                productName: 'Shampoo 200ml',
                category: 'Personal Care',
                costPrice: 80,
                sellingPrice: 110,
                currentStock: 5,
                minimumStockLevel: 10,
            },
        ];

        // Create products (skip if already exists)
        for (const productData of products) {
            const productExists = await Product.findOne({ productName: productData.productName });
            if (!productExists) {
                await Product.create(productData);
                console.log(`✅ Created product: ${productData.productName}`);
            } else {
                console.log(`⚠️  Product already exists: ${productData.productName}`);
            }
        }

        console.log('\n🎉 Sample data seeded successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('Admin: admin@7supercity.com / admin123');
        console.log('Manager: manager@7supercity.com / manager123');
        console.log('Cashier: cashier@7supercity.com / cashier123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedData();
