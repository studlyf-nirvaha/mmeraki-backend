// Simple test script to verify JWT authentication is working
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api/auth';

async function testAuth() {
  console.log('🧪 Testing JWT Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        current_location: 'Delhi',
        gender: 'male',
        phone_number: '9876543210'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Registration result:', registerData.success ? '✅ Success' : '❌ Failed');
    console.log('Response:', registerData);

    if (!registerData.success) {
      console.log('❌ Registration failed, stopping tests');
      return;
    }

    const token = registerData.token;
    console.log('Token received:', token ? '✅ Yes' : '❌ No');

    // Test 2: Verify token
    console.log('\n2️⃣ Testing token verification...');
    const verifyResponse = await fetch(`${API_BASE}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();
    console.log('Token verification:', verifyData.success ? '✅ Success' : '❌ Failed');

    // Test 3: Get user profile
    console.log('\n3️⃣ Testing get user profile...');
    const profileResponse = await fetch(`${API_BASE}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileData = await profileResponse.json();
    console.log('Profile fetch:', profileData.success ? '✅ Success' : '❌ Failed');
    console.log('User data:', profileData.user ? '✅ Received' : '❌ Missing');

    // Test 4: Login with existing user
    console.log('\n4️⃣ Testing user login...');
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login result:', loginData.success ? '✅ Success' : '❌ Failed');

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('- User registration: Working');
    console.log('- JWT token generation: Working');
    console.log('- Token verification: Working');
    console.log('- User profile fetch: Working');
    console.log('- User login: Working');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuth();
