const fs = require('fs');
const https = require('https');
const path = require('path');

const data = require('./frontend/src/lib/exerciseGifs.json');
const ids = Array.from(new Set([...Object.values(data.byName), ...Object.values(data.byId)]));

const outDir = path.join(__dirname, 'frontend', 'public', 'exercises');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Starting download of ${ids.length} high-quality 3D exercise GIFs into ${outDir}...`);

function downloadOne(id) {
  const filePath = path.join(outDir, `${id}.gif`);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
    return Promise.resolve({ id, status: 'already_exists' });
  }

  const url = `${data.cdnBase}${id}.gif`;
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filePath);
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(filePath, () => {});
        return resolve({ id, status: `failed_${res.statusCode}` });
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve({ id, status: 'downloaded', size: fs.statSync(filePath).size });
      });
    });
    req.on('error', (err) => {
      fs.unlink(filePath, () => {});
      resolve({ id, status: `error_${err.message}` });
    });
  });
}

async function run() {
  const batchSize = 6;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(downloadOne));
    console.log(`[${i + results.length}/${ids.length}] Processed batch:`, results.map(r => `${r.id}:${r.status}`).join(', '));
  }
  console.log('Finished downloading all exercise GIFs!');
}

run().catch(console.error);
