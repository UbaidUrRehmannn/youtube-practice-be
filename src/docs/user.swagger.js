/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "507f1f77bcf86cd799439012"
 *         userName:
 *           type: string
 *           description: Unique username (alphanumeric)
 *           example: "john_doe"
 *         email:
 *           type: string
 *           description: User's email address
 *           example: "john@example.com"
 *         fullName:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image (webp)
 *           example: "https://res.cloudinary.com/example/avatar.jpg"
 *         coverImage:
 *           type: string
 *           description: URL to user's cover image (webp, optional)
 *           example: "https://res.cloudinary.com/example/cover.jpg"
 *         role:
 *           type: string
 *           enum: [user, moderator, admin]
 *           description: User's role in the system
 *           example: "user"
 *         isDisabled:
 *           type: boolean
 *           description: Whether the user account is disabled
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 *           example: "2024-01-15T10:30:00.000Z"
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Register a new user account. Public endpoint. Admins can register users with any role; others default to 'user'.
 *       Requires avatar (webp) and optional cover image (webp).
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: Unique username (alphanumeric)
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: "john@example.com"
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image (webp, required)
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Cover image (webp, optional)
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *                 description: Role for the new user (admin only)
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (missing/invalid fields)
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     description: |
 *       Authenticate a user with email or username and password. Returns access and refresh tokens on success.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address (optional if username provided)
 *                 example: "john@example.com"
 *               userName:
 *                 type: string
 *                 description: User's username (optional if email provided)
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User login successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken: "<jwt-access-token>"
 *                 refreshToken: "<jwt-refresh-token>"
 *               message: "User login successfully"
 *               success: true
 *       400:
 *         description: Bad request (missing/invalid fields)
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /user/logout:
 *   get:
 *     summary: Logout a logged-in user
 *     description: |
 *       Logs out the current user by clearing authentication cookies and invalidating the refresh token in the database.
 *       Requires a valid access token.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logout successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "User logout successfully"
 *               success: true
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

/**
 * @swagger
 * /user/refreshToken:
 *   post:
 *     summary: Give user updated access and refresh token
 *     description: |
 *       Refreshes the user's access and refresh tokens. Accepts the refresh token in the request body or as a cookie.
 *       Returns new tokens and user data on success.
 *     tags: [Users]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional. Refresh token can be sent in body or as a cookie.
 *                 example: "<jwt-refresh-token>"
 *     responses:
 *       200:
 *         description: Tokens updated successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken: "<jwt-access-token>"
 *                 refreshToken: "<jwt-refresh-token>"
 *               message: "Tokens updated successfully"
 *               success: true
 *       401:
 *         description: Unauthorized (missing/invalid refresh token)
 */

/**
 * @swagger
 * /user/updatePassword:
 *   post:
 *     summary: Update user password
 *     description: |
 *       Updates the current user's password. Requires the current password for verification.
 *       The new password must be different from the current password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password for verification
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 description: New password (must be different from current)
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data: null
 *               message: "Password updated successfully"
 *               success: true
 *       400:
 *         description: Bad request (missing fields, same password, or incorrect current password)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user data
 *     description: |
 *       Retrieves the current user's profile data based on the authenticated token.
 *       Returns user information excluding sensitive fields like password and refresh token.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User data received successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *               message: "User data received successfully"
 *               success: true
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

/**
 * @swagger
 * /user/updateUser:
 *   patch:
 *     summary: Update user data (self)
 *     description: |
 *       Updates the current user's profile information. Users can update their email and fullName.
 *       Requires authentication and can only update own profile.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: New email address (optional)
 *                 example: "newemail@example.com"
 *               fullName:
 *                 type: string
 *                 description: New full name (optional)
 *                 example: "John Smith"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *               message: "User updated successfully"
 *               success: true
 *       400:
 *         description: Bad request (invalid email format or no changes made)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 */

