import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';
import { UserService } from '../services/userService';

export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      return reply.status(401).send({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Add user info to request
    (request as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      user: user
    };

  } catch (error) {
    return reply.status(401).send({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const userService = new UserService();
      const user = await userService.getUserById(decoded.userId);
      
      if (user && user.is_active) {
        (request as any).user = {
          userId: decoded.userId,
          email: decoded.email,
          user: user
        };
      }
    }
  } catch (error) {
    // Optional auth - don't throw error, just continue without user
  }
};

export const authorizeAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const userCtx = (request as any).user;
  if (!userCtx || !userCtx.email) {
    return reply.status(401).send({ success: false, message: 'Authentication required' });
  }
  const isAdminByRole = (userCtx.user?.role === 'admin');
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdminByEmail = adminEmails.includes(String(userCtx.email).toLowerCase());
  if (!isAdminByRole && !isAdminByEmail) {
    return reply.status(403).send({ success: false, message: 'Admin access required' });
  }
};