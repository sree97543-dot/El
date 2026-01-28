<script>
let data = [];

// Build correct CSV path for GitHub Pages
function getCSVPath() {
  const base = window.location.pathname.replace(/\/[^\/]*$/, '/');
  return base + 'data.csv';
}

async function loadData() {
  try {
    const csvPath = getCSVPath();
    const response = await fetch(csvPath, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`CSV not found at ${csvPath}`);
    }

    const csvText = await response.text();
    data = parseCSV(csvText);

    console.log(`✅ CSV loaded: ${data.length} records`);
  } catch (err) {
    console.error('CSV load error:', err);
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.textContent = '⚠️ CSV file could not be loaded. Check file name and path.';
  }
}

// Simple CSV parser (handles quoted commas)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCSVLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    let obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || '').trim();
    });
    return obj;
  });
}

// Handles commas inside quotes
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' ) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

document.addEventListener('DOMContentLoaded', () => {
  changeSearchMode('EnrollmentNo');
  loadData();
});
</script>
