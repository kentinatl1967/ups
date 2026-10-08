import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Skill: .claude/skills/scraping-data.md
// Run: npx playwright test scrape-ups --project=chromium
// Other AWB: AWB=12345678 npx playwright test scrape-ups --project=chromium
const awb = process.env.AWB || '44869075';

// Skill step 4: IATA Cargo-IMP FSA (Freight Status Answer) status codes by UPS status type.
// "Released" events are ignored, per the skill.
const FSA: Record<string, { code: string; description: string }> = {
  'Booked': { code: 'BKD', description: 'Booked' },
  'Received': { code: 'RCS', description: 'Received from shipper or agent' },
  'Departed': { code: 'DEP', description: 'Departed' },
  'Arrived': { code: 'ARR', description: 'Arrived' },
};
const fsaFor = (status: string) => FSA[status.replace(/\s*\*+$/, '')] ?? null;

// Flight# cell variants (flight code first, then optional date and two city codes):
//   "TRUCK 09/16/2026"                                   flight + date
//   "UPS104 09/19/2026 ANC - KIX"                        flight + date + origin - destination
//   "UPS104 ANC 09/17/2026 09:11 - KIX 09/18/2026 10:50" flight + origin/dest, each with date and time
//   "UPS064 SDF - ANC"                                   flight + origin - destination
const DT = String.raw`\d{2}/\d{2}/\d{4}(?:\s+\d{2}:\d{2})?`;
const FLIGHT_RE = new RegExp(
  String.raw`^(\S+)(?:\s+(${DT}))?(?:\s+([A-Z]{3})(?:\s+(${DT}))?\s+-\s+([A-Z]{3})(?:\s+(${DT}))?)?`
);
const parseFlight = (cell: string) => {
  const m = cell.match(FLIGHT_RE);
  return {
    flight: m?.[1] ?? null,
    flightDate: m?.[2] ?? null,
    origin: m?.[3] ?? null,
    destination: m?.[5] ?? null,
    originDateTime: m?.[4] ?? null,
    destinationDateTime: m?.[6] ?? null,
  };
};

const url = `https://www.aircargo.ups.com/en-US/Tracking?awbPrefix=406&awbNumber=${awb}`;

test(`scrape UPS tracking for AWB 406-${awb}`, async ({ page }) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Rows sit in the inactive "Tabular" tab, so wait for attached, not visible.
  const rows = page.locator('#TrackDataTable tbody tr');
  await rows.first().waitFor({ state: 'attached', timeout: 30000 });

  // Columns: Status | Station | Flight# | Pieces | Event Date/Time
  const cells: string[][] = await rows.evaluateAll(trs =>
    trs.map(tr => [...tr.querySelectorAll('td')].map(td => (td.textContent || '').replace(/\s+/g, ' ').trim()))
  );

  const events = cells
    .filter(c => c.length >= 5 && c[0] !== 'Released')
    .map(c => ({
      status: c[0],
      fsaCode: fsaFor(c[0])?.code ?? null,
      fsaDescription: fsaFor(c[0])?.description ?? null,
      ...parseFlight(c[2] || ''),
      pieces: /^\d+$/.test(c[3]) ? parseInt(c[3], 10) : c[3],
      eventDateTime: c[4],
    }));
    
  expect(events.length).toBeGreaterThan(0);

  const outDir = path.join(__dirname, '..', 'test');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `406-${awb}.json`), JSON.stringify(events, null, 2), 'utf-8');
});
