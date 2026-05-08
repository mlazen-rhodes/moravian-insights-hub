import { writeFileSync } from 'fs';

// Published Google Sheet CSV URL
// Format: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=SHEET_GID
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1wnmP2DPHUqDe7yspCoXQ88e9JZlK-U7D0BOVy9xH9HM/export?format=csv&gid=871697953';

async function fetchSalesforceData() {
  const response = await fetch(SHEET_URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  const rows = parseCSV(csv);
  
  const output = {
    fetchedAt: new Date().toISOString(),
    rows,
  };

  writeFileSync('data/salesforce.json', JSON.stringify(output, null, 2));
  console.log(`Salesforce data written to data/salesforce.json (${rows.length} rows)`);
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) ?? [];
    const row = {};
    headers.forEach((header, i) => {
      row[header] = (values[i] ?? '').trim().replace(/"/g, '');
    });
    return row;
  });
}

fetchSalesforceData().catch(console.error);
