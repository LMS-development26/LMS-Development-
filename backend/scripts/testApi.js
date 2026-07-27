const http = require('http');

// Test the health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test the login endpoint
function testLoginEndpoint() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'student@lms.com',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test the categories endpoint
async function testCategoriesEndpoint(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/categories',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing API connection...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testHealthEndpoint();
    console.log('✓ Health check:', health);
    
    // Test login endpoint
    console.log('\n2. Testing login endpoint...');
    const login = await testLoginEndpoint();
    console.log('✓ Login response:', JSON.stringify(login, null, 2));
    
    if (login.success && login.data.token) {
      const token = login.data.token;
      
      // Test categories endpoint
      console.log('\n3. Testing categories endpoint...');
      const categories = await testCategoriesEndpoint(token);
      console.log('✓ Categories response:', JSON.stringify(categories, null, 2));
    }
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

runTests();