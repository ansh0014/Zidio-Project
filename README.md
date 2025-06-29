# 📊 Zidio - Excel Analytics Platform

A modern, AI-powered Excel analytics platform that transforms your spreadsheet data into actionable insights with interactive visualizations and intelligent analysis.

## ✨ Features

### 🔐 Authentication & User Management
- Secure user registration and login system
- Role-based access control (User/Admin)
- JWT token-based authentication
- Protected routes and middleware

### 📁 File Management
- Excel file upload (.xlsx, .xls) with validation
- File history tracking and management
- Secure file storage with user isolation
- File size limits and type validation

### 🤖 AI-Powered Analysis
- Google Gemini AI integration for intelligent data analysis
- Automated insights generation
- Pattern recognition and trend analysis
- Statistical observations and recommendations
- Data visualization suggestions

### 📈 Interactive Visualizations
- Dynamic chart generation using Chart.js
- Multiple chart types (Bar, Line, Pie, Doughnut)
- Responsive and interactive charts
- Real-time data visualization
- Export capabilities (PDF, PNG)

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/Light theme toggle
- Modern gradient backgrounds
- Smooth animations and transitions
- Mobile-friendly interface

### 📊 Dashboard & Analytics
- Comprehensive statistics overview
- File upload history
- Real-time analytics dashboard
- Admin panel for user management
- Performance metrics tracking

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **XLSX** - Excel file processing
- **Google Generative AI** - AI analysis
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling framework
- **React Context** - State management
- **html2canvas & jsPDF** - Export functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Zidio-Project-main
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp "env example" .env
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp "env example" .env
   ```

### Environment Configuration

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/zidio-analytics
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=2000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:2000/api
```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:2000`

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### File Management
- `POST /api/files/upload` - Upload Excel file
- `GET /api/files/history` - Get file history
- `GET /api/files/:id` - Get specific file data
- `POST /api/files/summary` - Generate AI summary

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get platform statistics

## 🎯 Usage Guide

### 1. Getting Started
1. Register a new account or login
2. Navigate to the dashboard
3. Upload your first Excel file

### 2. File Upload
- Supported formats: `.xlsx`, `.xls`
- Maximum file size: 10MB
- Files are automatically parsed and stored

### 3. Data Analysis
- View interactive charts of your data
- Generate AI-powered insights
- Export visualizations as PDF/PNG
- Track file history and statistics

### 4. Admin Features
- Manage user accounts
- View platform statistics
- Monitor system usage

## 🔧 Development

### Project Structure
```
Zidio-Project-main/
├── backend/
│   ├── middleware/     # Authentication middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── server.js       # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React context providers
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   └── package.json
└── README.md
```

### Available Scripts

**Backend**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run test-gemini` - Test Gemini AI integration

**Frontend**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- File upload validation
- CORS configuration
- User data isolation

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Update API URL in environment variables
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



## 🙏 Acknowledgments

- Google Gemini AI for intelligent analysis
- Chart.js for data visualization
- Tailwind CSS for styling
- React community for excellent tooling

---

**Built with ❤️ for data analytics enthusiasts**
