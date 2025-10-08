import { supabaseAdmin as supabase } from '../utils/supabase';

interface CreateOrderInput {
  userId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    state: string;
  };
  paymentMethod: string;
  selectedDate?: string;
  selectedTime?: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const { userId, customer, paymentMethod, selectedDate, selectedTime } = input;

    // Fetch current cart snapshot joined with experiences
    const { data: cartItems, error: cartError } = await supabase
      .from('user_cart')
      .select('*')
      .eq('user_id', userId);

    if (cartError) {
      throw new Error(`Failed to fetch cart for order: ${cartError.message}`);
    }

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);

    // Create order row (normalized fields)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        payment_id: null,
        payment_method: paymentMethod,
        status: 'confirmed',
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        pincode: customer.pincode,
        state: customer.state,
        total_amount: total
      }])
      .select('*')
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message || 'unknown error'}`);
    }

    // Insert order_items rows
    const orderItemsPayload = cartItems.map((ci: any) => ({
      order_id: order.id,
      experience_id: ci.experience_id,
      quantity: ci.quantity || 1,
      unit_price: ci.base_price || 0,
      selected_date: selectedDate || ci.selected_date || null,
      selected_time: selectedTime || ci.selected_time || null,
      addons: ci.addons || []
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Clear cart after successful order
    const { error: clearError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (clearError) {
      console.error('Failed to clear cart after order:', clearError);
    }

    return { ...order, items: orderItemsPayload };
  }

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  }
}


