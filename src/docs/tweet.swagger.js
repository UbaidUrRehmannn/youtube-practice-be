/**
 * @swagger
 * components:
 *   schemas:
 *     Tweet:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the tweet
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Title of the tweet
 *           example: "My First Tweet"
 *         description:
 *           type: string
 *           description: Rich text content of the tweet
 *           example: "This is my first tweet with <b>rich text</b> content!"
 *         image:
 *           type: string
 *           description: Optional image URL from Cloudinary
 *           example: "https://res.cloudinary.com/example/image/upload/v1234567890/tweet_image.webp"
 *         status:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *           description: |
 *             Current status of the tweet. 
 *             **Default:** `awaiting_approval` for new tweets. 
 *             Only admins and moderators can set or update status for other users' tweets.
 *           example: "awaiting_approval"
 *         isSensitive:
 *           type: boolean
 *           description: |
 *             Indicates if the tweet contains sensitive content.
 *             **Note:** Users cannot publish tweets marked as sensitive - they require admin approval.
 *           example: false
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for categorization
 *           example: ["technology", "programming", "javascript"]
 *         author:
 *           type: string
 *           description: Reference to the user who created the tweet
 *           example: "507f1f77bcf86cd799439012"
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the tweet
 *           example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *         dislikes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who disliked the tweet
 *           example: ["507f1f77bcf86cd799439015"]
 *         reposts:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who reposted the tweet
 *           example: ["507f1f77bcf86cd799439016"]
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of comment IDs
 *           example: ["507f1f77bcf86cd799439017"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the tweet was created
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the tweet was last updated
 *           example: "2024-01-15T11:45:00.000Z"
 *     
 *     CreateTweetRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the tweet
 *           example: "My First Tweet"
 *         description:
 *           type: string
 *           description: Rich text content of the tweet
 *           example: "This is my first tweet with <b>rich text</b> content!"
 *         status:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *           description: |
 *             Status for the tweet (role-dependent behavior):
 *             - **User**: Ignored, always set to `awaiting_approval`
 *             - **Moderator**: Used if provided, but sensitive content overrides to `awaiting_approval`
 *             - **Admin**: Used if provided, defaults to `published`
 *           example: "awaiting_approval"
 *         isSensitive:
 *           type: boolean
 *           description: |
 *             Mark if the tweet contains sensitive content.
 *             - **User/Moderator**: Forces status to `awaiting_approval` regardless of requested status
 *             - **Admin**: Can publish sensitive content directly
 *           example: false
 *         author:
 *           type: string
 *           description: |
 *             User ID to create tweet for (admin only).
 *             - **User/Moderator**: Cannot use this field
 *             - **Admin**: Can create tweets for any user
 *           example: "507f1f77bcf86cd799439012"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for categorization
 *           example: ["technology", "programming"]
 *         image:
 *           type: string
 *           format: binary
 *           description: Optional image file (webp format only)
 *     
 *     UpdateTweetRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated title of the tweet
 *           example: "Updated Tweet Title"
 *         description:
 *           type: string
 *           description: Updated rich text content
 *           example: "Updated content with <i>new formatting</i>"
 *         status:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *           description: |
 *             New status for the tweet. 
 *             Only admins and moderators can set or update status for other users' tweets.
 *             **Note:** Users cannot set status to 'published' if tweet is marked as sensitive.
 *           example: "approved"
 *         isSensitive:
 *           type: boolean
 *           description: |
 *             Mark if the tweet contains sensitive content.
 *             **Note:** Users cannot publish tweets marked as sensitive - they require admin approval.
 *           example: false
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Updated array of tags
 *           example: ["updated", "tags"]
 *         image:
 *           type: string
 *           format: binary
 *           description: New image file (webp format only)
 *     
 *     UpdateTweetStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *           description: New status for the tweet
 *           example: "approved"
 *     
 *     TweetResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             tweet:
 *               $ref: '#/components/schemas/Tweet'
 *         message:
 *           type: string
 *           example: "Tweet created successfully"
 *         success:
 *           type: boolean
 *           example: true
 *     
 *     TweetsResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             tweets:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tweet'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalItems:
 *                   type: integer
 *                   example: 48
 *         message:
 *           type: string
 *           example: "Tweets fetched successfully"
 *         success:
 *           type: boolean
 *           example: true
 *     
 *     LikeResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             isLiked:
 *               type: boolean
 *               example: true
 *             likesCount:
 *               type: integer
 *               example: 15
 *             dislikesCount:
 *               type: integer
 *               example: 2
 *         message:
 *           type: string
 *           example: "Tweet liked"
 *         success:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /tweet/createTweet:
 *   post:
 *     summary: Create a new tweet
 *     description: |
 *       Create a new tweet with title, description, optional image, tags, and status.
 *       
 *       **Role-based Status Logic:**
 *       - **User**: Always gets `awaiting_approval` status (ignores status in request)
 *       - **Moderator**: Can set any status, but sensitive content automatically goes to `awaiting_approval`
 *       - **Admin**: Can set any status, defaults to `published` if not provided
 *       
 *       **Author Assignment:**
 *       - **User/Moderator**: Can only create tweets for themselves
 *       - **Admin**: Can create tweets for any user by providing `author` field
 *       
 *       **Sensitive Content:**
 *       - If `isSensitive: true`, non-admin users get `awaiting_approval` status regardless of requested status
 *       - Only admins can publish sensitive content directly
 *       
 *       - Image must be in webp format
 *       - Rich text is supported in description field
 *     tags: [Tweets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Tweet"
 *               description:
 *                 type: string
 *                 example: "This is my first tweet with <b>rich text</b> content!"
 *               status:
 *                 type: string
 *                 enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *                 description: |
 *                   Status for the tweet (role-dependent behavior):
 *                   - **User**: Ignored, always set to `awaiting_approval`
 *                   - **Moderator**: Used if provided, but sensitive content overrides to `awaiting_approval`
 *                   - **Admin**: Used if provided, defaults to `published`
 *                 example: "awaiting_approval"
 *               isSensitive:
 *                 type: boolean
 *                 description: |
 *                   Mark if the tweet contains sensitive content.
 *                   - **User/Moderator**: Forces status to `awaiting_approval` regardless of requested status
 *                   - **Admin**: Can publish sensitive content directly
 *                 example: false
 *               author:
 *                 type: string
 *                 description: |
 *                   User ID to create tweet for (admin only).
 *                   - **User/Moderator**: Cannot use this field
 *                   - **Admin**: Can create tweets for any user
 *                 example: "507f1f77bcf86cd799439012"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["technology", "programming"]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional webp image file
 *     responses:
 *       201:
 *         description: Tweet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TweetResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - insufficient permissions (e.g., non-admin trying to create tweet for others)
 */

