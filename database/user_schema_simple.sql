-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS users CASCADE;

-- Users table schema (using 'users' instead of 'user' to avoid reserved keyword issues)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin')),
    phone_number VARCHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    profile_icon TEXT, -- URL to profile image
    current_location VARCHAR(100) DEFAULT 'Delhi',
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    date_of_birth DATE,
    wishlisted_items JSONB DEFAULT '[]'::jsonb, -- Array of experience IDs
    past_orders JSONB DEFAULT '[]'::jsonb, -- Array of order objects
    cart_items JSONB DEFAULT '[]'::jsonb, -- Array of cart item objects
    payment_methods JSONB DEFAULT '[]'::jsonb, -- Array of payment method objects
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Create policies for users table
-- Allow service role to manage all users (for your backend)
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.role() = 'service_role' OR auth.uid()::text = id::text);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::text = id::text);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, UPDATE, INSERT, DELETE ON users TO service_role;
GRANT SELECT, UPDATE ON users TO authenticated;
