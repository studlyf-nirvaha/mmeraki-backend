import { supabase, supabaseAdmin } from '../utils/supabase';
import { User, CreateUserRequest, UpdateProfileRequest, Order, CartItem, PaymentMethod } from '../types/User';
import bcrypt from 'bcryptjs';

export class UserService {
  // Create a new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    const { password, ...userInfo } = userData;
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = {
      ...userInfo,
      hashed_password: hashedPassword,
      current_location: userInfo.current_location || 'Delhi',
      wishlisted_items: [],
      past_orders: [],
      cart_items: [],
      payment_methods: [],
      is_active: true,
      is_verified: false,
    };

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  }

  // Verify password
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateProfileRequest): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  // Add to wishlist
  async addToWishlist(userId: string, experienceId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const wishlistedItems = user.wishlisted_items || [];
    if (!wishlistedItems.includes(experienceId)) {
      wishlistedItems.push(experienceId);
      
      const { error } = await supabaseAdmin
        .from('users')
        .update({ wishlisted_items: wishlistedItems })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to add to wishlist: ${error.message}`);
      }
    }
  }

  // Remove from wishlist
  async removeFromWishlist(userId: string, experienceId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const wishlistedItems = user.wishlisted_items || [];
    const updatedWishlist = wishlistedItems.filter(id => id !== experienceId);
    
    const { error } = await supabaseAdmin
      .from('users')
      .update({ wishlisted_items: updatedWishlist })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to remove from wishlist: ${error.message}`);
    }
  }

  // Update cart items
  async updateCartItems(userId: string, cartItems: CartItem[]): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ cart_items: cartItems })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update cart items: ${error.message}`);
    }
  }

  // Add past order
  async addPastOrder(userId: string, order: Order): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const pastOrders = user.past_orders || [];
    pastOrders.push(order);
    
    const { error } = await supabaseAdmin
      .from('users')
      .update({ past_orders: pastOrders })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to add past order: ${error.message}`);
    }
  }

  // Add payment method
  async addPaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const paymentMethods = user.payment_methods || [];
    
    // If this is set as default, remove default from others
    if (paymentMethod.is_default) {
      paymentMethods.forEach(pm => pm.is_default = false);
    }
    
    paymentMethods.push(paymentMethod);
    
    const { error } = await supabaseAdmin
      .from('users')
      .update({ payment_methods: paymentMethods })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to add payment method: ${error.message}`);
    }
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return user !== null;
  }

  // Update password
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const { error } = await supabaseAdmin
      .from('users')
      .update({ hashed_password: hashedPassword })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  // Delete user account
  async deleteUser(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return { error: `Failed to delete user: ${error.message}` };
      }

      return { error: null };
    } catch (error) {
      return { error: `Failed to delete user: ${error}` };
    }
  }
}