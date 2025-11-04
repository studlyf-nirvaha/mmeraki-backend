import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const authController = new AuthController();

export default async function authRoutes(fastify: FastifyInstance) {
  // Register routes
  fastify.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password', 'full_name'],
        properties: {
          full_name: { type: 'string', minLength: 2, maxLength: 255 },
          email: { type: 'string', format: 'email' },
          phone_number: { type: 'string', maxLength: 20 },
          password: { type: 'string', minLength: 6 },
          current_location: { type: 'string', enum: ['Delhi', 'Hyderabad'] },
          gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
          date_of_birth: { type: 'string', format: 'date' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' },
            token: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.register.bind(authController));

  // Admin login route
  fastify.post('/admin/login', {
    schema: {
      description: 'Admin login - strict verification for admin access',
      tags: ['Authentication', 'Admin'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' },
            token: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.adminLogin.bind(authController));

  // Login route
  fastify.post('/login', {
    schema: {
      description: 'Login user',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' },
            token: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.login.bind(authController));

  // Get profile route (protected)
  fastify.get('/profile', {
    preHandler: authenticateToken,
    schema: {
      description: 'Get user profile',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: { type: 'object' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.getProfile.bind(authController));

  // Update profile route (protected)
  fastify.put<{ Body: any }>('/profile', {
    preHandler: authenticateToken,
    schema: {
      body: {
        type: 'object',
        properties: {
          full_name: { type: 'string', minLength: 2, maxLength: 255 },
          phone_number: { type: 'string', maxLength: 20 },
          current_location: { type: 'string', enum: ['Delhi', 'Hyderabad'] },
          gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
          date_of_birth: { type: 'string', format: 'date' },
          profile_icon: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.updateProfile.bind(authController));

  // Verify token route
  fastify.get('/verify', {
    schema: {
      description: 'Verify JWT token',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.verifyToken.bind(authController));

  // Logout route
  fastify.post('/logout', {
    preHandler: authenticateToken,
    schema: {
      description: 'Logout user',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.logout.bind(authController));

  // Delete account route
  fastify.delete('/delete-account', {
    preHandler: authenticateToken,
    schema: {
      description: 'Delete user account',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.deleteAccount.bind(authController));
}
