const https = require('https');

const postData = JSON.stringify({
  registration_ids: ["test-token"],
  notification: {
    title: "Test",
    body: "Test message"
  }
});

const options = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/fcm/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'key=AIzaSyDDOJSgjx30yjdLDm5HOXqXoQ5kYdWknz4',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(postData);
req.end();
