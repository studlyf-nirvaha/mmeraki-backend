import { FastifyRequest, FastifyReply } from 'fastify';
import { ImageService } from '../services/imageService';

const imageService = new ImageService();

export class ImageController {
  /**
   * POST /api/images/process
   * Process and store images from various sources
   */
  async processImages(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        images: string[];
        experienceId?: string;
      };

      if (!body.images || !Array.isArray(body.images)) {
        return reply.status(400).send({
          success: false,
          error: 'Images array is required'
        });
      }

      const experienceId = body.experienceId || `temp-${Date.now()}`;
      const results = await imageService.processMultipleImages(body.images, experienceId);

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      reply.send({
        success: true,
        data: {
          processed: successful.length,
          failed: failed.length,
          results: results,
          successfulUrls: successful.map(r => r.url),
          errors: failed.map(r => ({ url: r.originalUrl, error: r.error }))
        }
      });
    } catch (error) {
      console.error('Error in processImages controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to process images',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/images/validate
   * Validate image URLs accessibility
   */
  async validateImages(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        urls: string[];
      };

      if (!body.urls || !Array.isArray(body.urls)) {
        return reply.status(400).send({
          success: false,
          error: 'URLs array is required'
        });
      }

      const validationResults = await Promise.all(
        body.urls.map(async (url) => ({
          url,
          valid: await imageService.validateImageUrl(url),
          metadata: await imageService.getImageMetadata(url)
        }))
      );

      const validUrls = validationResults.filter(r => r.valid);
      const invalidUrls = validationResults.filter(r => !r.valid);

      reply.send({
        success: true,
        data: {
          total: validationResults.length,
          valid: validUrls.length,
          invalid: invalidUrls.length,
          results: validationResults
        }
      });
    } catch (error) {
      console.error('Error in validateImages controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to validate images',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/images/convert-drive
   * Convert Google Drive links to direct download links
   */
  async convertDriveLinks(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        urls: string[];
      };

      if (!body.urls || !Array.isArray(body.urls)) {
        return reply.status(400).send({
          success: false,
          error: 'URLs array is required'
        });
      }

      const convertedUrls = body.urls.map(url => {
        try {
          if (imageService['isGoogleDriveLink'](url)) {
            const directUrl = imageService['convertDriveLinkToDirect'](url);
            return {
              original: url,
              converted: directUrl,
              success: true
            };
          } else {
            return {
              original: url,
              converted: url,
              success: true,
              note: 'Not a Google Drive link'
            };
          }
        } catch (error) {
          return {
            original: url,
            converted: null,
            success: false,
            error: error instanceof Error ? error.message : 'Conversion failed'
          };
        }
      });

      const successful = convertedUrls.filter(r => r.success);
      const failed = convertedUrls.filter(r => !r.success);

      reply.send({
        success: true,
        data: {
          total: convertedUrls.length,
          successful: successful.length,
          failed: failed.length,
          results: convertedUrls
        }
      });
    } catch (error) {
      console.error('Error in convertDriveLinks controller:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to convert Drive links',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
