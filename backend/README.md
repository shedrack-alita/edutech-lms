# EduTech LMS Backend

A comprehensive Learning Management System (LMS) API built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/Learner)
  - Password hashing with bcrypt

- **User Management**
  - User profiles
  - Avatar uploads
  - Statistics tracking

- **Course Management**
  - Create, update, delete courses
  - Modules and lessons
  - Video and text content support
  - Publish/unpublish functionality
  - Course statistics

- **Coming Soon**
  - Enrollment system
  - Progress tracking
  - Tasks and assignments
  - Live meetings
  - Calendar integration

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Password Hashing:** bcryptjs

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/edutech-lms.git
   cd edutech-lms/backend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/edutech_lms?schema=public"

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d

   # File Upload
   MAX_FILE_SIZE=104857600
   UPLOAD_PATH=./uploads

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
```

4. **Set up the database**
```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name initial_setup
```

5. **Start the development server**
```bash
   npm run dev
```

The API will be running at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (Protected)

### User Endpoints

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/me` - Get own profile
- `PUT /api/users/me` - Update own profile
- `POST /api/users/me/change-password` - Change password
- `GET /api/users/me/stats` - Get own statistics
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/role` - Update user role (Admin only)

### Course Endpoints

- `POST /api/courses` - Create course (Admin only)
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)
- `PATCH /api/courses/:id/publish` - Publish/unpublish course (Admin only)
- `GET /api/courses/:id/stats` - Get course statistics

### Module Endpoints

- `POST /api/courses/:courseId/modules` - Add module to course (Admin only)
- `GET /api/courses/modules/:id` - Get module by ID
- `PUT /api/courses/modules/:id` - Update module (Admin only)
- `DELETE /api/courses/modules/:id` - Delete module (Admin only)

### Lesson Endpoints

- `POST /api/courses/modules/:moduleId/lessons` - Add lesson to module (Admin only)
- `GET /api/courses/lessons/:id` - Get lesson by ID
- `PUT /api/courses/lessons/:id` - Update lesson (Admin only)
- `DELETE /api/courses/lessons/:id` - Delete lesson (Admin only)

## Project Structure
```
backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   └── courses/
│   ├── shared/
│   │   ├── types/
│   │   └── utils/
│   └── server.ts
├── uploads/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Testing
```bash
# Run tests (coming soon)
npm test
```

## Deployment

### Using Vercel (for API)

1. Install Vercel CLI
```bash
   npm install -g vercel
```

2. Deploy
```bash
   vercel
```

### Using Railway (Recommended for Backend + Database)

1. Connect your GitHub repository to Railway
2. Add environment variables
3. Deploy automatically on push

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create a new migration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Your Name - [@yourhandle](https://twitter.com/yourhandle)

## Acknowledgments

- Prisma for the amazing ORM
- Express.js community
- TypeScript team