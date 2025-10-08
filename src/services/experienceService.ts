import { supabase, supabaseAdmin } from '../utils/supabase';
import { Experience, CreateExperienceData, ExperienceFilters } from '../types/Experience';
import { generateSlug } from '../utils/slugGenerator';

export class ExperienceService {
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

      const { data, error } = await supabaseAdmin
        .from('experiences')
        .insert([{
          ...experienceData,
          slug,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        // Handle RLS policy violations
        if (error.code === '42501' || error.message.includes('permission denied')) {
          throw new Error('Insufficient permissions to create experience. Please ensure you have the proper role.');
        }
        throw new Error(`Failed to create experience: ${error.message}`);
      }

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
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingData) {
        return null; // Experience not found
      }

      // If title is being updated, generate new slug
      let updateData: Partial<CreateExperienceData> & { slug?: string } = { ...updates };
      if (updates.title) {
        (updateData as any).slug = generateSlug(updates.title);
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
