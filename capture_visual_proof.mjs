import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const ARTIFACT_DIR = 'C:\\Users\\Afshaan\\.gemini\\antigravity-ide\\brain\\c08e42c4-6c2e-471a-a5df-dba635bf9fb1';
  console.log('Capturing high-resolution visual proof of restored UI and real-time gallery...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#navbar-upload-btn', { timeout: 15000 });

  // 1. Capture Gallery Homepage
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallery_hero_proof.png'), fullPage: false });
  console.log('Saved gallery_hero_proof.png');

  // 2. Open Upload Modal
  await page.click('#navbar-upload-btn');
  await page.waitForSelector('#media-upload-modal', { timeout: 10000 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'upload_modal_proof.png') });
  console.log('Saved upload_modal_proof.png');

  // 3. Click Poetry Card tab in modal
  await page.click('#modal-tab-poetry-card');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'poetry_card_studio_proof.png') });
  console.log('Saved poetry_card_studio_proof.png');

  // 4. Close Modal and Open Artwork Detail
  await page.click('#close-upload-modal');
  await page.waitForTimeout(400);
  const firstArtwork = page.locator('[id^="artwork-card-"]').first();
  await firstArtwork.click();
  await page.waitForSelector('#comment-textarea', { timeout: 10000 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'artwork_detail_modal_proof.png') });
  console.log('Saved artwork_detail_modal_proof.png');

  await browser.close();
  console.log('Visual proof capture completed successfully!');
})().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
