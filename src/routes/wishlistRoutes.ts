import { FastifyInstance } from 'fastify';
import { WishlistController } from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';

const wishlistController = new WishlistController();

export async function wishlistRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticateToken);

  // Get user's wishlist
  fastify.get('/', wishlistController.getWishlist.bind(wishlistController));

  // Add item to wishlist
  fastify.post('/', wishlistController.addToWishlist.bind(wishlistController));

  // Remove item from wishlist
  fastify.delete('/:experience_id', wishlistController.removeFromWishlist.bind(wishlistController));

  // Check if item is in wishlist
  fastify.get('/check/:experience_id', wishlistController.checkWishlistStatus.bind(wishlistController));

  // Get wishlist count
  fastify.get('/count', wishlistController.getWishlistCount.bind(wishlistController));
}
