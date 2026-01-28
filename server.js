const http = require('http');
const fs = require('fs');
const path = require('path');

// Path to CSV file
const csvPath = path.join(__dirname, 'data.csv');
let csvData = [];

// Function to read CSV file
function readCSV() {
  try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.trim().split('\n');

    // Detect delimiter (comma or tab)
    const delimiter = lines[0].includes(',') ? ',' : '\t';

    // Get headers from first line
    const headers = lines[0].split(delimiter).map(h => h.trim());

    csvData = lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim());
      let obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || '');
      return obj;
    }).filter(d => d.EnrollmentNo); // remove empty rows

    console.log(`✅ CSV loaded: ${csvData.length} records`);
  } catch (err) {
    console.error('❌ Error reading CSV:', err);
  }
}

// Initial CSV load
readCSV();

// Create server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  // Serve API: Get all data
  if (req.url === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(csvData));
    return;
  }

  // API: Search by EnrollmentNo
  if (req.url.startsWith('/api/search/enrollment/') && req.method === 'GET') {
    const enrollmentNo = decodeURIComponent(req.url.replace('/api/search/enrollment/', ''));
    const result = csvData.find(d => d.EnrollmentNo.toLowerCase() === enrollmentNo.toLowerCase());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result || { error: 'Not found' }));
    return;
  }

  // API: Search by Name
  if (req.url.startsWith('/api/search/name/') && req.method === 'GET') {
    const name = decodeURIComponent(req.url.replace('/api/search/name/', ''));
    const results = csvData.filter(d => d.Name.toLowerCase().includes(name.toLowerCase()));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
    return;
  }

  // Serve static files (JS, CSS, images)
  const filePath = path.join(__dirname, req.url === '/' ? 'indexp.html' : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.cs
