const https = require('https');
const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      const chunks = [];
      res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: buffer.toString('utf8') });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

(async () => {
  const source = 'https://dearbulut.github.io/iptv/api/v1/channels.online.json';
  const payload = await get(source);
  const data = JSON.parse(payload.body);
  const sample = data.slice().sort(() => Math.random() - 0.5).slice(0, 30);

  let ok = 0;
  let noStream = 0;
  let errors = 0;
  const details = [];

  for (const channel of sample) {
    const streams = Array.isArray(channel.streams) ? channel.streams.filter((s) => s && s.url) : [];
    if (!streams.length) {
      noStream += 1;
      details.push({ id: channel.id, name: channel.name, status: 'no-stream' });
      continue;
    }

    const url = streams[0].url;
    try {
      const res = await get(url);
      const body = res.body || '';
      const probe = body.slice(0, 120).toLowerCase();
      const looksPlayable = /extm3u|#extm3u|playlist|mpegurl/i.test(probe) || res.headers['content-type']?.toString().includes('mpegurl');
      if (looksPlayable) {
        ok += 1;
        details.push({ id: channel.id, name: channel.name, status: 'ok' });
      } else {
        errors += 1;
        details.push({ id: channel.id, name: channel.name, status: 'bad-response' });
      }
    } catch (err) {
      errors += 1;
      details.push({ id: channel.id, name: channel.name, status: 'error' });
    }
  }

  console.log(JSON.stringify({ total: sample.length, ok, noStream, errors, details }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
