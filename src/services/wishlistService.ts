import { supabase } from '../utils/supabase';

function getSingleExperience(rel: any) {
  return Array.isArray(rel) ? rel[0] : rel;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  experience_id: string;
  created_at: string;
  title: string;
  slug: string;
  base_price: number;
  thumbnail_url: string;
  category: string;
  subcategory?: string;
}

export class WishlistService {
  // Add item to wishlist
  async addToWishlist(userId: string, experienceId: string): Promise<WishlistItem> {
    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        experience_id: experienceId
      })
      .select(`
        id,
        user_id,
        experience_id,
        created_at,
        experiences!inner(
          title,
          slug,
          base_price,
          thumbnail_url,
          category,
          subcategory
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to add to wishlist: ${error.message}`);
    }

    // Transform the data to match our interface
    const exp = getSingleExperience((data as any).experiences);
    return {
      id: (data as any).id,
      user_id: (data as any).user_id,
      experience_id: (data as any).experience_id,
      created_at: (data as any).created_at,
      title: exp.title,
      slug: exp.slug,
      base_price: exp.base_price,
      thumbnail_url: exp.thumbnail_url,
      category: exp.category,
      subcategory: exp.subcategory
    };
  }

  // Remove item from wishlist
  async removeFromWishlist(userId: string, experienceId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('experience_id', experienceId);

    if (error) {
      throw new Error(`Failed to remove from wishlist: ${error.message}`);
    }
  }

  // Get user's wishlist
  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('user_wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch wishlist: ${error.message}`);
    }

    return data || [];
  }

  // Check if item is in wishlist
  async isInWishlist(userId: string, experienceId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to check wishlist: ${error.message}`);
    }

    return !!data;
  }

  // Get wishlist count for user
  async getWishlistCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get wishlist count: ${error.message}`);
    }

    return count || 0;
  }
}
