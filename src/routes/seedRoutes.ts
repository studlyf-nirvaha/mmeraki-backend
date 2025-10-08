import { FastifyInstance } from 'fastify';
import { seedExperiences } from '../data/seedExperiences';

export async function seedRoutes(fastify: FastifyInstance) {
  // POST /api/seed - Seed mock experiences into database
  fastify.post('/seed', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            count: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      console.log('🌱 Seeding experiences via API...');
      await seedExperiences();
      
      reply.send({
        success: true,
        message: 'Experiences seeded successfully',
        count: 15
      });
    } catch (error) {
      console.error('Error in seed endpoint:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to seed experiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
