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
 *           type: integer
 *           description: Number of users who liked the tweet (optimized response - use /tweet/{id}/likes for detailed list)
 *           example: 45
 *         dislikes:
 *           type: integer
 *           description: Number of users who disliked the tweet (optimized response - use /tweet/{id}/dislikes for detailed list)
 *           example: 5
 *         reposts:
 *           type: integer
 *           description: Number of users who reposted the tweet (optimized response - use /tweet/{id}/reposts for detailed list)
 *           example: 12
 *         isLiked:
 *           type: boolean
 *           description: Whether the current user has liked this tweet (true if user is authenticated and has liked, false otherwise)
 *           example: true
 *         isDisliked:
 *           type: boolean
 *           description: Whether the current user has disliked this tweet (true if user is authenticated and has disliked, false otherwise)
 *           example: false
 *         isRetweeted:
 *           type: boolean
 *           description: Whether the current user has reposted this tweet (true if user is authenticated and has reposted, false otherwise)
 *           example: true
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
 *           type: string
 *           description: Comma-separated tags for categorization (e.g., "technology,programming,javascript")
 *           example: "technology,programming"
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
 *           oneOf:
 *             - type: string
 *               description: Comma-separated tags for categorization (e.g., "updated,tags,new")
 *               example: "updated,tags"
 *             - type: array
 *               items:
 *                 type: string
 *               description: Array of tags
 *               example: ["updated", "tags", "new"]
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
 *                 totalCount:
 *                   type: integer
 *                   example: 48
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 hasPrevPage:
 *                   type: boolean
 *                   example: false
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
 *     
 *     UserBasic:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User's unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         userName:
 *           type: string
 *           description: User's unique username
 *           example: "john_doe"
 *         fullName:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *           example: "https://res.cloudinary.com/example/image/upload/v123/avatar.jpg"
 *       required:
 *         - _id
 *         - userName
 *         - fullName
 *     
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 20
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 3
 *         totalCount:
 *           type: integer
 *           description: Total number of items
 *           example: 45
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 *       required:
 *         - page
 *         - limit
 *         - hasNextPage
 *         - hasPrevPage
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
 *                 description: Title of the tweet
 *                 example: "My First Tweet"
 *               description:
 *                 type: string
 *                 description: Rich text content of the tweet
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
 *                 type: string
 *                 description: Comma-separated tags for categorization (e.g., "technology,programming")
 *                 example: "technology,programming"
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
 *             example:
 *               statusCode: 201
 *               data:
 *                 tweet:
 *                   $ref: '#/components/schemas/Tweet'
 *               message: "Tweet created successfully"
 *               success: true
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
 *           maximum: 100
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 tweets:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     title: "My First Tweet"
 *                     description: "This is my first tweet with <b>rich text</b> content!"
 *                     image: "https://res.cloudinary.com/example/image/upload/v1234567890/tweet_image.webp"
 *                     status: "published"
 *                     isSensitive: false
 *                     tags: ["technology", "programming", "javascript"]
 *                     author:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       userName: "john_doe"
 *                       fullName: "John Doe"
 *                       avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar.jpg"
 *                     likesCount: 45
 *                     dislikesCount: 5
 *                     repostsCount: 12
 *                     isLiked: true
 *                     isDisliked: false
 *                     isRetweeted: true
 *                     comments: ["507f1f77bcf86cd799439017"]
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T11:45:00.000Z"
 *                   - _id: "507f1f77bcf86cd799439018"
 *                     title: "Another Great Tweet"
 *                     description: "Another amazing tweet with <i>formatted content</i>!"
 *                     image: null
 *                     status: "published"
 *                     isSensitive: false
 *                     tags: ["webdev", "react"]
 *                     author:
 *                       _id: "507f1f77bcf86cd799439019"
 *                       userName: "jane_smith"
 *                       fullName: "Jane Smith"
 *                       avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar2.jpg"
 *                     likesCount: 23
 *                     dislikesCount: 2
 *                     repostsCount: 8
 *                     isLiked: false
 *                     isDisliked: true
 *                     isRetweeted: false
 *                     comments: []
 *                     createdAt: "2024-01-15T09:15:00.000Z"
 *                     updatedAt: "2024-01-15T09:15:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 5
 *                   totalCount: 48
 *               message: "Tweets fetched successfully"
 *               success: true
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 tweet:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   title: "My First Tweet"
 *                   description: "This is my first tweet with <b>rich text</b> content!"
 *                   image: "https://res.cloudinary.com/example/image/upload/v1234567890/tweet_image.webp"
 *                   status: "published"
 *                   isSensitive: false
 *                   tags: ["technology", "programming", "javascript"]
 *                   author:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     userName: "john_doe"
 *                     fullName: "John Doe"
 *                     avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar.jpg"
 *                   likesCount: 45
 *                   dislikesCount: 5
 *                   repostsCount: 12
 *                   isLiked: true
 *                   isDisliked: false
 *                   isRetweeted: true
 *                   comments:
 *                     - _id: "507f1f77bcf86cd799439017"
 *                       content: "Great tweet!"
 *                       author:
 *                         _id: "507f1f77bcf86cd799439020"
 *                         userName: "commenter1"
 *                         fullName: "Commenter One"
 *                         avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar3.jpg"
 *                       createdAt: "2024-01-15T12:00:00.000Z"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T11:45:00.000Z"
 *               message: "Tweet fetched successfully"
 *               success: true
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
 *           maximum: 100
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 tweets:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     title: "My First Tweet"
 *                     description: "This is my first tweet with <b>rich text</b> content!"
 *                     image: "https://res.cloudinary.com/example/image/upload/v1234567890/tweet_image.webp"
 *                     status: "published"
 *                     isSensitive: false
 *                     tags: ["technology", "programming", "javascript"]
 *                     author:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       userName: "john_doe"
 *                       fullName: "John Doe"
 *                       avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar.jpg"
 *                     likesCount: 45
 *                     dislikesCount: 5
 *                     repostsCount: 12
 *                     isLiked: true
 *                     isDisliked: false
 *                     isRetweeted: true
 *                     comments: ["507f1f77bcf86cd799439017"]
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T11:45:00.000Z"
 *                   - _id: "507f1f77bcf86cd799439018"
 *                     title: "Draft Tweet"
 *                     description: "This is a draft tweet"
 *                     image: null
 *                     status: "draft"
 *                     isSensitive: false
 *                     tags: ["draft"]
 *                     author:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       userName: "john_doe"
 *                       fullName: "John Doe"
 *                       avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar.jpg"
 *                     likesCount: 0
 *                     dislikesCount: 0
 *                     repostsCount: 0
 *                     isLiked: false
 *                     isDisliked: false
 *                     isRetweeted: false
 *                     comments: []
 *                     createdAt: "2024-01-15T08:00:00.000Z"
 *                     updatedAt: "2024-01-15T08:00:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 2
 *                   totalItems: 12
 *               message: "Your tweets fetched successfully"
 *               success: true
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
 *                 description: Updated title of the tweet
 *                 example: "Updated Tweet Title"
 *               description:
 *                 type: string
 *                 description: Updated rich text content
 *                 example: "Updated content with <i>new formatting</i>"
 *               status:
 *                 type: string
 *                 enum: [draft, awaiting_approval, approved, published, rejected, archived]
 *                 description: New status for the tweet (admin/moderator only for others' tweets)
 *                 example: "published"
 *               isSensitive:
 *                 type: boolean
 *                 description: Mark if the tweet contains sensitive content
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated array of tags
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 tweet:
 *                   $ref: '#/components/schemas/Tweet'
 *               message: "Tweet updated successfully"
 *               success: true
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 tweet:
 *                   $ref: '#/components/schemas/Tweet'
 *               message: "Tweet status updated successfully"
 *               success: true
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
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "Tweet deleted successfully"
 *               success: true
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 isLiked: true
 *                 likesCount: 15
 *                 dislikesCount: 2
 *               message: "Tweet liked"
 *               success: true
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 isDisliked: true
 *                 likesCount: 15
 *                 dislikesCount: 3
 *               message: "Tweet disliked"
 *               success: true
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
 *             example:
 *               statusCode: 200
 *               data:
 *                 isReposted: true
 *                 repostsCount: 8
 *               message: "Tweet reposted"
 *               success: true
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
 *           maximum: 100
 *           default: 10
 *         description: Number of tweets per page
 *     responses:
 *       200:
 *         description: Tweets fetched for moderation successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               data:
 *                 tweets:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     title: "Sensitive Content Tweet"
 *                     description: "This tweet contains sensitive content"
 *                     image: null
 *                     status: "awaiting_approval"
 *                     isSensitive: true
 *                     tags: ["sensitive", "content"]
 *                     author:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       userName: "user1"
 *                       fullName: "User One"
 *                       avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar1.jpg"
 *                       role: "user"
 *                     likesCount: 0
 *                     dislikesCount: 0
 *                     repostsCount: 0
 *                     isLiked: false
 *                     isDisliked: false
 *                     isRetweeted: false
 *                     comments: []
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   - _id: "507f1f77bcf86cd799439018"
 *                     title: "Normal Tweet"
 *                     description: "This is a normal tweet awaiting approval"
 *                     image: null
 *                     status: "awaiting_approval"
 *                     isSensitive: false
 *                     tags: ["normal", "content"]
 *                     author:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       userName: "user2"
 *                       fullName: "User Two"
 *                       avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar2.jpg"
 *                       role: "user"
 *                     likesCount: 0
 *                     dislikesCount: 0
 *                     repostsCount: 0
 *                     isLiked: false
 *                     isDisliked: false
 *                     isRetweeted: false
 *                     comments: []
 *                     createdAt: "2024-01-15T09:15:00.000Z"
 *                     updatedAt: "2024-01-15T09:15:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 3
 *                   totalCount: 25
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *               message: "Tweets fetched for moderation successfully"
 *               success: true
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin/moderator access required
 *       400:
 *         description: Bad request - invalid query parameters
 */ 

/**
 * @swagger
 * /tweet/{id}/likes:
 *   get:
 *     summary: Get users who liked a specific tweet
 *     description: |
 *       Retrieve a paginated list of users who liked a specific tweet.
 *       This endpoint is public and doesn't require authentication.
 *       Only shows likes for published tweets (or tweets the user has permission to view).
 *     tags: [Tweet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *         example: "507f1f77bcf86cd799439011"
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
 *           maximum: 50
 *           default: 10
 *         description: Number of users per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Users who liked the tweet retrieved successfully
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
 *                         $ref: '#/components/schemas/UserBasic'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tweet likes fetched successfully"
 *             example:
 *               statusCode: 200
 *               data:
 *                 users:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     userName: "john_doe"
 *                     fullName: "John Doe"
 *                     avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar.jpg"
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     userName: "jane_smith"
 *                     fullName: "Jane Smith"
 *                     avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar2.jpg"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 3
 *                   totalCount: 45
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *               success: true
 *               message: "Tweet likes fetched successfully"
 *       400:
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               data: null
 *               success: false
 *               message: "Invalid tweet ID"
 *       403:
 *         description: Permission denied to view this tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 403
 *               data: null
 *               success: false
 *               message: "You do not have permission to view this tweet"
 *       404:
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               data: null
 *               success: false
 *               message: "Tweet not found"
 */

/**
 * @swagger
 * /tweet/{id}/dislikes:
 *   get:
 *     summary: Get users who disliked a specific tweet
 *     description: |
 *       Retrieve a paginated list of users who disliked a specific tweet.
 *       This endpoint is public and doesn't require authentication.
 *       Only shows dislikes for published tweets (or tweets the user has permission to view).
 *     tags: [Tweet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *         example: "507f1f77bcf86cd799439011"
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
 *           maximum: 50
 *           default: 10
 *         description: Number of users per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Users who disliked the tweet retrieved successfully
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
 *                         $ref: '#/components/schemas/UserBasic'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tweet dislikes fetched successfully"
 *             example:
 *               statusCode: 200
 *               data:
 *                 users:
 *                   - _id: "507f1f77bcf86cd799439013"
 *                     userName: "user1"
 *                     fullName: "User One"
 *                     avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar3.jpg"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *                   totalCount: 1
 *                   hasNextPage: false
 *                   hasPrevPage: false
 *               success: true
 *               message: "Tweet dislikes fetched successfully"
 *       400:
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               data: null
 *               success: false
 *               message: "Invalid tweet ID"
 *       403:
 *         description: Permission denied to view this tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 403
 *               data: null
 *               success: false
 *               message: "You do not have permission to view this tweet"
 *       404:
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               data: null
 *               success: false
 *               message: "Tweet not found"
 */

/**
 * @swagger
 * /tweet/{id}/reposts:
 *   get:
 *     summary: Get users who reposted a specific tweet
 *     description: |
 *       Retrieve a paginated list of users who reposted a specific tweet.
 *       This endpoint is public and doesn't require authentication.
 *       Only shows reposts for published tweets (or tweets the user has permission to view).
 *     tags: [Tweet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID
 *         example: "507f1f77bcf86cd799439011"
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
 *           maximum: 50
 *           default: 10
 *         description: Number of users per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Users who reposted the tweet retrieved successfully
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
 *                         $ref: '#/components/schemas/UserBasic'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tweet reposts fetched successfully"
 *             example:
 *               statusCode: 200
 *               data:
 *                 users:
 *                   - _id: "507f1f77bcf86cd799439014"
 *                     userName: "reposter1"
 *                     fullName: "Reposter One"
 *                     avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar4.jpg"
 *                   - _id: "507f1f77bcf86cd799439015"
 *                     userName: "reposter2"
 *                     fullName: "Reposter Two"
 *                     avatar: "https://res.cloudinary.com/example/image/upload/v123/avatar5.jpg"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *                   totalCount: 2
 *                   hasNextPage: false
 *                   hasPrevPage: false
 *               success: true
 *               message: "Tweet reposts fetched successfully"
 *       400:
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               data: null
 *               success: false
 *               message: "Invalid tweet ID"
 *       403:
 *         description: Permission denied to view this tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 403
 *               data: null
 *               success: false
 *               message: "You do not have permission to view this tweet"
 *       404:
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               data: null
 *               success: false
 *               message: "Tweet not found"
 */ 