/**
 * @swagger
 * /tweet/getAllTweets:
 *   get:
 *     summary: Get all tweets with pagination and filtering
 *     description: |
 *       Retrieve a paginated list of tweets with optional filtering.
 *       - Public endpoint (no authentication required)
 *       - By default shows only published tweets
 *       - Supports filtering by status, author, and search
 *       - Includes pagination with customizable limit
 *     tags: [Tweets]
 *     security: []
 *     parameters:
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
 *           maximum: 50
 *           default: 10
 *         description: Number of tweets per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *         description: Filter tweets by status
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter tweets by author ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, title, -title, likes, -likes]
 *           default: "-createdAt"
 *         description: Sort order for tweets
 *     responses:
 *       200:
 *         description: Tweets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TweetsResponse'
 *       400:
 *         description: Bad request - invalid parameters
 */

/**
 * @swagger
 * /tweet/getTweetById/{id}:
 *   get:
 *     summary: Get a specific tweet by ID
 *     description: |
 *       Retrieve a specific tweet by its ID.
 *       - Public endpoint (no authentication required)
 *       - Users can only view published tweets unless they are the author, admin, or moderator
 *     tags: [Tweets]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *     responses:
 *       200:
 *         description: Tweet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TweetResponse'
 *       404:
 *         description: Tweet not found
 *       403:
 *         description: Forbidden - insufficient permissions to view tweet
 */

/**
 * @swagger
 * /tweet/getMyTweets:
 *   get:
 *     summary: Get current user's tweets
 *     description: |
 *       Retrieve all tweets created by the authenticated user.
 *       - Requires authentication
 *       - Supports filtering by status
 *       - Includes pagination
 *     tags: [Tweets]
 *     parameters:
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
 *           maximum: 50
 *           default: 10
 *         description: Number of tweets per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *         description: Filter tweets by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, title, -title, likes, -likes]
 *           default: "-createdAt"
 *         description: Sort order for tweets
 *     responses:
 *       200:
 *         description: User's tweets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TweetsResponse'
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @swagger
 * /tweet/updateTweet/{id}:
 *   patch:
 *     summary: Update a tweet
 *     description: |
 *       Update a tweet's content and metadata.
 *       - Users can only update their own tweets
 *       - Admins can update any tweet
 *       - Image must be in webp format
 *       - Status updates have special permissions (admin/moderator only for other users' tweets)
 *       - **Note:** When a user edits their own tweet, the status automatically changes to 'awaiting_approval'
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID (required)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Tweet Title"
 *               description:
 *                 type: string
 *                 example: "Updated content with <i>new formatting</i>"
 *               status:
 *                 type: string
 *                 enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *                 example: "published"
 *               isSensitive:
 *                 type: boolean
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["updated", "tags"]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New webp image file
 *     responses:
 *       200:
 *         description: Tweet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TweetResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Tweet not found
 */

