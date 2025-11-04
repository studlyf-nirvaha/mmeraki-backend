import { supabase, supabaseAdmin } from '../utils/supabase';
import { Experience, CreateExperienceData, ExperienceFilters } from '../types/Experience';
import { generateSlug } from '../utils/slugGenerator';
import { ImageService } from './imageService';

export class ExperienceService {
  private imageService = new ImageService();

  /**
   * Get all experiences with optional filtering
   */
  async getAllExperiences(filters?: ExperienceFilters): Promise<Experience[]> {
    try {
      let query = supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters?.template_type) {
        query = query.eq('template_type', filters.template_type);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch experiences: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllExperiences:', error);
      throw error;
    }
  }

  /**
   * Get a single experience by slug
   */
  async getExperienceBySlug(slug: string): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        throw new Error(`Failed to fetch experience: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getExperienceBySlug:', error);
      throw error;
    }
  }

  /**
   * Get a single experience by ID
   */
  async getExperienceById(id: string): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        throw new Error(`Failed to fetch experience: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getExperienceById:', error);
      throw error;
    }
  }

  /**
   * Create a new experience
   */
  async createExperience(experienceData: CreateExperienceData): Promise<Experience> {
    try {
      // Generate slug from title
      const slug = generateSlug(experienceData.title);

      // Check if slug already exists
      const existingExperience = await this.getExperienceBySlug(slug);
      if (existingExperience) {
        throw new Error(`Experience with slug '${slug}' already exists`);
      }

      // Process images if provided
      let processedImages: string[] = [];
      let processedThumbnail: string | undefined;

      if (experienceData.images && experienceData.images.length > 0) {
        console.log('Processing images for experience:', experienceData.title);
        
        // Process thumbnail first
        if (experienceData.thumbnail_url) {
          const thumbnailResult = await this.imageService.processAndStoreImage(
            experienceData.thumbnail_url,
            'temp-' + Date.now(),
            0
          );
          if (thumbnailResult.success && thumbnailResult.url) {
            processedThumbnail = thumbnailResult.url;
          }
        }

        // Process all images
        const imageResults = await this.imageService.processMultipleImages(
          experienceData.images,
          'temp-' + Date.now()
        );

        processedImages = imageResults
          .filter(result => result.success && result.url)
          .map(result => result.url!);

        // If no thumbnail was processed, use the first successful image
        if (!processedThumbnail && processedImages.length > 0) {
          processedThumbnail = processedImages[0];
        }
      }

      // Prepare data for insertion
      const dataToInsert = {
        ...experienceData,
        slug,
        images: processedImages.length > 0 ? processedImages : experienceData.images,
        thumbnail_url: processedThumbnail || experienceData.thumbnail_url,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('experiences')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        // Handle RLS policy violations
        if (error.code === '42501' || error.message.includes('permission denied')) {
          throw new Error('Insufficient permissions to create experience. Please ensure you have the proper role.');
        }
        throw new Error(`Failed to create experience: ${error.message}`);
      }

      console.log('Experience created successfully with processed images:', {
        id: data.id,
        title: data.title,
        imagesCount: processedImages.length,
        thumbnail: !!processedThumbnail
      });

      return data;
    } catch (error) {
      console.error('Error in createExperience:', error);
      throw error;
    }
  }

  /**
   * Update an existing experience
   */
  async updateExperience(id: string, updates: Partial<CreateExperienceData>): Promise<Experience | null> {
    try {
      // First check if the experience exists
      const { data: existingData, error: checkError } = await supabaseAdmin
        .from('experiences')
        .select('id, title')
        .eq('id', id)
        .single();

      if (checkError || !existingData) {
        return null; // Experience not found
      }

      // Process images if provided
      let processedImages: string[] | undefined;
      let processedThumbnail: string | undefined;

      if (updates.images && updates.images.length > 0) {
        console.log('Processing images for experience update:', existingData.title);
        
        // Process thumbnail first
        if (updates.thumbnail_url) {
          const thumbnailResult = await this.imageService.processAndStoreImage(
            updates.thumbnail_url,
            id,
            0
          );
          if (thumbnailResult.success && thumbnailResult.url) {
            processedThumbnail = thumbnailResult.url;
          }
        }

        // Process all images
        const imageResults = await this.imageService.processMultipleImages(
          updates.images,
          id
        );

        processedImages = imageResults
          .filter(result => result.success && result.url)
          .map(result => result.url!);

        // If no thumbnail was processed, use the first successful image
        if (!processedThumbnail && processedImages.length > 0) {
          processedThumbnail = processedImages[0];
        }
      }

      // If title is being updated, generate new slug
      let updateData: Partial<CreateExperienceData> & { slug?: string } = { ...updates };
      if (updates.title) {
        (updateData as any).slug = generateSlug(updates.title);
      }

      // Update with processed images
      if (processedImages !== undefined) {
        updateData.images = processedImages;
      }
      if (processedThumbnail) {
        updateData.thumbnail_url = processedThumbnail;
      }

      const { data, error } = await supabaseAdmin
        .from('experiences')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Handle RLS policy violations
        if (error.code === '42501' || error.message.includes('permission denied')) {
          throw new Error('Insufficient permissions to update experience. Please ensure you have the proper role.');
        }
        throw new Error(`Failed to update experience: ${error.message}`);
      }

      console.log('Experience updated successfully with processed images:', {
        id: data.id,
        title: data.title,
        imagesCount: processedImages?.length || 0,
        thumbnail: !!processedThumbnail
      });

      return data;
    } catch (error) {
      console.error('Error in updateExperience:', error);
      throw error;
    }
  }

  /**
   * Delete an experience
   */
  async deleteExperience(id: string): Promise<boolean> {
    try {
      // First check if the experience exists
      const { data: existingData, error: checkError } = await supabaseAdmin
        .from('experiences')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingData) {
        return false; // Experience not found
      }

      const { error } = await supabaseAdmin
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) {
        // Handle RLS policy violations
        if (error.code === '42501' || error.message.includes('permission denied')) {
          throw new Error('Insufficient permissions to delete experience. Please ensure you have the proper role.');
        }
        throw new Error(`Failed to delete experience: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteExperience:', error);
      throw error;
    }
  }

  /**
   * Get featured experiences
   */
  async getFeaturedExperiences(): Promise<Experience[]> {
    return this.getAllExperiences({ is_featured: true });
  }

  /**
   * Get experiences by category
   */
  async getExperiencesByCategory(category: string): Promise<Experience[]> {
    return this.getAllExperiences({ category });
  }

  /**
   * Search experiences by title or description
   */
  async searchExperiences(searchTerm: string): Promise<Experience[]> {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_desc.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to search experiences: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchExperiences:', error);
      throw error;
    }
  }
}
