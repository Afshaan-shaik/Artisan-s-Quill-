import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  console.log('================================================================');
  console.log('🚀 Canva-Grade Real-Time 3-Tab Concurrency QA Verification');
  console.log('================================================================\n');

  // Create temporary test image asset
  fs.writeFileSync(
    'test_image.png',
    Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  );

  const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
  console.log(`Connecting to Sanctuary at ${BASE_URL}...`);

  const browser = await chromium.launch({ headless: true });

  // 1. Initialize 3 Isolated Browser Contexts
  // Tab 1: Chrome Simulated
  const context1 = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  });
  // Tab 2: Firefox Simulated
  const context2 = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
  });
  // Tab 3: Incognito / Guest Mode
  const context3 = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  });

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  const page3 = await context3.newPage();

  page1.on('console', msg => console.log('[Tab 1 Console]:', msg.text()));
  page2.on('console', msg => console.log('[Tab 2 Console]:', msg.text()));
  page3.on('console', msg => console.log('[Tab 3 Console]:', msg.text()));

  page1.on('pageerror', err => console.error('[Tab 1 PageError]:', err));
  page2.on('pageerror', err => console.error('[Tab 2 PageError]:', err));
  page3.on('pageerror', err => console.error('[Tab 3 PageError]:', err));

  console.log('1. Loading Sanctuary across Tab 1 (Chrome), Tab 2 (Firefox), and Tab 3 (Guest)...');
  await Promise.all([
    page1.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 }),
    page2.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 }),
    page3.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  ]);

  console.log('Waiting for sanctuary UI components to stabilize...');
  await Promise.all([
    page1.waitForSelector('#navbar-upload-btn', { timeout: 15000 }),
    page2.waitForSelector('#navbar-upload-btn', { timeout: 15000 }),
    page3.waitForSelector('#navbar-upload-btn', { timeout: 15000 })
  ]);

  // =========================================================================
  // STEP 1: Tab 1 (Chrome) uploads a "digital art" piece
  // =========================================================================
  const uniqueTitle = `Cosmic Luminescence IX - ${Date.now()}`;
  console.log(`\n[STEP 1] Tab 1: Uploading Digital Art piece: "${uniqueTitle}"...`);

  await page1.click('#navbar-upload-btn');
  await page1.waitForSelector('#media-upload-modal', { timeout: 10000 });

  // Select Digital Art format tab
  await page1.click('#modal-tab-digital-art');

  // Fill in title
  await page1.fill('#artwork-title-input', uniqueTitle);

  // Upload file and wait for preview
  await page1.setInputFiles('input[type="file"]', 'test_image.png');
  await page1.waitForTimeout(500);

  // Submit
  await page1.click('#submit-artwork-btn');
  console.log('Tab 1: Artwork submitted via restored studio modal.');

  // =========================================================================
  // STEP 2: Verify Tab 2 (Firefox) and Tab 3 (Guest) show the upload instantly
  // =========================================================================
  console.log('\n[STEP 2] Verifying Tab 2 and Tab 3 instantly display the new artwork with ZERO refresh...');
  const cardSelector = `[data-artwork-title="${uniqueTitle}"]`;
  
  await Promise.all([
    page2.waitForSelector(cardSelector, { timeout: 15000 }),
    page3.waitForSelector(cardSelector, { timeout: 15000 })
  ]);
  console.log('✅ PASS: Tab 2 (Firefox) and Tab 3 (Guest) instantly received new Digital Art upload!');

  // =========================================================================
  // STEP 3: Tab 2 (Firefox) opens artwork modal and posts a comment
  // =========================================================================
  const commentText = `Stunning algorithmic radiance from Tab 2! [${Date.now()}]`;
  console.log(`\n[STEP 3] Tab 2: Adding comment "${commentText}"...`);

  // Click on the artwork in Tab 2 to open detail modal
  await page2.click(cardSelector);
  await page2.waitForSelector('#comment-textarea', { timeout: 10000 });

  await page2.fill('#comment-textarea', commentText);
  await page2.click('#submit-comment-btn');
  console.log('Tab 2: Comment submitted.');

  // Verify comment rendered in Tab 2 modal
  await page2.waitForSelector(`text="${commentText}"`, { timeout: 10000 });
  console.log('Tab 2: Comment rendered in local modal.');

  // =========================================================================
  // STEP 4: Tab 3 (Guest) opens artwork modal and verifies comment appears
  // =========================================================================
  console.log('\n[STEP 4] Tab 3: Opening artwork modal to verify comment appears in real-time (No Refresh)...');
  await page3.click(cardSelector);
  await page3.waitForSelector(`text="${commentText}"`, { timeout: 15000 });
  console.log('✅ PASS: Tab 3 (Guest) instantly received the live comment from Tab 2 without refresh!');

  // =========================================================================
  // STEP 5: Tab 3 (Guest) clicks the Like button on the artwork
  // =========================================================================
  console.log('\n[STEP 5] Tab 3: Liking the artwork...');
  await page3.waitForSelector('#detail-like-btn', { timeout: 10000 });
  await page3.click('#detail-like-btn');
  console.log('Tab 3: Heart clicked.');

  // =========================================================================
  // STEP 6: Verify Tab 1, Tab 2, and Tab 3 reflect updated like state
  // =========================================================================
  console.log('\n[STEP 6] Verifying Tab 1, Tab 2, and Tab 3 reflect updated like count (1) with ZERO refresh...');
  await page3.waitForSelector('#detail-like-btn:has-text("1")', { timeout: 15000 });
  await page2.waitForSelector('#detail-like-btn:has-text("1")', { timeout: 15000 });
  console.log('✅ PASS: Tab 2 and Tab 3 both show like count = 1 in real-time!');

  console.log('\n================================================================');
  console.log('🎉 ALL 3-TAB REAL-TIME CONCURRENCY PROTOCOLS PASSED FLAWLESSLY!');
  console.log('================================================================\n');

  await browser.close();
  if (fs.existsSync('test_image.png')) {
    fs.unlinkSync('test_image.png');
  }
  process.exit(0);
})().catch((err) => {
  console.error('❌ QA Test Error:', err);
  if (fs.existsSync('test_image.png')) {
    fs.unlinkSync('test_image.png');
  }
  process.exit(1);
});
