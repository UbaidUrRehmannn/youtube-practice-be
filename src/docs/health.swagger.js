/**
 * @swagger
 * components:
 *   schemas:
 *     HealthReport:
 *       type: object
 *       properties:
 *         backend:
 *           type: boolean
 *           description: Backend service status (always true if endpoint is reachable)
 *           example: true
 *         mongoDb:
 *           type: boolean
 *           description: MongoDB connection status
 *           example: true
 *         cloudinary:
 *           type: boolean
 *           description: Cloudinary service status
 *           example: true
 *         hostname:
 *           type: string
 *           description: Server hostname
 *           example: "DESKTOP-ABC123"
 *         platform:
 *           type: string
 *           description: Operating system platform
 *           example: "win32"
 *         ip:
 *           type: string
 *           description: Client IP address
 *           example: "192.168.1.100"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: ISO timestamp of the health check
 *           example: "2024-01-15T10:30:00.000Z"
 *     HealthResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/HealthReport'
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 *         message:
 *           type: string
 *           description: Response message
 *           example: "Health check completed"
 *     SimpleHealthResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: null
 *           description: No data returned for simple health check
 *           example: null
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 *         message:
 *           type: string
 *           description: Response message
 *           example: "Health check completed"
 */

/**
 * @swagger
 * /health-check:
 *   get:
 *     summary: Comprehensive health check endpoint
 *     description: |
 *       Performs a comprehensive health check of the backend services including:
 *       - Backend service availability
 *       - MongoDB database connection status
 *       - Cloudinary service connectivity
 *       - Server information (hostname, platform)
 *       - Client IP address
 *       - Current timestamp
 *       
 *       This endpoint is useful for monitoring and debugging system health.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Health check completed successfully
 *         content:
 *           applicatio n/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               data:
 *                 backend: true
 *                 mongoDb: true
 *                 cloudinary: true
 *                 hostname: "DESKTOP-ABC123"
 *                 platform: "win32"
 *                 ip: "192.168.1.100"
 *                 timestamp: "2024-01-15T10:30:00.000Z"
 *               status: 200
 *               message: "Health check completed"
 *       500:
 *         description: Health check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     backend:
 *                       type: boolean
 *                       example: true
 *                     mongoDb:
 *                       type: boolean
 *                       example: false
 *                     cloudinary:
 *                       type: boolean
 *                       example: false
 *                     hostname:
 *                       type: string
 *                       example: "DESKTOP-ABC123"
 *                     platform:
 *                       type: string
 *                       example: "win32"
 *                     ip:
 *                       type: string
 *                       example: "192.168.1.100"
 *                     timestamp:
 *                       type: string
 *                       example: "2024-01-15T10:30:00.000Z"
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Health check completed"
 */

/**
 * @swagger
 * /health-check-be:
 *   get:
 *     summary: Simple backend health check endpoint
 *     description: |
 *       Performs a basic health check to verify that the backend service is running.
 *       This is a lightweight endpoint that only checks if the server is responding.
 *       
 *       Use this endpoint for:
 *       - Load balancer health checks
 *       - Simple uptime monitoring
 *       - Quick service availability verification
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Backend service is healthy and responding
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleHealthResponse'
 *             example:
 *               data: null
 *               status: 200
 *               message: "Health check completed"
 *       500:
 *         description: Backend service is not responding
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 status:
 *                   type: integer
 *                   example: 500
 */ 