import { FastifyRequest, FastifyReply } from 'fastify';
import { WishlistService } from '../services/wishlistService';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  // Get user's wishlist
  async getWishlist(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const wishlist = await this.wishlistService.getUserWishlist(userId);

      return reply.send({
        success: true,
        wishlist
      });
    } catch (error) {
      console.error('Get wishlist error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch wishlist'
      });
    }
  }

  // Add item to wishlist
  async addToWishlist(request: FastifyRequest<{ Body: { experience_id: string } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const { experience_id } = request.body;

      if (!experience_id) {
        return reply.status(400).send({
          success: false,
          message: 'Experience ID is required'
        });
      }

      const wishlistItem = await this.wishlistService.addToWishlist(userId, experience_id);

      return reply.status(201).send({
        success: true,
        message: 'Item added to wishlist',
        item: wishlistItem
      });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to add item to wishlist'
      });
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(request: FastifyRequest<{ Params: { experience_id: string } }>, reply: FastifyReply) {
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

      await this.wishlistService.removeFromWishlist(userId, experience_id);

      return reply.send({
        success: true,
        message: 'Item removed from wishlist'
      });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to remove item from wishlist'
      });
    }
  }

  // Check if item is in wishlist
  async checkWishlistStatus(request: FastifyRequest<{ Params: { experience_id: string } }>, reply: FastifyReply) {
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

      const isInWishlist = await this.wishlistService.isInWishlist(userId, experience_id);

      return reply.send({
        success: true,
        isInWishlist
      });
    } catch (error) {
      console.error('Check wishlist status error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to check wishlist status'
      });
    }
  }

  // Get wishlist count
  async getWishlistCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const count = await this.wishlistService.getWishlistCount(userId);

      return reply.send({
        success: true,
        count
      });
    } catch (error) {
      console.error('Get wishlist count error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get wishlist count'
      });
    }
  }
}
