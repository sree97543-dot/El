<script>
let data = [];

async function loadData() {
  try {
    const response = await fetch('data.csv'); // relative path
    if (!response.ok) throw new Error('CSV not found');

    const csvText = await response.text();
    data = parseCSV(csvText);

    console.log(`✅ CSV loaded: ${data.length} records`);
  } catch (err) {
    console.error(err);
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.textContent = '⚠️ Unable to load CSV file.';
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  changeSearchMode('EnrollmentNo');
  loadData();
});
</script>
