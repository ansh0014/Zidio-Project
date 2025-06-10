# Excel Analytics Platform - Backend API

A production-ready Node.js backend for processing Excel files with AI-powered insights using OpenAI and Google Gemini API.

## Features

- **Authentication & Authorization**: JWT-based auth with user registration/login
- **Excel File Processing**: Upload and parse .xlsx/.xls files using SheetJS
- **Dual AI Insights**: Generate intelligent data analysis using both OpenAI and Google Gemini API
- **File Management**: Upload history, statistics, and data retrieval
- **Security**: Rate limiting, CORS, input validation, and secure file handling
- **Database**: MongoDB with Mongoose for data persistence

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (file uploads)
- SheetJS (Excel parsing)
- OpenAI API
- Google Gemini AI API
- bcryptjs (password hashing)
- Express Rate Limit & Helmet (security)

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGO_URI=Your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.xlsx,.xls
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)

### File Management
- `GET /api/files` - Get user files
- `POST /api/files/upload` - Upload Excel file
- `GET /api/files/:id` - Get specific file data
- `DELETE /api/files/:id` - Delete file
- `POST /api/files/:id/analyze` - Generate AI insights

### Admin Routes
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/files` - Get all files (Admin only)

## AI Insights

The system generates intelligent insights using both OpenAI and Google Gemini API:

- **Data Analysis**: Comprehensive data interpretation
- **Pattern Recognition**: Identifies trends and patterns
- **Statistical Analysis**: Key statistical insights
- **Custom Insights**: Based on data context

## Security Features

- JWT Authentication
- Rate Limiting
- Input Validation
- Secure File Handling
- CORS Protection
- Password Encryption

## Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### File Model
```javascript
{
  userId: ObjectId (ref: User),
  filename: String,
  originalName: String,
  insights: {
    openai: Mixed,
    gemini: Mixed
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

- Authentication Errors
- File Processing Errors
- AI API Errors
- Validation Errors
- Database Errors

## Quick Start

1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment: Copy `.env.example` to `.env`
4. Start server: `npm start`

## License

MIT License