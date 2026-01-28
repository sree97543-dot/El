const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors());

app.get('/api/data', (req, res) => {
  fs.readFile('data.csv', 'utf8', (err, csvText) => {
    if(err) return res.status(500).send('Error reading CSV');
    const rows = csvText.trim().split('\n');
    const headers = rows.shift().split(',');
    const data = rows.map(row => {
      const values = row.split(',');
      let obj = {};
      headers.forEach((h,i) => obj[h.trim()] = values[i].trim());
      return obj;
    });
    res.json(data);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
