// CORS Proxy lokal — jalankan dengan: node proxy.js
// Lalu auto-fetch di web akan pakai http://localhost:8080/?url=...
// Tanpa proxy ini, auto-fetch mengandalkan proxy gratis yang sering mati/diblokir.

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const target = u.searchParams.get('url');
  if (!target) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Missing ?url= parameter');
  }
  const tgt = new URL(target);
  const mod = tgt.protocol === 'https:' ? https : http;
  const opts = {
    hostname: tgt.hostname, port: tgt.port, path: tgt.pathname + tgt.search,
    method: req.method,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Referer': tgt.origin + '/',
    },
    timeout: 15000,
  };
  const proxyReq = mod.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'text/html',
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (e) => {
    res.writeHead(502, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end('Proxy error: ' + e.message);
  });
  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.writeHead(504, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end('Proxy timeout');
  });
  proxyReq.end();
}).listen(PORT, () => {
  console.log('Hatono Haron CORS proxy running on http://localhost:' + PORT);
});
