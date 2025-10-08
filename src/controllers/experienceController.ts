import { FastifyRequest, FastifyReply } from 'fastify';
import { ExperienceService } from '../services/experienceService';
import { ExperienceFilters } from '../types/Experience';

const experienceService = new ExperienceService();

export class ExperienceController {
  /**
   * GET /api/experiences
   * Get all experiences with optional filtering
   */
  async getAllExperiences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as {
        category?: string;
        subcategory?: string;
        is_featured?: string;
        template_type?: string;
      };

      const filters: ExperienceFilters = {};
      
      if (query.category) filters.category = query.category;
      if (query.subcategory) filters.subcategory = query.subcategory;
      if (query.is_featured) filters.is_featured = query.is_featured === 'true';
      if (query.template_type) filters.template_type = query.template_type as 'standard' | 'special';

      const experiences = await experienceService.getAllExperiences(filters);

      reply.send({
        success: true,
        data: experiences,
        count: experiences.length
      });
    } catch (error) {
      console.error('Error in getAllExperiences controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch experiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/experiences
   * Create a new experience
   */
  async createExperience(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const created = await experienceService.createExperience(body);
      return reply.status(201).send({ success: true, data: created });
    } catch (error) {
      console.error('Error in createExperience controller:', error);
      return reply.status(500).send({ success: false, message: error instanceof Error ? error.message : 'Failed to create experience' });
    }
  }

  /**
   * GET /api/experiences/:slug
   * Get a single experience by slug
   */
  async getExperienceBySlug(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = request.params as { slug: string };

      if (!slug) {
        return reply.status(400).send({
          success: false,
          error: 'Slug parameter is required'
        });
      }

      const experience = await experienceService.getExperienceBySlug(slug);

      if (!experience) {
        return reply.status(404).send({
          success: false,
          error: 'Experience not found'
        });
      }

      reply.send({
        success: true,
        data: experience
      });
    } catch (error) {
      console.error('Error in getExperienceBySlug controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch experience',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/experiences/featured
   * Get featured experiences
   */
  async getFeaturedExperiences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const experiences = await experienceService.getFeaturedExperiences();

      reply.send({
        success: true,
        data: experiences,
        count: experiences.length
      });
    } catch (error) {
      console.error('Error in getFeaturedExperiences controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch featured experiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/experiences/category/:category
   * Get experiences by category
   */
  async getExperiencesByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { category } = request.params as { category: string };

      if (!category) {
        return reply.status(400).send({
          success: false,
          error: 'Category parameter is required'
        });
      }

      const experiences = await experienceService.getExperiencesByCategory(category);

      reply.send({
        success: true,
        data: experiences,
        count: experiences.length
      });
    } catch (error) {
      console.error('Error in getExperiencesByCategory controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch experiences by category',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/experiences/search?q=searchTerm
   * Search experiences
   */
  async searchExperiences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { q } = request.query as { q?: string };

      if (!q || q.trim().length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Search query parameter "q" is required'
        });
      }

      const experiences = await experienceService.searchExperiences(q.trim());

      reply.send({
        success: true,
        data: experiences,
        count: experiences.length,
        query: q.trim()
      });
    } catch (error) {
      console.error('Error in searchExperiences controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to search experiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/experiences/:id
   * Update an experience (admin only)
   */
  async updateExperience(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;

      if (!id) {
        return reply.status(400).send({
          success: false,
          error: 'Experience ID is required'
        });
      }

      const updated = await experienceService.updateExperience(id, body);

      if (!updated) {
        return reply.status(404).send({
          success: false,
          error: 'Experience not found'
        });
      }

      reply.send({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Error in updateExperience controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update experience',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/experiences/:id
   * Delete an experience (admin only)
   */
  async deleteExperience(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      if (!id) {
        return reply.status(400).send({
          success: false,
          error: 'Experience ID is required'
        });
      }

      const deleted = await experienceService.deleteExperience(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Experience not found'
        });
      }

      reply.send({
        success: true,
        message: 'Experience deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteExperience controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to delete experience',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
