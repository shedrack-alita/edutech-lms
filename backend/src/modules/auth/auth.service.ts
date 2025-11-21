import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { RegisterInput, LoginInput, AuthResponse, JWTPayload } from './auth.types.js';
import { 
  ConflictError, 
  UnauthorizedError, 
  ValidationError 
} from '../../shared/utils/errors.js';
import { UserWithoutPassword } from '../../shared/types/index.js';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'LEARNER',
      },
    });

    // Remove password from response
    const userWithoutPassword = this.excludePassword(user);

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Remove password from response
    const userWithoutPassword = this.excludePassword(user);

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.excludePassword(user);
  }

  /**
   * Generate JWT token
   */
  private static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Remove password from user object
   */
  private static excludePassword(user: any): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}