/**
 * @swagger
 * /tweet/updateTweetStatus/{id}:
 *   patch:
 *     summary: Update tweet status (admin/moderator only)
 *     description: |
 *       Update the status of any tweet.
 *       - Only admins and moderators can update tweet status
 *       - Useful for content moderation workflow
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTweetStatusRequest'
 *     responses:
 *       200:
 *         description: Tweet status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TweetResponse'
 *       400:
 *         description: Bad request - invalid status
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin/moderator access required
 *       404:
 *         description: Tweet not found
 */

/**
 * @swagger
 * /tweet/deleteTweet/{id}:
 *   delete:
 *     summary: Delete a tweet
 *     description: |
 *       Delete a tweet permanently.
 *       - Users can only delete their own tweets
 *       - Admins can delete any tweet
 *       - Associated image will be deleted from Cloudinary
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID (required)
 *     responses:
 *       200:
 *         description: Tweet deleted successfully
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
 *                   example: {}
 *                 message:
 *                   type: string
 *                   example: "Tweet deleted successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Tweet not found
 */

/**
 * @swagger
 * /tweet/likeTweet/{id}:
 *   post:
 *     summary: Like or unlike a tweet
 *     description: |
 *       Toggle like status for a tweet.
 *       - If user hasn't liked the tweet, it will be liked
 *       - If user has already liked the tweet, it will be unliked
 *       - If user has disliked the tweet, dislike will be removed and tweet will be liked
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Tweet not found
 */

/**
 * @swagger
 * /tweet/dislikeTweet/{id}:
 *   post:
 *     summary: Dislike or undislike a tweet
 *     description: |
 *       Toggle dislike status for a tweet.
 *       - If user hasn't disliked the tweet, it will be disliked
 *       - If user has already disliked the tweet, it will be undisliked
 *       - If user has liked the tweet, like will be removed and tweet will be disliked
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *     responses:
 *       200:
 *         description: Dislike status toggled successfully
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
 *                     isDisliked:
 *                       type: boolean
 *                       example: true
 *                     likesCount:
 *                       type: integer
 *                       example: 15
 *                     dislikesCount:
 *                       type: integer
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: "Tweet disliked"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Tweet not found
 */

/**
 * @swagger
 * /tweet/repostTweet/{id}:
 *   post:
 *     summary: Repost or remove repost of a tweet
 *     description: |
 *       Toggle repost status for a tweet.
 *       - If user hasn't reposted the tweet, it will be reposted
 *       - If user has already reposted the tweet, repost will be removed
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *     responses:
 *       200:
 *         description: Repost status toggled successfully
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
 *                     isReposted:
 *                       type: boolean
 *                       example: true
 *                     repostsCount:
 *                       type: integer
 *                       example: 8
 *                 message:
 *                   type: string
 *                   example: "Tweet reposted"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Tweet not found
 */ 

/**
 * @swagger
 * /tweet/moderate:
 *   get:
 *     summary: Get tweets for moderation (admin/moderator only)
 *     description: |
 *       Advanced tweet moderation endpoint for admins and moderators.
 *       
 *       **Access Control:**
 *       - **Admin**: Can see all tweets except their own
 *       - **Moderator**: Can see all tweets except their own and admin tweets
 *       
 *       **Features:**
 *       - Advanced search by author, status, isSensitive, and text content
 *       - Pagination with accurate total counts (filtered results only)
 *       - Excludes current user's tweets from results
 *       - Moderators cannot see admin tweets
 *       - Full tweet details with author information
 *       
 *       **Use Cases:**
 *       - Content moderation workflow
 *       - Status management (approve, reject, publish)
 *       - Sensitive content review
 *       - Author-specific content review
 *       - Bulk moderation operations
 *     tags: [Tweets]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter tweets by author ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *         description: Filter tweets by status
 *         example: "awaiting_approval"
 *       - in: query
 *         name: isSensitive
 *         schema:
 *           type: boolean
 *         description: Filter tweets by sensitive content flag
 *         example: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and tags (case-insensitive)
 *         example: "urgent"
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
 *           maximum: 50
 *           default: 10
 *         description: Number of tweets per page
 *     responses:
 *       200:
 *         description: Tweets fetched for moderation successfully
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
 *                     tweets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tweet'
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
 *                         totalTweets:
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
 *                   example: "Tweets fetched for moderation successfully"
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