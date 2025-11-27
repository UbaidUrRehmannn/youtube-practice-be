import dotenv from 'dotenv';
import mongoose from 'mongoose';
import constant, { envVariables, untouchableEmail } from '../src/constant.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        const DbConnectionInstance = await mongoose.connect(
            `${envVariables.mongoDbUri}/${constant.dbName}`
        );
        console.log(`\n✅ MongoDB connected !! DB HOST: ${DbConnectionInstance.connection.host}`);
        return DbConnectionInstance;
    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
        throw error;
    }
};

// Generate a random username if default is taken
const generateRandomUsername = () => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `admin${randomSuffix}`;
};

// Get available username (tries 'admin' first, then random if taken)
const getAvailableUsername = async (User, preferredUsername = 'admin') => {
    const existingUser = await User.findOne({ userName: preferredUsername.toLowerCase() });
    if (!existingUser) {
        return preferredUsername.toLowerCase();
    }
    
    // If username is taken, generate a random one
    let randomUsername;
    let usernameExists = true;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (usernameExists && attempts < maxAttempts) {
        randomUsername = generateRandomUsername();
        const checkUser = await User.findOne({ userName: randomUsername.toLowerCase() });
        usernameExists = !!checkUser;
        attempts++;
    }
    
    if (usernameExists) {
        // Last resort: use timestamp-based username
        randomUsername = `admin${Date.now()}`;
    }
    
    return randomUsername.toLowerCase();
};

const seedAdminUserOnly = async () => {
    try {
        // Connect to database
        await connectDB();

        // Import User model
        const { User } = await import('../src/models/user.model.js');

        console.log('\n🔍 Checking if admin user exists...\n');

        // Check if user with untouchable email already exists
        const existingUser = await User.findOne({ email: untouchableEmail.toLowerCase() });

        if (existingUser) {
            console.log('⚠️  User with untouchable email already exists!');
            console.log('   Updating password and username...\n');

            // Get available username
            let newUsername = 'admin';
            const usernameCheck = await User.findOne({ 
                userName: 'admin',
                _id: { $ne: existingUser._id } // Exclude current user
            });

            if (usernameCheck) {
                console.log('   ⚠️  Username "admin" is already taken!');
                newUsername = await getAvailableUsername(User, 'admin');
                console.log(`   ✅ Assigned random username: ${newUsername}\n`);
            }

            // Update user with new password and username
            existingUser.userName = newUsername;
            existingUser.password = '12345678'; // Will be hashed by pre-save hook
            existingUser.role = 'admin'; // Ensure role is admin
            existingUser.isDisabled = false; // Ensure not disabled
            
            // Ensure avatar exists (if missing)
            if (!existingUser.avatar) {
                existingUser.avatar = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
            }

            await existingUser.save();

            console.log('✅ Admin user updated successfully!');
            console.log('\n📋 Updated User Details:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   Email:     ${existingUser.email}`);
            console.log(`   Username:  ${existingUser.userName}`);
            console.log(`   Role:      ${existingUser.role}`);
            console.log(`   Password:  12345678 (updated)`);
            console.log(`   User ID:   ${existingUser._id}`);
            
            if (newUsername !== 'admin') {
                console.log(`\n   ⚠️  Note: Username was set to "${newUsername}" because "admin" was taken`);
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } else {
            console.log('✅ No existing user found with untouchable email');
            console.log('   Creating new admin user...\n');

            // Get available username
            let username = 'admin';
            const usernameCheck = await User.findOne({ userName: 'admin' });

            if (usernameCheck) {
                console.log('   ⚠️  Username "admin" is already taken!');
                username = await getAvailableUsername(User, 'admin');
                console.log(`   ✅ Assigned random username: ${username}\n`);
            }

            // Create new admin user
            const adminUserData = {
                userName: username,
                email: untouchableEmail.toLowerCase(),
                fullName: 'Admin User',
                password: '12345678', // Will be automatically hashed by pre-save hook
                role: 'admin',
                avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Default placeholder avatar
                coverImage: '',
                isDisabled: false,
            };
            
            const adminUser = await User.create(adminUserData);

            console.log('✅ Admin user created successfully!');
            console.log('\n📋 User Details:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   Email:     ${adminUser.email}`);
            console.log(`   Username:  ${adminUser.userName}`);
            console.log(`   Role:      ${adminUser.role}`);
            console.log(`   Password:  12345678`);
            console.log(`   User ID:   ${adminUser._id}`);
            
            if (username !== 'admin') {
                console.log(`\n   ⚠️  Note: Username was set to "${username}" because "admin" was taken`);
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

        // Close database connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error seeding admin user:', error.message);
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the script
seedAdminUserOnly();

