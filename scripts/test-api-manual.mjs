#!/usr/bin/env node

/**
 * Manual API Test Script
 *
 * Simple script to manually test the API without Jest
 * This helps verify the server is working before running full test suite
 */

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, options);
    const status = response.status;
    const statusText = response.statusText;

    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    if (status >= 200 && status < 300) {
      console.log(`✅ ${name}: ${status} ${statusText}`);
      return { success: true, data };
    } else {
      console.log(`❌ ${name}: ${status} ${statusText}`);
      return { success: false, data };
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Manual API Tests\n');
  console.log('Testing server at:', BASE_URL);
  console.log('─'.repeat(50));

  // Test 1: Check if server is running
  console.log('\n📡 Testing server connectivity...');
  const healthCheck = await testEndpoint(
    'Server Health Check',
    `${BASE_URL}/api/currencies`
  );

  if (!healthCheck.success) {
    console.log('\n❌ Server is not responding!');
    console.log('Make sure the server is running on port 3001');
    console.log('Run: bun run preview:test');
    process.exit(1);
  }

  // Test 2: Get currencies
  console.log('\n💰 Testing currencies endpoint...');
  const currencies = await testEndpoint(
    'GET /api/currencies',
    `${BASE_URL}/api/currencies`
  );

  if (currencies.success && currencies.data.length > 0) {
    console.log(`   Found ${currencies.data.length} currencies`);
  }

  // Test 3: Get trips
  console.log('\n✈️  Testing trips endpoint...');
  const trips = await testEndpoint(
    'GET /api/trips',
    `${BASE_URL}/api/trips`
  );

  if (trips.success) {
    console.log(`   Found ${trips.data.length} trips`);
  }

  // Test 4: Get airlines
  console.log('\n🛫 Testing airlines endpoint...');
  const airlines = await testEndpoint(
    'GET /api/airlines',
    `${BASE_URL}/api/airlines?limit=5`
  );

  if (airlines.success && airlines.data.length > 0) {
    console.log(`   Found ${airlines.data.length} airlines`);
  }

  // Test 5: Create a trip
  console.log('\n➕ Testing trip creation...');
  if (currencies.success && currencies.data.length > 0) {
    const currencyId = currencies.data[0].id;
    const newTrip = {
      title: 'Manual Test Trip',
      startDate: '2024-12-01T00:00:00.000Z',
      endDate: '2024-12-10T00:00:00.000Z',
      currencyId: currencyId,
    };

    const createResult = await testEndpoint(
      'POST /api/trips',
      `${BASE_URL}/api/trips`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip),
      }
    );

    if (createResult.success && createResult.data.id) {
      const tripId = createResult.data.id;
      console.log(`   Created trip with ID: ${tripId}`);

      // Test 6: Get the created trip
      console.log('\n🔍 Testing trip retrieval...');
      await testEndpoint(
        `GET /api/trips/${tripId}`,
        `${BASE_URL}/api/trips/${tripId}`
      );

      // Test 7: Update the trip
      console.log('\n✏️  Testing trip update...');
      await testEndpoint(
        `PUT /api/trips/${tripId}`,
        `${BASE_URL}/api/trips/${tripId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Manual Test Trip' }),
        }
      );

      // Test 8: Delete the trip
      console.log('\n🗑️  Testing trip deletion...');
      await testEndpoint(
        `DELETE /api/trips/${tripId}`,
        `${BASE_URL}/api/trips/${tripId}`,
        { method: 'DELETE' }
      );

      // Verify deletion
      console.log('\n✔️  Verifying deletion...');
      const deleteCheck = await testEndpoint(
        `GET /api/trips/${tripId} (should 404)`,
        `${BASE_URL}/api/trips/${tripId}`
      );

      if (!deleteCheck.success && deleteCheck.data?.statusCode === 404) {
        console.log('   Trip successfully deleted ✅');
      }
    }
  }

  // Test 9: Test error handling
  console.log('\n🚫 Testing error handling...');
  await testEndpoint(
    'GET non-existent trip (should 404)',
    `${BASE_URL}/api/trips/non-existent-id`
  );

  await testEndpoint(
    'POST invalid trip (should 400)',
    `${BASE_URL}/api/trips`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }), // Invalid empty title
    }
  );

  console.log('\n' + '─'.repeat(50));
  console.log('✅ Manual tests completed!\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test runner failed:', error);
  process.exit(1);
});
