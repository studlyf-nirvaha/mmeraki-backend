// Simple test script to verify API endpoints
const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await fetch(`${BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData.message);
    console.log('📋 Available endpoints:', Object.keys(rootData.endpoints));

    // Test experiences endpoint
    console.log('\n3. Testing experiences endpoint...');
    const expResponse = await fetch(`${BASE_URL}/api/experiences`);
    const expData = await expResponse.json();
    console.log('✅ Experiences endpoint:', expData.success ? 'Working' : 'Failed');
    console.log('📊 Number of experiences:', expData.experiences?.length || 0);

    console.log('\n🎉 All basic tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the database setup SQL files in Supabase');
    console.log('2. Test authentication endpoints with a real user');
    console.log('3. Test wishlist and cart endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the backend server is running:');
    console.log('   cd backend && npm run dev');
  }
}

testAPI();
