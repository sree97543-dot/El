const http = require('http');
const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, 'data.csv');
let csvData = [];

function readCSV() {
  try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.trim().split('\n');
    const keys = ['EnrollmentNo', 'Name', 'Gender', 'FatherName', 'BarAssociation', 'Location'];
    
    csvData = lines.map(line => {
      const parts = line.split('\t');
      let obj = {};
      keys.forEach((key, idx) => {
        obj[key] = (parts[idx] || '').trim();
      });
      return obj;
    }).filter(d => d.EnrollmentNo);
    
    console.log(`✅ CSV loaded: ${csvData.length} records`);
  } catch (err) {
    console.error('❌ Error reading CSV:', err);
  }
}

// Initialize CSV data
readCSV();

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve HTML file
  if (req.url === '/' && req.method === 'GET') {
    const htmlPath = path.join(__dirname, 'indexp.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading HTML file');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // API endpoint: Get all data
  if (req.url === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(csvData));
    return;
  }

  // API endpoint: Search by enrollment number
  if (req.url.startsWith('/api/search/enrollment/') && req.method === 'GET') {
    const enrollmentNo = decodeURIComponent(req.url.replace('/api/search/enrollment/', ''));
    const result = csvData.find(d => d.EnrollmentNo.toLowerCase() === enrollmentNo.toLowerCase());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result || { error: 'Not found' }));
    return;
  }

  // API endpoint: Search by name
  if (req.url.startsWith('/api/search/name/') && req.method === 'GET') {
    const name = decodeURIComponent(req.url.replace('/api/search/name/', ''));
    const results = csvData.filter(d => d.Name.toLowerCase().includes(name.toLowerCase()));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
    return;
  }

  // Serve other static files
  const filePath = path.join(__dirname, req.url === '/' ? 'indexp.html' : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}\n`);
  console.log(`📝 CSV file path: ${csvPath}`);
  console.log(`📄 Total records: ${csvData.length}\n`);
});
