# Excel Analytics Platform - Backend API

A production-ready Node.js backend for processing Excel files with AI-powered insights using Gemini API.

## Features

- **Authentication & Authorization**: JWT-based auth with user registration/login
- **Excel File Processing**: Upload and parse .xlsx/.xls files using SheetJS
- **AI Insights**: Generate intelligent data analysis using Google Gemini API
- **File Management**: Upload history, statistics, and data retrieval
- **Security**: Rate limiting, CORS, input validation, and secure file handling
- **Database**: MongoDB with Mongoose for data persistence

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (file uploads)
- SheetJS (Excel parsing)
- Google Gemini AI API
- bcryptjs (password hashing)
- Express Rate Limit & Helmet (security)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running locally or use MongoDB Atlas
   ```

4. **Run the Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/excel-analytics

# Authentication
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRE=7d

# AI Integration
GEMINI_API_KEY=your_google_generative_ai_key

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.xlsx,.xls

# CORS
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updatedetails` - Update user details (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### File Management
- `GET /api/files` - Get user files with pagination (Protected)
- `POST /api/files/upload` - Upload Excel file (Protected)
- `GET /api/files/:id` - Get specific file with data (Protected)
- `DELETE /api/files/:id` - Delete file (Protected)
- `POST /api/files/:id/insights` - Regenerate AI insights (Protected)
- `GET /api/files/stats` - Get user statistics (Protected)

### Utility
- `GET /api/health` - Health check
- `GET /api` - API documentation

## File Upload Process

1. User uploads Excel file via `POST /api/files/upload`
2. File is temporarily stored in `/uploads` directory
3. Excel file is parsed using SheetJS into JSON format
4. AI insights are generated using Gemini API
5. Parsed data and insights are saved to MongoDB
6. Temporary file is deleted
7. User receives processing status updates

## AI Insights

The system generates intelligent insights from Excel data using Google's Gemini API:

- **Trend Analysis**: Identifies patterns in the data
- **Performance Metrics**: Analyzes key performance indicators
- **Recommendations**: Suggests actionable insights
- **Alerts**: Highlights potential issues or anomalies

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Validates all user inputs
- **File Type Validation**: Only allows Excel files
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: Additional security headers
- **Password Hashing**: bcrypt with salt rounds

## Error Handling

Comprehensive error handling for:
- Validation errors
- Authentication failures
- File processing errors
- Database connection issues
- AI API failures
- Rate limiting violations

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### File Model
```javascript
{
  userId: ObjectId (ref: User),
  originalName: String,
  filename: String (unique),
  mimetype: String,
  size: Number,
  status: String (enum: ['processing', 'processed', 'error']),
  parsedData: Mixed,
  insights: Mixed,
  rowCount: Number,
  columnCount: Number,
  errorMessage: String,
  processingStartedAt: Date,
  processingCompletedAt: Date,
  timestamps: true
}
```

## Development

### Project Structure
```
backend/
├── config/db.js           # Database connection
├── controllers/            # Route controllers
│   ├── authController.js   # Authentication logic
│   └── fileController.js   # File processing logic
├── middleware/auth.js      # Authentication middleware
├── models/                 # Database models
│   ├── User.js            # User schema
│   └── File.js            # File schema
├── routes/                 # API routes
│   ├── authRoutes.js      # Auth endpoints
│   └── fileRoutes.js      # File endpoints
├── uploads/               # Temporary file storage
├── .env                   # Environment variables
├── .env.example           # Environment template
├── server.js              # Main server file
└── package.json           # Dependencies
```

### Testing API Endpoints

Use tools like Postman or curl to test the API:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Upload Excel file
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/excel/file.xlsx"
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set secure JWT secrets
5. Configure reverse proxy (nginx)
6. Enable process management (PM2)
7. Set up monitoring and logging

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check MONGO_URI in .env

2. **File Upload Fails**
   - Check file size limits
   - Verify uploads directory exists
   - Ensure proper file permissions

3. **AI Insights Not Generated**
   - Verify GEMINI_API_KEY is set correctly
   - Check API key permissions
   - Review API usage limits

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure user is active

## License

MIT License - see LICENSE file for details