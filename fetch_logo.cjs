const https = require('https');

https.get('https://openview-three.vercel.app/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const matches = data.match(/<img[^>]+src="([^">]+)"/g);
    console.log(matches);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
