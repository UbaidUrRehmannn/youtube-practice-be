/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
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
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
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
 *               userName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User login successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /user/logout:
 *   get:
 *     summary: Logout a logged-in user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logout successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/refreshToken:
 *   post:
 *     summary: Give user updated access and refresh token
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
 *     responses:
 *       200:
 *         description: Tokens updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/updatePassword:
 *   post:
 *     summary: Update user password
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
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user data
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User data received successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/updateUser:
 *   patch:
 *     summary: Update user data (self)
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
 *               fullName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /user/updateUser/{id}:
 *   patch:
 *     summary: Admin update any user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *               isDisabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /user/deleteUser:
 *   delete:
 *     summary: Delete current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/deleteUser/{id}:
 *   delete:
 *     summary: Admin delete any user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/updateAvatar:
 *   patch:
 *     summary: Update user avatar
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
 *     responses:
 *       200:
 *         description: User Avatar updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/updateCover:
 *   patch:
 *     summary: Update user cover image
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
 *     responses:
 *       200:
 *         description: User cover image updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/channel/{username}:
 *   get:
 *     summary: Get user/channel profile data
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username
 *     responses:
 *       200:
 *         description: User channel fetched successfully
 *       401:
 *         description: Username is required
 *       404:
 *         description: Channel does not exist
 */

/**
 * @swagger
 * /user/watchHistory:
 *   get:
 *     summary: Get user watch history
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Watch History fetched successfully
 *       401:
 *         description: Unauthorized
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