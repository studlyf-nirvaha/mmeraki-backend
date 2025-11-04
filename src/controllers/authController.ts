import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/userService';
import { generateToken, verifyToken } from '../utils/jwt';
import { CreateUserRequest, LoginRequest, UpdateProfileRequest, AuthResponse } from '../types/User';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Register a new user
  async register(request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) {
    try {
      const userData = request.body;

      // Validate required fields
      if (!userData.email || !userData.password || !userData.full_name) {
        return reply.status(400).send({
          success: false,
          message: 'Email, password, and full name are required'
        });
      }

      // Check if email already exists
      const emailExists = await this.userService.emailExists(userData.email);
      if (emailExists) {
        return reply.status(409).send({
          success: false,
          message: 'Email already exists'
        });
      }

      // Create user
      const user = await this.userService.createUser(userData);

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      // Remove sensitive data and ensure proper serialization
      const userWithoutSensitiveData = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: (user as any).role,
        phone_number: user.phone_number,
        profile_icon: user.profile_icon,
        current_location: user.current_location,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        wishlisted_items: user.wishlisted_items || [],
        past_orders: user.past_orders || [],
        cart_items: user.cart_items || [],
        payment_methods: user.payment_methods || [],
        is_active: user.is_active,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return reply.status(201).send({
        success: true,
        message: 'User registered successfully',
        user: userWithoutSensitiveData,
        token
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      // Expose detailed error in development to aid debugging
      const isDev = process.env.NODE_ENV !== 'production';
      return reply.status(500).send({
        success: false,
        message: isDev && (error?.message || String(error)) ? `Registration failed: ${error?.message || String(error)}` : 'Registration failed. Please try again.'
      });
    }
  }

  // Admin login - strict verification for admin access
  async adminLogin(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;

      // Validate required fields
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Check if email is the specific admin email
      if (email !== 'mmeraki.event@gmail.com') {
        return reply.status(401).send({
          success: false,
          message: 'Access denied. Only authorized administrators can access this area.'
        });
      }

      // Get user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Admin account not found. Please contact system administrator.'
        });
      }

      // Check if user has admin role
      if (user.role !== 'admin') {
        return reply.status(401).send({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return reply.status(401).send({
          success: false,
          message: 'Admin account is deactivated'
        });
      }

      // Verify password
      if (!user.hashed_password) {
        return reply.status(401).send({
          success: false,
          message: 'Admin account not properly configured'
        });
      }

      const isPasswordValid = await this.userService.verifyPassword(password, user.hashed_password);
      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      // Return admin user data
      const adminUser = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        profile_icon: user.profile_icon,
        current_location: user.current_location,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        wishlisted_items: user.wishlisted_items || [],
        past_orders: user.past_orders || [],
        cart_items: user.cart_items || [],
        payment_methods: user.payment_methods || [],
        is_active: user.is_active,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return reply.send({
        success: true,
        message: 'Admin login successful',
        user: adminUser,
        token
      });

    } catch (error: any) {
      console.error('Admin login error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      return reply.status(500).send({
        success: false,
        message: isDev ? String(error?.message || error) : 'Admin login failed'
      });
    }
  }

  // Login user
  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;

      // Validate required fields
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Get user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return reply.status(401).send({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password (guard against missing hashed password in legacy records)
      if (!user.hashed_password) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await this.userService.verifyPassword(password, user.hashed_password);
      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      // Remove sensitive data and ensure proper serialization
      const userWithoutSensitiveData = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: (user as any).role,
        phone_number: user.phone_number,
        profile_icon: user.profile_icon,
        current_location: user.current_location,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        wishlisted_items: user.wishlisted_items || [],
        past_orders: user.past_orders || [],
        cart_items: user.cart_items || [],
        payment_methods: user.payment_methods || [],
        is_active: user.is_active,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return reply.send({
        success: true,
        message: 'Login successful',
        user: userWithoutSensitiveData,
        token
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      return reply.status(500).send({
        success: false,
        message: isDev && (error?.message || String(error)) ? `Login failed: ${error?.message || String(error)}` : 'Internal server error'
      });
    }
  }

  // Get user profile
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data and ensure proper serialization
      const userWithoutSensitiveData = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        role: (user as any).role,
        profile_icon: user.profile_icon,
        current_location: user.current_location,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        wishlisted_items: user.wishlisted_items || [],
        past_orders: user.past_orders || [],
        cart_items: user.cart_items || [],
        payment_methods: user.payment_methods || [],
        is_active: user.is_active,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return reply.send({
        success: true,
        user: userWithoutSensitiveData
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  async updateProfile(request: FastifyRequest<{ Body: UpdateProfileRequest }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const updateData = request.body;
      const user = await this.userService.updateProfile(userId, updateData);

      // Remove sensitive data
      const { hashed_password, verification_token, reset_password_token, reset_password_expires, ...userWithoutSensitiveData } = user;

      return reply.send({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutSensitiveData
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify token
  async verifyToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return reply.status(401).send({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = verifyToken(token);
      
      return reply.send({
        success: true,
        message: 'Token is valid',
        user: {
          userId: decoded.userId,
          email: decoded.email
        }
      });
    } catch (error) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }

  // Logout (client-side token removal)
  async logout(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Delete user account
  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      // Delete user from database
      const { error } = await this.userService.deleteUser(userId);
      
      if (error) {
        throw new Error('Failed to delete user account');
      }

      return reply.send({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
