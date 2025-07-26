# YouTube Practice Backend

This is a comprehensive backend project for learning and practicing backend development with Node.js, Express, and MongoDB.

## 🚀 **Tech Stack**
- **Node.js**: 18.19.0
- **npm**: 10.2.3
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **Cloudinary**: Image storage
- **Swagger**: API documentation

## 📋 **Features**

### **Authentication & Authorization**
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC) with three roles:
  - **User**: Basic access to own content
  - **Moderator**: Content moderation capabilities
  - **Admin**: Full system access

### **User Management**
- User registration and login
- Profile management (avatar, cover image)
- Role-based user operations
- User moderation system for admins/moderators

### **Content Management**
- **Tweets/Blogs**: Full CRUD with rich text support
- **Videos**: Video management (planned)
- **Comments**: Polymorphic comments on videos and tweets
- **Likes/Dislikes**: Interaction system
- **Reposts**: Content sharing

### **Moderation System**
- **User Moderation**: Advanced user search and management
  - Search by username, email, fullName, role, isDisabled
  - Role-based filtering (moderators can't see admins)
  - Pagination with accurate counts
- **Tweet Moderation**: Content moderation workflow
  - Status management (draft, awaiting_approval, approved, published, rejected, archived)
  - Sensitive content flagging
  - Advanced search and filtering
  - Role-based access (moderators can't see admin tweets)

### **API Features**
- **Pagination**: Reusable pagination middleware
- **File Upload**: WebP image support with Cloudinary
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation and sanitization
- **Documentation**: Swagger/OpenAPI documentation

## 🔐 **Role-Based Access Control**

### **User Roles**
- **User**: Can manage own content and profile
- **Moderator**: Can moderate content and manage user accounts (except admins)
- **Admin**: Full system access and management

### **Key Endpoints by Role**

#### **Public Endpoints**
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `GET /api/v1/tweet/getAllTweets` - View published tweets

#### **Authenticated Endpoints**
- `GET /api/v1/user/allUsers` - View all users
- `GET /api/v1/user/:id` - Get user by ID
- `POST /api/v1/tweet/createTweet` - Create tweets
- `PATCH /api/v1/tweet/updateTweet/:id` - Update own tweets

#### **Moderation Endpoints (Admin/Moderator)**
- `GET /api/v1/user/moderate` - User moderation with advanced search
- `GET /api/v1/tweet/moderate` - Tweet moderation with filtering
- `PATCH /api/v1/user/updateUser/:id` - Update other users
- `PATCH /api/v1/tweet/updateTweetStatus/:id` - Update tweet status

#### **Admin-Only Endpoints**
- `DELETE /api/v1/user/deleteUser/:id` - Delete any user
- `DELETE /api/v1/tweet/deleteTweet/:id` - Delete any tweet

## 📚 **API Documentation**

Access the interactive API documentation at:
```
http://localhost:8088/api-docs
```

The documentation includes:
- All endpoints with request/response examples
- Authentication requirements
- Role-based access information
- Query parameters and pagination
- Error responses

## 🗄️ **Database Models**

- **User**: Authentication, profiles, roles
- **Tweet**: Content with status management
- **Comment**: Polymorphic comments
- **Video**: Video content (planned)
- **Like/Dislike**: User interactions
- **Playlist**: Content organization (planned)
- **Subscription**: User subscriptions (planned)

## 🔧 **Setup & Installation**

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure environment variables**
4. **Start the server**: `npm start`

## 📝 **Database Model Links**
- [Main Model Structure](https://app.eraser.io/workspace/8nK8oSeIYF9XTNH0Ahqe?origin=share)
- [Subscription Model](https://app.eraser.io/workspace/vUC34CQ5WEcvsfc7ew9u?origin=share)

## 🎯 **Learning Objectives**
This project serves as a comprehensive learning platform for:
- Backend architecture and best practices
- Authentication and authorization systems
- Role-based access control implementation
- Content moderation workflows
- API design and documentation
- Database modeling and relationships
- File upload and storage
- Error handling and validation
