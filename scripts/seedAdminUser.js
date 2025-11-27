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

const clearAndSeedAdminUser = async () => {
    try {
        // Connect to database
        await connectDB();

        // Import all models that reference users
        const { User } = await import('../src/models/user.model.js');
        const { Tweet } = await import('../src/models/tweet.model.js');
        const { Comment } = await import('../src/models/comment.model.js');

        console.log('\n🔄 Clearing all user-related collections...');
        console.log('   This ensures data integrity after clearing users.\n');

        // Clear collections that reference users (order matters for referential integrity)
        // Use direct MongoDB collection access for reliability

        // Clear subscriptions (depends on users)
        try {
            const subscriptionCollection = mongoose.connection.db.collection('subscriptions');
            const subscriptionResult = await subscriptionCollection.deleteMany({});
            console.log(`   ✅ Deleted ${subscriptionResult.deletedCount} subscription(s)`);
        } catch (error) {
            console.log(`   ⚠️  Could not delete subscriptions: ${error.message}`);
        }

        // Clear comments (depend on users, can also reference tweets/videos)
        try {
            const commentResult = await Comment.deleteMany({});
            console.log(`   ✅ Deleted ${commentResult.deletedCount} comment(s)`);
        } catch (error) {
            console.log(`   ⚠️  Could not delete comments: ${error.message}`);
        }

        // Clear tweets (depend on users)
        try {
            const tweetResult = await Tweet.deleteMany({});
            console.log(`   ✅ Deleted ${tweetResult.deletedCount} tweet(s)`);
        } catch (error) {
            console.log(`   ⚠️  Could not delete tweets: ${error.message}`);
        }

        // Clear videos (depend on users) - use direct collection access
        try {
            const videoCollection = mongoose.connection.db.collection('videos');
            const videoResult = await videoCollection.deleteMany({});
            console.log(`   ✅ Deleted ${videoResult.deletedCount} video(s)`);
        } catch (error) {
            console.log(`   ⚠️  Could not delete videos: ${error.message}`);
        }

        // Finally, clear users (this also clears watchHistory references)
        const userResult = await User.deleteMany({});
        console.log(`   ✅ Deleted ${userResult.deletedCount} user(s)`);

        console.log('\n✅ All collections cleared successfully!\n');

        // Extract username from email (before @)
        const userName = untouchableEmail.split('@')[0].toLowerCase();

        // Create admin user
        // Password will be automatically hashed by the User model's pre-save hook
        console.log('👤 Creating admin user...');
        const adminUserData = {
            userName: userName,
            email: untouchableEmail.toLowerCase(),
            fullName: 'Admin User',
            password: '12345678', // Will be automatically hashed by pre-save hook
            role: 'admin',
            avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Default placeholder avatar
            coverImage: '',
            isDisabled: false,
        };
        
        const adminUser = await User.create(adminUserData);

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📋 User Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Email:     ${adminUser.email}`);
        console.log(`   Username:  ${adminUser.userName}`);
        console.log(`   Role:      ${adminUser.role}`);
        console.log(`   Password:  12345678`);
        console.log(`   User ID:   ${adminUser._id}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
clearAndSeedAdminUser();

