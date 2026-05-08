import { google } from 'googleapis';
import { writeFileSync } from 'fs';

const siteUrl = 'sc-domain:moravian.edu';

async function fetchSearchConsoleData() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Overall performance
  const [overallResponse, pagesResponse, keywordsResponse] = await Promise.all([

    // By date
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 90,
      },
    }),

    // By page
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 20,
        orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    }),

    // By keyword
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 50,
        orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
      },
    }),
  ]);

  const output = {
    fetchedAt: new Date().toISOString(),
    startDate,
    endDate,
    byDate: overallResponse.data.rows ?? [],
    byPage: pagesResponse.data.rows ?? [],
    byKeyword: keywordsResponse.data.rows ?? [],
  };

  writeFileSync('data/search-console.json', JSON.stringify(output, null, 2));
  console.log('Search Console data written to data/search-console.json');
}

fetchSearchConsoleData().catch(console.error);
