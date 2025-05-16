<div align="center">
  <img src="https://i.ibb.co.com/JWs3Hfwp/Screenshot-5.png" height="400" width="800" alt="EduSphere"/>
</div>

# EduSphere - Comprehensive Educational Platform

EduSphere is a full-featured educational platform built using the **MERN stack**. It seamlessly connects students and teachers through structured courses, interactive dashboards, and secure authentication. Designed with scalability in mind, EduSphere offers an engaging learning experience with dynamic content and data analytics.

## 🌍 Live Site

👉 [EduSphere Platform](https://edusphere-521cf.web.app/)

## 🛠️ Tech Stack

### Frontend

- React.js 18
- TanStack Query v4
- Firebase Authentication
- Axios
- React Router DOM v6
- Tailwind CSS & DaisyUI
- React Hook Form
- Sweet Alert 2
- Framer Motion
- jsPDF & AOS Animation

### Backend

- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- Cors & Dotenv
- Express Rate Limit
- Stripe (Payments)
- Winston (Logging)
- Joi (Validation)

## 🎯 Key Features

### ✅ Authentication & User Management
- Secure **JWT-based authentication**
- **Google Social Login** integration
- **Role-based authorization** (Student, Teacher, Admin)
- Password hashing & session management

### ✅ Dashboard System
- **Student:** Enrollment tracking, assignment submissions, progress monitoring
- **Teacher:** Course management, performance tracking
- **Admin:** User management, course approvals

### ✅ Course & Assignment Management
- **Course Creation & Updates** with admin approval
- **Assignments & Grading System** for students
- **Progress Tracking** for both students and teachers

### ✅ Payment & Financial System
- **Secure Stripe Integration** for course payments
- **Transaction Logging & Refund Handling**
- **PDF Invoice Generation** for purchases

### ✅ Data Analytics & Reports
- **User & Course Metrics** (enrollments, performance, progress trends)
- **Interactive Dashboards** for admins and teachers

## 🚀 Installation & Setup

### Client Setup

```bash
git clone https://github.com/smmaksudulhaque2000/EduSphere
cd edumanage-client
npm install
```

Create a `.env` file:

```env
VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_firebase_auth_domain
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_storage_bucket
VITE_messagingSenderId=your_messaging_sender_id
VITE_appId=your_app_id
VITE_SERVER_URL=your_server_url
```

### Server Setup

```bash
git clone https://github.com/smmaksudulhaque2000/EduSphere
cd edumanage-server
npm install
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
CLIENT_URL=your_client_url
REFRESH_TOKEN_SECRET=your_refresh_token_secret
NODE_ENV=development
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Refresh JWT

### Users
- `GET /api/users` - Fetch all users
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update role
- `DELETE /api/users/:id` - Delete user

### Courses & Assignments
- `POST /api/classes` - Create course
- `GET /api/classes` - Get all courses
- `GET /api/classes/:id` - Get course details
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/submit` - Submit assignment

## 📂 Project Structure

### Client

```
src/
├── components/
│   ├── shared/
│   ├── dashboard/
│   └── home/
├── pages/
│   ├── Home/
│   ├── Dashboard/
│   └── Authentication/
├── hooks/
├── contexts/
├── utils/
├── assets/
└── routes/
```

### Server

```
src/
├── configs/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
└── validations/
```

## 🔒 Security Measures

- **JWT Authentication** & session management
- **CORS & Helmet security headers**
- **Request Rate Limiting**
- **MongoDB Injection Prevention**
- **XSS Protection & Input Validation**

## ⚡ Performance Optimizations

- **Database Indexing & Query Optimization**
- **Response Caching & Compression**
- **Lazy Loading & Code Splitting**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is **MIT Licensed**.

## 🙌 Acknowledgments

Special thanks to:

- [React](https://react.dev)
- [Node.js](https://nodejs.org)
- [Express.js](https://expressjs.com)
- [MongoDB](https://www.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase](https://firebase.google.com)
