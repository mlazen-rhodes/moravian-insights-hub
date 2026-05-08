import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { writeFileSync } from 'fs';

const propertyId = 'REPLACE_WITH_YOUR_GA4_PROPERTY_ID';

const client = new BetaAnalyticsDataClient();

async function fetchGA4Data() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  // Sitewide traffic overview
  const [overviewResponse] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
    ],
    dimensions: [
      { name: 'date' },
    ],
  });

  // Traffic by source/medium
  const [sourceResponse] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'conversions' },
    ],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
  });

  // Top pages
  const [pagesResponse] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 20,
  });

  // Form conversions by page
  const [conversionsResponse] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'conversions' },
      { name: 'totalUsers' },
    ],
    dimensions: [
      { name: 'pagePath' },
      { name: 'eventName' },
    ],
  });

  const output = {
    fetchedAt: new Date().toISOString(),
    startDate,
    endDate,
    overview: formatReport(overviewResponse),
    bySource: formatReport(sourceResponse),
    topPages: formatReport(pagesResponse),
    conversions: formatReport(conversionsResponse),
  };

  writeFileSync('data/ga4.json', JSON.stringify(output, null, 2));
  console.log('GA4 data written to data/ga4.json');
}

function formatReport(response) {
  return response.rows?.map(row => {
    const obj = {};
    row.dimensionValues?.forEach((val, i) => {
      obj[response.dimensionHeaders[i].name] = val.value;
    });
    row.metricValues?.forEach((val, i) => {
      obj[response.metricHeaders[i].name] = val.value;
    });
    return obj;
  }) ?? [];
}

fetchGA4Data().catch(console.error);
