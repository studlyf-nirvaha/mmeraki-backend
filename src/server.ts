import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { experienceRoutes } from './routes/experienceRoutes';
import { seedRoutes } from './routes/seedRoutes';
import authRoutes from './routes/authRoutes';
import { wishlistRoutes } from './routes/wishlistRoutes';
import { cartRoutes } from './routes/cartRoutes';

// Load environment variables
dotenv.config();

// Production env validation
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
}

const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
const fastify = Fastify({
  trustProxy: true,
  bodyLimit: parseInt(process.env.BODY_LIMIT || '1048576', 10),
  logger: isLocalDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      }
    : {
        level: 'warn'
      }
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer() {
  try {
    // Configure and register CORS
    const defaultCors = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://mmeraki1.netlify.app',
      'https://*.netlify.app',
      'https://*.netlify.com',
      'https://*.vercel.app',
      'https://mmeraki-backend1.vercel.app'
    ].join(',');
    const allowedOrigins = (process.env.CORS_ORIGINS || defaultCors)
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    await fastify.register(cors, {
      origin: (origin, cb) => {
        if (!origin) {
          return cb(null, true);
        }
        const normalize = (o: string) => o.replace(/\/$/, '');
        const requestOrigin = normalize(origin);
        const isAllowed = allowedOrigins.some((pattern) => {
          const pat = normalize(pattern);
          if (pat.includes('*')) {
            const regex = new RegExp('^' + pat
              .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '.*') + '$');
            return regex.test(requestOrigin);
          }
          return pat === requestOrigin;
        });
        return cb(null, isAllowed);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      maxAge: 86400
    });

    // Security headers
    await fastify.register(helmet, {
      contentSecurityPolicy: false
    });

    // Compression
    // Temporarily disable compression to debug frontend issue
    // await fastify.register(compress, { global: true });

    // Rate limit per IP
    await fastify.register(rateLimit, {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
      allowList: (process.env.RATE_LIMIT_ALLOWLIST || '')
        .split(',')
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0)
    });

    // Register JWT
    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
    });

    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };
    });

    // API routes
    await fastify.register(experienceRoutes, { prefix: '/api' });
    await fastify.register(seedRoutes, { prefix: '/api' });
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(wishlistRoutes, { prefix: '/api/wishlist' });
    await fastify.register(cartRoutes, { prefix: '/api/cart' });
    const orderRoutes = (await import('./routes/orderRoutes')).default;
    await fastify.register(orderRoutes, { prefix: '/api' });

    // Root endpoint
    fastify.get('/', async (request, reply) => {
      return {
        message: 'CherishX Experiences API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          experiences: '/api/experiences',
          experienceBySlug: '/api/experiences/:slug',
          featuredExperiences: '/api/experiences/featured',
          experiencesByCategory: '/api/experiences/category/:category',
          searchExperiences: '/api/experiences/search?q=searchTerm',
          seed: '/api/seed',
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile',
            updateProfile: 'PUT /api/auth/profile',
            verify: 'GET /api/auth/verify',
            logout: 'POST /api/auth/logout'
          },
          wishlist: {
            get: 'GET /api/wishlist',
            add: 'POST /api/wishlist',
            remove: 'DELETE /api/wishlist/:experience_id',
            check: 'GET /api/wishlist/check/:experience_id',
            count: 'GET /api/wishlist/count'
          },
          cart: {
            get: 'GET /api/cart',
            add: 'POST /api/cart',
            update: 'PUT /api/cart',
            remove: 'DELETE /api/cart/:experience_id',
            clear: 'DELETE /api/cart',
            count: 'GET /api/cart/count'
          }
        },
        documentation: 'See README.md for detailed API documentation'
      };
    });

    // 404 handler
    fastify.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        success: false,
        error: 'Not Found',
        message: `Route ${request.method}:${request.url} not found`,
        availableEndpoints: [
          'GET /',
          'GET /health',
          'GET /api/experiences',
          'GET /api/experiences/:slug',
          'GET /api/experiences/featured',
          'GET /api/experiences/category/:category',
          'GET /api/experiences/search?q=searchTerm',
          'POST /api/seed',
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/auth/profile',
          'PUT /api/auth/profile',
          'GET /api/auth/verify',
          'POST /api/auth/logout'
        ]
      });
    });

    // Error handler
    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });

    return fastify;
  } catch (error) {
    fastify.log.error(
      error instanceof Error
        ? `Error building server: ${error.message}`
        : `Error building server: ${String(error)}`
    );
    throw error;
  }
}

async function start() {
  try {
    const server = await buildServer();
    
    await server.listen({ port: PORT, host: HOST });
    
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📚 API Documentation: http://${HOST}:${PORT}/`);
    console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
    console.log(`🌱 Seed Data: POST http://${HOST}:${PORT}/api/seed`);
    console.log(`📊 Experiences: GET http://${HOST}:${PORT}/api/experiences`);
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      try {
        await server.close();
        console.log('✅ Server closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  start();
}

export { buildServer, start };
