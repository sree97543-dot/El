<script>
let data = [];

// Load CSV file dynamically (client-side)
async function loadData() {
  try {
    const response = await fetch('data.csv'); // CSV is in same folder
    if (!response.ok) throw new Error('Cannot fetch CSV file');

    const csvText = await response.text();
    const rows = csvText.trim().split('\n');
    const headers = rows.shift().split(',');

    data = rows.map(row => {
      const values = row.split(',');
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = values[i].trim());
      return obj;
    });

    console.log(`✅ CSV loaded: ${data.length} records`);
  } catch (err) {
    console.error('Error loading CSV:', err);
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.textContent = '⚠️ Could not load data. Make sure data.csv is in the same folder as index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  changeSearchMode('EnrollmentNo');
  loadData();
});
</script>
