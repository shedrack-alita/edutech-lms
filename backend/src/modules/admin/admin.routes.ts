import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get all courses (including unpublished)
router.get('/courses', adminController.getAllCourses);

export default router;