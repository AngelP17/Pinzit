import { chromium } from 'playwright';
import { preview } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function main() {
  const previewServer = await preview({
    root,
    base: './',
    preview: { port: 4173, strictPort: true },
  });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  try {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 01 — Landing hero
    await page.screenshot({
      path: path.join(root, '.snapshots', '01-landing-hero.png'),
      fullPage: false,
    });
    console.log('01-landing-hero.png saved');

    // 02 — Landing manifest (bento) — scroll into view
    await page.evaluate(() => {
      const el = document.getElementById('architecture');
      el?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(900);
    await page.screenshot({
      path: path.join(root, '.snapshots', '02-landing-manifest.png'),
      fullPage: false,
    });
    console.log('02-landing-manifest.png saved');

    // Back to top, then click Launch Control Room (primary hero CTA)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);

    const btn = page.locator('button:has-text("Launch Control Room")').first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
    await page.waitForTimeout(3500); // let toasts auto-dismiss
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(400);

    // 03 — Control room overview
    await page.screenshot({
      path: path.join(root, '.snapshots', '03-control-room-overview.png'),
      fullPage: false,
    });
    console.log('03-control-room-overview.png saved');

    // 04 — Findings
    await page.click('nav button:has-text("Findings")');
    await page.waitForTimeout(2800);
    await page.screenshot({
      path: path.join(root, '.snapshots', '04-control-room-findings.png'),
      fullPage: false,
    });
    console.log('04-control-room-findings.png saved');

    // 05 — Evidence
    await page.click('nav button:has-text("Evidence")');
    await page.waitForTimeout(2800);
    await page.screenshot({
      path: path.join(root, '.snapshots', '05-control-room-evidence.png'),
      fullPage: false,
    });
    console.log('05-control-room-evidence.png saved');

    // 06 — Timeline
    await page.click('nav button:has-text("Timeline")');
    await page.waitForTimeout(2800);
    await page.screenshot({
      path: path.join(root, '.snapshots', '06-control-room-timeline.png'),
      fullPage: false,
    });
    console.log('06-control-room-timeline.png saved');

    // 07 — CI Gate
    await page.click('nav button:has-text("CI Gate")');
    await page.waitForTimeout(2800);
    await page.screenshot({
      path: path.join(root, '.snapshots', '07-control-room-ci-gate.png'),
      fullPage: false,
    });
    console.log('07-control-room-ci-gate.png saved');
  } catch (e) {
    console.error(e);
    await page.screenshot({
      path: path.join(root, '.snapshots', 'debug-error.png'),
      fullPage: false,
    });
    process.exitCode = 1;
  } finally {
    await browser.close();
    await previewServer.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
