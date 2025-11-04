import { FastifyInstance } from 'fastify';
import { ImageController } from '../controllers/imageController';

const controller = new ImageController();

export default async function imageRoutes(fastify: FastifyInstance) {
  // Process and store images
  fastify.post('/images/process', controller.processImages.bind(controller));
  
  // Validate image URLs
  fastify.post('/images/validate', controller.validateImages.bind(controller));
  
  // Convert Google Drive links
  fastify.post('/images/convert-drive', controller.convertDriveLinks.bind(controller));
}
