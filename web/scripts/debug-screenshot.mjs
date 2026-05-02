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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  try {
    await page.goto('http://localhost:4173');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(root, '.snapshots', 'debug-initial.png'), fullPage: false });
    console.log('Initial screenshot saved');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
    await previewServer.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
