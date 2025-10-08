import { FastifyRequest, FastifyReply } from 'fastify';
import { CartService } from '../services/cartService';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  // Get user's cart
  async getCart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const cart = await this.cartService.getUserCart(userId);
      const total = await this.cartService.getCartTotal(userId);

      return reply.send({
        success: true,
        cart,
        total
      });
    } catch (error) {
      console.error('Get cart error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch cart'
      });
    }
  }

  // Add item to cart
  async addToCart(request: FastifyRequest<{ Body: { experience_id: string; quantity?: number; selected_date?: string; selected_time?: string; addons?: string[] } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const { experience_id, quantity = 1, selected_date, selected_time, addons } = request.body;

      if (!experience_id) {
        return reply.status(400).send({
          success: false,
          message: 'Experience ID is required'
        });
      }

      if (quantity <= 0) {
        return reply.status(400).send({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      const cartItem = await this.cartService.addToCart(userId, experience_id, quantity, {
        selected_date,
        selected_time,
        addons
      });

      return reply.status(201).send({
        success: true,
        message: 'Item added to cart',
        item: cartItem
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      return reply.status(500).send({
        success: false,
        message: isDev && (error?.message || String(error)) ? `Failed to add item to cart: ${error?.message || String(error)}` : 'Failed to add item to cart'
      });
    }
  }

  // Update cart item quantity
  async updateCartItem(request: FastifyRequest<{ Body: { experience_id: string; quantity: number } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const { experience_id, quantity } = request.body;

      if (!experience_id) {
        return reply.status(400).send({
          success: false,
          message: 'Experience ID is required'
        });
      }

      if (quantity < 0) {
        return reply.status(400).send({
          success: false,
          message: 'Quantity cannot be negative'
        });
      }

      if (quantity === 0) {
        await this.cartService.removeFromCart(userId, experience_id);
        return reply.send({
          success: true,
          message: 'Item removed from cart'
        });
      }

      const cartItem = await this.cartService.updateCartItemQuantity(userId, experience_id, quantity);

      return reply.send({
        success: true,
        message: 'Cart item updated',
        item: cartItem
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update cart item'
      });
    }
  }

  // Remove item from cart
  async removeFromCart(request: FastifyRequest<{ Params: { experience_id: string } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const { experience_id } = request.params;

      if (!experience_id) {
        return reply.status(400).send({
          success: false,
          message: 'Experience ID is required'
        });
      }

      await this.cartService.removeFromCart(userId, experience_id);

      return reply.send({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to remove item from cart'
      });
    }
  }

  // Clear cart
  async clearCart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      await this.cartService.clearCart(userId);

      return reply.send({
        success: true,
        message: 'Cart cleared'
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to clear cart'
      });
    }
  }

  // Get cart count
  async getCartCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const count = await this.cartService.getCartCount(userId);

      return reply.send({
        success: true,
        count
      });
    } catch (error) {
      console.error('Get cart count error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get cart count'
      });
    }
  }
}
