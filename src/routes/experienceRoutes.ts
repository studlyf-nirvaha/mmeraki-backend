import { FastifyInstance } from 'fastify';
import { ExperienceController } from '../controllers/experienceController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const experienceController = new ExperienceController();

export async function experienceRoutes(fastify: FastifyInstance) {
  // GET /api/experiences - Get all experiences with optional filtering
  fastify.get('/experiences', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          subcategory: { type: 'string' },
          is_featured: { type: 'string', enum: ['true', 'false'] },
          template_type: { type: 'string', enum: ['standard', 'special'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  category: { type: 'string' },
                  subcategory: { type: 'string' },
                  short_desc: { type: 'string' },
                  description: { type: 'string' },
                  base_price: { type: 'number' },
                  images: { type: 'array', items: { type: 'string' } },
                  thumbnail_url: { type: 'string' },
                  template_type: { type: 'string' },
                  is_featured: { type: 'boolean' },
                  created_at: { type: 'string' }
                }
              }
            },
            count: { type: 'number' }
          }
        }
      }
    }
  }, experienceController.getAllExperiences.bind(experienceController));
  // POST /api/experiences - Create a new experience (admin/service role)
  fastify.post('/experiences', { preHandler: [authenticateToken, authorizeAdmin] }, async (request, reply) => {
    try {
      const controller = new ExperienceController();
      // @ts-ignore
      const created = await controller.createExperience?.(request as any, reply);
      if (!created) return; // controller handled the reply
    } catch (e) {
      fastify.log.error(e);
      reply.status(500).send({ success: false, message: 'Failed to create experience' });
    }
  });

  // GET /api/experiences/featured - Get featured experiences
  fastify.get('/experiences/featured', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  category: { type: 'string' },
                  subcategory: { type: 'string' },
                  short_desc: { type: 'string' },
                  description: { type: 'string' },
                  base_price: { type: 'number' },
                  images: { type: 'array', items: { type: 'string' } },
                  thumbnail_url: { type: 'string' },
                  template_type: { type: 'string' },
                  is_featured: { type: 'boolean' },
                  created_at: { type: 'string' }
                }
              }
            },
            count: { type: 'number' }
          }
        }
      }
    }
  }, experienceController.getFeaturedExperiences.bind(experienceController));

  // GET /api/experiences/category/:category - Get experiences by category
  fastify.get('/experiences/category/:category', {
    schema: {
      params: {
        type: 'object',
        properties: {
          category: { type: 'string' }
        },
        required: ['category']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  category: { type: 'string' },
                  subcategory: { type: 'string' },
                  short_desc: { type: 'string' },
                  description: { type: 'string' },
                  base_price: { type: 'number' },
                  images: { type: 'array', items: { type: 'string' } },
                  thumbnail_url: { type: 'string' },
                  template_type: { type: 'string' },
                  is_featured: { type: 'boolean' },
                  created_at: { type: 'string' }
                }
              }
            },
            count: { type: 'number' }
          }
        }
      }
    }
  }, experienceController.getExperiencesByCategory.bind(experienceController));

  // GET /api/experiences/search - Search experiences
  fastify.get('/experiences/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' }
        },
        required: ['q']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  category: { type: 'string' },
                  subcategory: { type: 'string' },
                  short_desc: { type: 'string' },
                  description: { type: 'string' },
                  base_price: { type: 'number' },
                  images: { type: 'array', items: { type: 'string' } },
                  thumbnail_url: { type: 'string' },
                  template_type: { type: 'string' },
                  is_featured: { type: 'boolean' },
                  created_at: { type: 'string' }
                }
              }
            },
            count: { type: 'number' },
            query: { type: 'string' }
          }
        }
      }
    }
  }, experienceController.searchExperiences.bind(experienceController));

  // PUT /api/experiences/:id - Update an experience (admin only)
  fastify.put('/experiences/:id', { preHandler: [authenticateToken, authorizeAdmin] }, experienceController.updateExperience.bind(experienceController));

  // DELETE /api/experiences/:id - Delete an experience (admin only)
  fastify.delete('/experiences/:id', { preHandler: [authenticateToken, authorizeAdmin] }, experienceController.deleteExperience.bind(experienceController));

  // GET /api/experiences/:slug - Get single experience by slug
  fastify.get('/experiences/:slug', {
    schema: {
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' }
        },
        required: ['slug']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                slug: { type: 'string' },
                category: { type: 'string' },
                subcategory: { type: 'string' },
                short_desc: { type: 'string' },
                description: { type: 'string' },
                base_price: { type: 'number' },
                images: { type: 'array', items: { type: 'string' } },
                thumbnail_url: { type: 'string' },
                template_type: { type: 'string' },
                is_featured: { type: 'boolean' },
                created_at: { type: 'string' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, experienceController.getExperienceBySlug.bind(experienceController));
}
