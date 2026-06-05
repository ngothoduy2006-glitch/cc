const http = require('http');
const payload = JSON.stringify({ name: 'Test User', studentId: 'test123', password: 'password1' });
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const result = {
      statusCode: res.statusCode,
      headers: res.headers,
      body: data,
    };
    require('fs').writeFileSync('scripts/auth-test-result.json', JSON.stringify(result, null, 2));
    console.log('Wrote scripts/auth-test-result.json');
  });
});

req.on('error', (err) => {
  require('fs').writeFileSync('scripts/auth-test-result.json', JSON.stringify({ error: err.message }, null, 2));
  console.error('Request error:', err.message);
});

req.write(payload);
req.end();