/**
 * @swagger
 * /user/updateUser/{id}:
 *   patch:
 *     summary: Admin update any user by ID
 *     description: |
 *       Allows admins and moderators to update other users' profiles. Admins can update role and isDisabled;
 *       moderators can only update isDisabled. Requires admin or moderator permissions.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to update
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: New email address (optional)
 *                 example: "newemail@example.com"
 *               fullName:
 *                 type: string
 *                 description: New full name (optional)
 *                 example: "John Smith"
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *                 description: New role (admin only)
 *                 example: "moderator"
 *               isDisabled:
 *                 type: boolean
 *                 description: Whether to disable the user account (admin/moderator only)
 *                 example: false
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *               message: "User updated successfully"
 *               success: true
 *       400:
 *         description: Bad request (invalid user ID, email format, or role)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/deleteUser:
 *   delete:
 *     summary: Delete current user
 *     description: |
 *       Allows users to delete their own account. Removes user data and associated images from the system.
 *       Clears authentication cookies upon successful deletion.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "User deleted successfully"
 *               success: true
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/deleteUser/{id}:
 *   delete:
 *     summary: Admin delete any user by ID
 *     description: |
 *       Allows admins to delete any user account by ID. Removes user data and associated images from the system.
 *       Only admins have permission to delete other users.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to delete
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "User deleted successfully"
 *               success: true
 *       400:
 *         description: Bad request (invalid user ID)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/allUsers:
 *   get:
 *     summary: Get all users with enhanced pagination and security
 *     description: |
 *       Enhanced user listing endpoint with advanced pagination, sorting, and security features.
 *       
 *       **Security Features:**
 *       - Automatic exclusion of sensitive fields (password, refreshToken)
 *       - Input validation and sanitization
 *       - Sort field validation to prevent injection attacks
 *       - Rate limiting ready (can be added via middleware)
 *       
 *       **Pagination Features:**
 *       - Configurable page size with limits
 *       - Accurate total counts
 *       - Navigation metadata (hasNextPage, hasPrevPage)
 *       - Performance optimized with parallel queries
 *       
 *       **Sorting Features:**
 *       - Multiple sort fields supported
 *       - Ascending/descending order
 *       - Whitelist validation for sort fields
 *       
 *       **Error Handling:**
 *       - Comprehensive error messages
 *       - Input validation errors
 *       - Database error handling
 *       
 *       **Response Structure:**
 *       - Consistent API response format
 *       - Pagination metadata
 *       - Sanitized user data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page (max 100)
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, updatedAt, -updatedAt, userName, -userName, fullName, -fullName, email, -email, role, -role]
 *         description: Sort field and direction (prefix with - for descending)
 *         example: "-createdAt"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, moderator, admin]
 *         description: Filter users by role
 *         example: "user"
 *       - in: query
 *         name: isDisabled
 *         schema:
 *           type: boolean
 *         description: Filter users by disabled status
 *         example: false
 *     responses:
 *       200:
 *         description: Users fetched successfully with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalResults:
 *                           type: integer
 *                           example: 48
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 message:
 *                   type: string
 *                   example: "Users fetched successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *             example:
 *               statusCode: 200
 *               data:
 *                 users:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     userName: "john_doe"
 *                     email: "john@example.com"
 *                     fullName: "John Doe"
 *                     avatar: "https://res.cloudinary.com/example/avatar.jpg"
 *                     coverImage: "https://res.cloudinary.com/example/cover.jpg"
 *                     role: "user"
 *                     isDisabled: false
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 5
 *                   totalResults: 48
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *               message: "Users fetched successfully"
 *               success: true
 *       400:
 *         description: Bad request - invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid sort field: invalidField"
 *                 success:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: |
 *       Retrieves a specific user's profile information by their unique ID.
 *       Returns user data excluding sensitive fields like password and refresh token.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to fetch
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 $ref: '#/components/schemas/User'
 *               message: "User fetched successfully"
 *               success: true
 *       400:
 *         description: Bad request (invalid user ID format)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/updateAvatar:
 *   patch:
 *     summary: Update user avatar
 *     description: |
 *       Updates the current user's avatar image. Accepts only webp format images.
 *       Replaces the existing avatar and removes the old image from storage.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (webp format only, required)
 *     responses:
 *       200:
 *         description: User Avatar updated successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *               message: "User Avatar updated successfully"
 *               success: true
 *       400:
 *         description: Bad request (missing file, invalid format, or file too large)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error (upload failed)
 */

