import { supabaseAdmin as supabase } from '../utils/supabase';

function getSingleExperience(rel: any) {
  return Array.isArray(rel) ? rel[0] : rel;
}

export interface CartItem {
  id: string;
  user_id: string;
  experience_id: string;
  quantity: number;
  added_at: string;
  title: string;
  slug: string;
  base_price: number;
  thumbnail_url: string;
  category: string;
  subcategory?: string;
  total_price: number;
}

export class CartService {
  // Add item to cart
  async addToCart(
    userId: string,
    experienceId: string,
    quantity: number = 1,
    extras?: { selected_date?: string; selected_time?: string; addons?: string[] }
  ): Promise<CartItem> {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      return this.updateCartItemQuantity(userId, experienceId, existingItem.quantity + quantity);
    } else {
      // Add new item to cart
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          experience_id: experienceId,
          quantity: quantity,
          selected_date: extras?.selected_date ?? null,
          selected_time: extras?.selected_time ?? null,
          addons: extras?.addons ?? []
        })
        .select(`
          id,
          user_id,
          experience_id,
          quantity,
          selected_date,
          selected_time,
          addons,
          added_at,
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
        throw new Error(`Failed to add to cart: ${error.message}`);
      }

      // Transform the data to match our interface
      const exp = getSingleExperience((data as any).experiences);
      return {
        id: (data as any).id,
        user_id: (data as any).user_id,
        experience_id: (data as any).experience_id,
        quantity: (data as any).quantity,
        // selected_date/time/addons exist in view but not CartItem interface; returned anyway via controller
        added_at: (data as any).added_at,
        title: exp.title,
        slug: exp.slug,
        base_price: exp.base_price,
        thumbnail_url: exp.thumbnail_url,
        category: exp.category,
        subcategory: exp.subcategory,
        total_price: (data as any).quantity * exp.base_price
      };
    }
  }

  // Update cart item quantity
  async updateCartItemQuantity(userId: string, experienceId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await this.removeFromCart(userId, experienceId);
      throw new Error('Item removed from cart');
    }

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('experience_id', experienceId)
      .select(`
        id,
        user_id,
        experience_id,
        quantity,
        added_at,
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
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    // Transform the data to match our interface
    const exp = getSingleExperience((data as any).experiences);
    return {
      id: (data as any).id,
      user_id: (data as any).user_id,
      experience_id: (data as any).experience_id,
      quantity: (data as any).quantity,
      added_at: (data as any).added_at,
      title: exp.title,
      slug: exp.slug,
      base_price: exp.base_price,
      thumbnail_url: exp.thumbnail_url,
      category: exp.category,
      subcategory: exp.subcategory,
      total_price: (data as any).quantity * exp.base_price
    };
  }

  // Remove item from cart
  async removeFromCart(userId: string, experienceId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('experience_id', experienceId);

    if (error) {
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
  }

  // Get user's cart
  async getUserCart(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('user_cart')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }

    return data || [];
  }

  // Clear user's cart
  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }

  // Get cart count for user
  async getCartCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('cart')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get cart count: ${error.message}`);
    }

    return count || 0;
  }

  // Get cart total
  async getCartTotal(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_cart')
      .select('total_price')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get cart total: ${error.message}`);
    }

    return data?.reduce((total, item) => total + item.total_price, 0) || 0;
  }
}
