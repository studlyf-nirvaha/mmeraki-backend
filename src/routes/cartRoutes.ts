import { FastifyInstance } from 'fastify';
import { CartController } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const cartController = new CartController();

export async function cartRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticateToken);

  // Get user's cart
  fastify.get('/', cartController.getCart.bind(cartController));

  // Add item to cart
  fastify.post('/', cartController.addToCart.bind(cartController));

  // Update cart item quantity
  fastify.put('/', cartController.updateCartItem.bind(cartController));

  // Remove item from cart
  fastify.delete('/:experience_id', cartController.removeFromCart.bind(cartController));

  // Clear cart
  fastify.delete('/', cartController.clearCart.bind(cartController));

  // Get cart count
  fastify.get('/count', cartController.getCartCount.bind(cartController));
}
