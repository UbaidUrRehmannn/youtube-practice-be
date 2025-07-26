# Moderation API Guide

This guide provides comprehensive documentation for the moderation system endpoints, including user and tweet moderation capabilities.

## 🔐 **Authentication & Authorization**

All moderation endpoints require authentication with a valid JWT token and appropriate role permissions:

- **Admin**: Full access to all moderation features
- **Moderator**: Limited access (cannot see admin users/tweets)

### **Headers Required**
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 👥 **User Moderation API**

### **Endpoint**: `GET /api/v1/user/moderate`

Advanced user management endpoint for admins and moderators.

#### **Access Control**
- **Admin**: Can see all users except themselves
- **Moderator**: Can see all users except themselves and admins

#### **Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `username` | string | Search by username (case-insensitive) | `?username=john` |
| `email` | string | Search by email (case-insensitive) | `?email=john@example.com` |
| `fullName` | string | Search by full name (case-insensitive) | `?fullName=John Doe` |
| `role` | string | Filter by role | `?role=moderator` |
| `isDisabled` | boolean | Filter by disabled status | `?isDisabled=false` |
| `page` | integer | Page number (default: 1) | `?page=1` |
| `limit` | integer | Items per page (1-100, default: 10) | `?limit=20` |

#### **Usage Examples**

```bash
# Basic user listing
curl -X GET "http://localhost:8088/api/v1/user/moderate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by username
curl -X GET "http://localhost:8088/api/v1/user/moderate?username=admin" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by role and disabled status
curl -X GET "http://localhost:8088/api/v1/user/moderate?role=user&isDisabled=false" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Advanced search with pagination
curl -X GET "http://localhost:8088/api/v1/user/moderate?username=john&role=moderator&isDisabled=false&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Response Format**

```json
{
  "statusCode": 200,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userName": "john_doe",
        "email": "john@example.com",
        "fullName": "John Doe",
        "avatar": "https://res.cloudinary.com/example/avatar.jpg",
        "coverImage": "https://res.cloudinary.com/example/cover.jpg",
        "role": "user",
        "isDisabled": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalUsers": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Users fetched for moderation successfully",
  "success": true
}
```

## 🐦 **Tweet Moderation API**

### **Endpoint**: `GET /api/v1/tweet/moderate`

Advanced tweet moderation endpoint for content management.

#### **Access Control**
- **Admin**: Can see all tweets except their own
- **Moderator**: Can see all tweets except their own and admin tweets

#### **Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `author` | string | Filter by author ID | `?author=507f1f77bcf86cd799439012` |
| `status` | string | Filter by status | `?status=awaiting_approval` |
| `isSensitive` | boolean | Filter by sensitive content | `?isSensitive=true` |
| `search` | string | Search in title/description/tags | `?search=urgent` |
| `page` | integer | Page number (default: 1) | `?page=1` |
| `limit` | integer | Items per page (1-50, default: 10) | `?limit=15` |

#### **Tweet Statuses**
- `draft` - Draft tweets
- `awaiting_approval` - Pending moderation
- `approved` - Approved but not published
- `published` - Live tweets
- `rejected` - Rejected tweets
- `archived` - Archived tweets

#### **Usage Examples**

```bash
# Basic tweet listing
curl -X GET "http://localhost:8088/api/v1/tweet/moderate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Find tweets awaiting approval
curl -X GET "http://localhost:8088/api/v1/tweet/moderate?status=awaiting_approval" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Find sensitive content
curl -X GET "http://localhost:8088/api/v1/tweet/moderate?isSensitive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by content
curl -X GET "http://localhost:8088/api/v1/tweet/moderate?search=urgent" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by specific author
curl -X GET "http://localhost:8088/api/v1/tweet/moderate?author=507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined search
curl -X GET "http://localhost:8088/api/v1/tweet/moderate?status=awaiting_approval&isSensitive=true&search=important&page=1&limit=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Response Format**

```json
{
  "statusCode": 200,
  "data": {
    "tweets": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Important Announcement",
        "description": "This is a sample tweet description with rich text support.",
        "image": "https://res.cloudinary.com/example/tweet.jpg",
        "status": "awaiting_approval",
        "isSensitive": false,
        "tags": ["announcement", "important"],
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "userName": "john_doe",
          "fullName": "John Doe",
          "avatar": "https://res.cloudinary.com/example/avatar.jpg",
          "role": "user"
        },
        "likes": [],
        "dislikes": [],
        "reposts": [],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalTweets": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Tweets fetched for moderation successfully",
  "success": true
}
```

## 🔄 **Related Moderation Actions**

### **Update User Status**
```bash
# Disable a user
curl -X PATCH "http://localhost:8088/api/v1/user/updateUser/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isDisabled": true}'

# Change user role (admin only)
curl -X PATCH "http://localhost:8088/api/v1/user/updateUser/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "moderator"}'
```

### **Update Tweet Status**
```bash
# Approve a tweet
curl -X PATCH "http://localhost:8088/api/v1/tweet/updateTweetStatus/TWEET_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Reject a tweet
curl -X PATCH "http://localhost:8088/api/v1/tweet/updateTweetStatus/TWEET_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected"}'

# Mark as sensitive content
curl -X PATCH "http://localhost:8088/api/v1/tweet/updateTweet/TWEET_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isSensitive": true}'
```

## ⚠️ **Error Responses**

### **401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized - authentication required",
  "success": false
}
```

### **403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Forbidden - admin/moderator access required",
  "success": false
}
```

### **400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Bad request - invalid query parameters",
  "success": false
}
```

## 🎯 **Best Practices**

### **1. Pagination**
- Always use pagination for large datasets
- Set reasonable `limit` values (10-50)
- Use `page` parameter for navigation

### **2. Search Optimization**
- Combine multiple filters for precise results
- Use `search` parameter for text-based queries
- Leverage `status` and `isSensitive` for workflow management

### **3. Role-Based Access**
- Admins have full access to all data
- Moderators cannot see admin users/tweets
- Always verify permissions before actions

### **4. Error Handling**
- Check response status codes
- Handle pagination boundaries
- Implement retry logic for network issues

## 📊 **Workflow Examples**

### **User Management Workflow**
1. List users with filters: `GET /api/v1/user/moderate?role=user&isDisabled=false`
2. Review user details and activity
3. Update user status: `PATCH /api/v1/user/updateUser/USER_ID`
4. Monitor changes through pagination

### **Content Moderation Workflow**
1. Find pending content: `GET /api/v1/tweet/moderate?status=awaiting_approval`
2. Review tweet content and author
3. Check for sensitive content: `GET /api/v1/tweet/moderate?isSensitive=true`
4. Update status: `PATCH /api/v1/tweet/updateTweetStatus/TWEET_ID`
5. Monitor moderation queue

## 🔗 **Related Documentation**

- [Main API Documentation](http://localhost:8088/api-docs)
- [User Management API](./src/docs/user.swagger.js)
- [Tweet Management API](./src/docs/tweet.swagger.js)
- [Health Check API](./src/docs/health.swagger.js) 