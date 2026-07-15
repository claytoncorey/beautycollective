import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://firestore.googleapis.com/v1/projects/new-mexico-collective/databases/(default)/documents/professionals';

https.get(URL, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const docs = json.documents || [];
      const activeIds = [];

      for (const doc of docs) {
        const fields = doc.fields || {};
        const status = fields.status?.stringValue;
        const id = fields.id?.stringValue;
        if (status === 'active' && id) {
          activeIds.push(id);
        }
      }

      console.log(`Found ${activeIds.length} active professionals.`);

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://newmexicobeautycollective.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://newmexicobeautycollective.com/profile</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${activeIds.map(id => `  <url>
    <loc>https://newmexicobeautycollective.com/expert/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

      const outputPath = path.join(__dirname, '../public/sitemap.xml');
      
      // Ensure directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, sitemap, 'utf8');
      console.log(`Successfully generated sitemap.xml with ${activeIds.length + 2} URLs.`);
    } catch (e) {
      console.error('Failed to parse response or write sitemap:', e);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('HTTPS request failed:', err);
  process.exit(1);
});
