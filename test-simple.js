import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

const body = JSON.stringify({
  email: `test${Date.now()}@test.com`,
  password: 'Test123!',
  name: 'Test User'
});

req.write(body);
req.end();
