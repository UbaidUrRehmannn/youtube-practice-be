import dotenv from 'dotenv';
dotenv.config();

const constant = {
    dbName: 'youtubePracticeDb',
    dataLimit: '20kb',
    avatarImageSize: 2, // size is in MB
    coverImageSize: 3, // size is in MB
    mimeType: {
        image: 'image/',
        webp: 'image/webp',
    },
    publicRouts: [
        '/health-check', 
        '/health-check-be', 
        '/register', 
        '/login', 
        '/refreshToken',
        '/api-docs', 
        '/tweet/getAllTweets', 
        '/tweet/getTweetById/:id',
        '/tweet/:id/likes',
        '/tweet/:id/dislikes',
        '/tweet/:id/reposts',
        '/docs/swagger.json',
        '/docs/openapi.yaml',
        '/docs/postman-collection.json'
    ],
    messages: {
        error: 'Something went wrong',
        success: 'Success',
    },
};

export const envVariables = {
    environment: process.env.ENVIRONMENT,
    port: process.env.PORT,
    mongoDbUri: process.env.MONGODB_URI,
    frontendUrl: process.env.FRONTEND_URL,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    frontendUrls: process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(url => url.trim()) : [],
};

export const untouchableEmail = "ubaidurrehman127@gmail.com"
// Tweet statuses for content moderation
export const tweetStatuses = {
    DRAFT: 'draft',
    AWAITING_APPROVAL: 'awaiting_approval',
    APPROVED: 'approved',
    PUBLISHED: 'published',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
    // Add more statuses as needed
};

// User roles for easy reference and validation
export const userRoles = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
};

// List of supported resource types for dynamic RBAC
export const resourceTypes = [
  'user',
  'video',
  'tweet',
  'comment',
  'playlist',
  'subscription',
  'like',
  // Add more as needed
];

// Centralized permissions for each resource type and role
export const resourcePermissions = {
  user: {
    // Public actions - anyone can access (no auth required)
      public: ['login', 'register', 'refreshToken'],
    
    // Authenticated actions - all logged-in users (user, moderator, admin)
    authenticated: [
      'me', 
      'updatePassword', 
      'updateAvatar', 
      'updateCover', 
      'channel', 
      'watchHistory', 
      'logout',
      'deleteUser',
      ':id',  // getUserById
      'updateUser',  // Allow users to update their own profile
      'allUsers',    // <--- moved here from admin
    ],
    
    // Admin-only actions - only admin can access
    admin: [
      'deleteUser',           // DELETE /user/deleteUser
      'updateUser/:id',       // PATCH /user/updateUser/123
      'deleteUser/:id',       // DELETE /user/deleteUser/123
      'moderate'
    ],
    
    // Moderator actions - moderator and admin can access
    moderator: [
      'updateUser/:id',       // PATCH /user/updateUser/123 (others)
      'moderate'              // GET /user/moderate (user management)
    ],
    
    // Note: Users can only access authenticated actions (self-management)
    // Moderators can access authenticated + moderator actions
    // Admins can access all actions
  },
  
  tweet: {
    // Public actions - anyone can view published tweets and user lists
    public: [
      'getAllTweets', 
      'getTweetById', 
      'searchTweets',
      ':id/likes',      // Get users who liked a tweet
      ':id/dislikes',   // Get users who disliked a tweet
      ':id/reposts'     // Get users who reposted a tweet
    ],
    
    // Authenticated actions - all logged-in users can create and manage their own tweets
    authenticated: [
      'createTweet',
      'updateTweet',          // Update own tweet
      'deleteTweet',          // Delete own tweet
      'likeTweet',
      'dislikeTweet',
      'repostTweet',
      'getMyTweets'           // Get user's own tweets
    ],
    
    // Admin actions - only admin can access
    admin: [
      'updateTweet/:id',      // Update any tweet
      'deleteTweet/:id',      // Delete any tweet
      'updateTweetStatus/:id', // Update status of any tweet
      'moderate',
    ],
    
    // Moderator actions - moderator and admin can access
    moderator: [
      'updateTweetStatus/:id', // Update status of any tweet
      'moderate'               // GET /tweet/moderate (tweet moderation)
    ],
    
    // Owner actions - only tweet owner can access (handled in controller)
    owner: [
      'updateTweet',
      'deleteTweet'
    ]
  },
  
  // Future resource types (for when you add video, tweet, etc.)
  video: {
    public: ['getAllVideos', 'getVideoById', 'searchVideos'],
    authenticated: ['uploadVideo', 'likeVideo', 'dislikeVideo'],
    owner: ['updateVideo', 'deleteVideo'],
  },
  comment: {
    public: ['getComments'],
    authenticated: ['addComment', 'likeComment'],
    owner: ['updateComment', 'deleteComment'],
  },
  playlist: {
    authenticated: ['createPlaylist', 'addToPlaylist', 'removeFromPlaylist'],
    owner: ['updatePlaylist', 'deletePlaylist'],
  },
  subscription: {
    authenticated: ['subscribe', 'unsubscribe', 'getSubscriptions'],
  },
  like: {
    authenticated: ['like', 'unlike', 'getLikes'],
  },
  // Add more resources as needed
};
// roleBasedRoutes: {
//     admin: ['*'],
//     moderator: [
//         '/register',
//         '/login',
//         '/logout',
//         '/refreshToken',
//         '/updatePassword',
//         '/me',
//         '/updateUser',
//         '/updateUser/:id',
//         '/updateAvatar',
//         '/updateCover',
//         '/deleteUser',
//         '/channel/:username',
//         '/watchHistory',
//         '/allUsers',
//         '/:id',
//     ],
//     user: [
//         '/register',
//         '/login',
//         '/logout',
//         '/refreshToken',
//         '/updatePassword',
//         '/me',
//         '/updateUser',
//         '/updateAvatar',
//         '/updateCover',
//         '/deleteUser',
//         '/channel/:username',
//         '/watchHistory',
//         '/allUsers',
//         '/:id',
//     ],
// },

export default constant;
