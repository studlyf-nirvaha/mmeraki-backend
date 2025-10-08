export interface User {
  id: string;
  full_name: string;
  email: string;
  role?: 'user' | 'admin';
  phone_number?: string;
  hashed_password: string;
  profile_icon?: string;
  current_location: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string;
  wishlisted_items: string[]; // Array of experience IDs
  past_orders: Order[];
  cart_items: CartItem[];
  payment_methods: PaymentMethod[];
  is_active: boolean;
  is_verified: boolean;
  verification_token?: string;
  reset_password_token?: string;
  reset_password_expires?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  phone_number?: string;
  password: string;
  current_location?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone_number?: string;
  current_location?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string;
  profile_icon?: string;
}

export interface Order {
  id: string;
  experience_id: string;
  experience_title: string;
  experience_image: string;
  quantity: number;
  price: number;
  total_amount: number;
  booking_date: string;
  event_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CartItem {
  id: string;
  experience_id: string;
  experience_title: string;
  experience_image: string;
  price: number;
  quantity: number;
  selected_date?: string;
  selected_time?: string;
  addons: string[];
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last_four_digits?: string;
  upi_id?: string;
  bank_name?: string;
  is_default: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'hashed_password' | 'verification_token' | 'reset_password_token' | 'reset_password_expires'>;
  token?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
