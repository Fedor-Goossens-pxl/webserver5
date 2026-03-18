const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf':  'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip':  'application/zip',
};

// Extensies die als download moeten worden aangeboden
const downloadExts = new Set(['.docx', '.xlsx', '.zip', '.pdf']);

const server = http.createServer((req, res) => {
  // Decodeer URL zodat spaties en speciale tekens correct werken
  let filePath = '.' + decodeURIComponent(req.url.split('?')[0]);
  if (filePath === './') filePath = './index.html';

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 – Bestand niet gevonden');
      return;
    }

    const headers = { 'Content-Type': contentType };

    // Voeg Content-Disposition toe voor downloadbare bestanden
    if (downloadExts.has(ext)) {
      const filename = path.basename(filePath);
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Portfolio server draait op http://localhost:${PORT}`);
  console.log(`   Druk Ctrl+C om te stoppen.`);
});