/**
 * @swagger
 * /user/updateCover:
 *   patch:
 *     summary: Update user cover image
 *     description: |
 *       Updates the current user's cover image. Accepts only webp format images.
 *       Replaces the existing cover image and removes the old image from storage.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file (webp format only, required)
 *     responses:
 *       200:
 *         description: User cover image updated successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *               message: "User cover image updated successfully"
 *               success: true
 *       400:
 *         description: Bad request (missing file, invalid format, or file too large)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error (upload failed)
 */

/**
 * @swagger
 * /user/channel/{username}:
 *   get:
 *     summary: Get user/channel profile data
 *     description: |
 *       Retrieves detailed profile information for a specific user/channel by username.
 *       Includes subscriber count, channels count, and subscription status for the current user.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the channel to fetch
 *         example: "john_doe"
 *     responses:
 *       200:
 *         description: User channel fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 fullName: "John Doe"
 *                 userName: "john_doe"
 *                 subscribersCount: 150
 *                 channelsCount: 25
 *                 isSubscribed: true
 *                 avatar: "https://res.cloudinary.com/example/avatar.jpg"
 *                 coverImage: "https://res.cloudinary.com/example/cover.jpg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 email: "john@example.com"
 *               message: "User channel fetched successfully"
 *               success: true
 *       400:
 *         description: Bad request (username is required)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Channel does not exist
 */

/**
 * @swagger
 * /user/watchHistory:
 *   get:
 *     summary: Get user watch history
 *     description: |
 *       Retrieves the current user's video watch history. Returns a list of videos with publisher information
 *       that the user has previously watched.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Watch History fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   title: "Sample Video"
 *                   description: "A sample video description"
 *                   thumbnail: "https://res.cloudinary.com/example/thumbnail.jpg"
 *                   videoFile: "https://res.cloudinary.com/example/video.mp4"
 *                   duration: 120
 *                   views: 1000
 *                   publishedBy:
 *                     fullName: "John Doe"
 *                     userName: "john_doe"
 *                     avatar: "https://res.cloudinary.com/example/avatar.jpg"
 *               message: "Watch History fetched successfully"
 *               success: true
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

/**
 * @swagger
 * /user/moderate:
 *   get:
 *     summary: Get users for moderation (admin/moderator only)
 *     description: |
 *       Advanced user management endpoint for admins and moderators.
 *       
 *       **Access Control:**
 *       - **Admin**: Can see all users except themselves
 *       - **Moderator**: Can see all users except themselves and admins
 *       
 *       **Features:**
 *       - Advanced search by username, email, fullName, role, isDisabled
 *       - Pagination with accurate total counts (filtered results only)
 *       - Excludes current user from results
 *       - Moderators cannot see admin users
 *       
 *       **Use Cases:**
 *       - User account management
 *       - Role assignment and updates
 *       - Account disable/enable operations
 *       - User search and filtering
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Search users by username (case-insensitive)
 *         example: "john"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Search users by email (case-insensitive)
 *         example: "john@example.com"
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Search users by full name (case-insensitive)
 *         example: "John Doe"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, moderator, admin]
 *         description: Filter users by role
 *         example: "moderator"
 *       - in: query
 *         name: isDisabled
 *         schema:
 *           type: boolean
 *         description: Filter users by disabled status
 *         example: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users fetched for moderation successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalUsers:
 *                           type: integer
 *                           example: 48
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 message:
 *                   type: string
 *                   example: "Users fetched for moderation successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin/moderator access required
 *       400:
 *         description: Bad request - invalid query parameters
 */ 