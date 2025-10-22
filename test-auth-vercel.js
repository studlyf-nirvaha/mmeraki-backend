const fetch = require('node-fetch');

const BASE_URL = 'https://mmeraki-backend1.vercel.app';

async function testAuth() {
  console.log('🧪 Testing Vercel Authentication Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test simple test endpoint
    console.log('\n2. Testing test endpoint...');
    const testResponse = await fetch(`${BASE_URL}/test`);
    const testData = await testResponse.json();
    console.log('✅ Test endpoint:', testData.message);

    // Test register endpoint
    console.log('\n3. Testing register endpoint...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    console.log('Register response status:', registerResponse.status);
    console.log('Register response:', JSON.stringify(registerResult, null, 2));

    if (registerResult.success && registerResult.token) {
      console.log('✅ Registration successful!');
      
      // Test login endpoint
      console.log('\n4. Testing login endpoint...');
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const loginResult = await loginResponse.json();
      console.log('Login response status:', loginResponse.status);
      console.log('Login response:', JSON.stringify(loginResult, null, 2));

      if (loginResult.success && loginResult.token) {
        console.log('✅ Login successful!');
        
        // Test profile endpoint
        console.log('\n5. Testing profile endpoint...');
        const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
            'Content-Type': 'application/json'
          }
        });

        const profileResult = await profileResponse.json();
        console.log('Profile response status:', profileResponse.status);
        console.log('Profile response:', JSON.stringify(profileResult, null, 2));

        if (profileResult.success) {
          console.log('✅ Profile fetch successful!');
        } else {
          console.log('❌ Profile fetch failed');
        }

        // Test verify token endpoint
        console.log('\n6. Testing verify token endpoint...');
        const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
            'Content-Type': 'application/json'
          }
        });

        const verifyResult = await verifyResponse.json();
        console.log('Verify response status:', verifyResponse.status);
        console.log('Verify response:', JSON.stringify(verifyResult, null, 2));

        if (verifyResult.success) {
          console.log('✅ Token verification successful!');
        } else {
          console.log('❌ Token verification failed');
        }
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
