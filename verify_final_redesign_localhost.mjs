import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5176 ...');
  await page.goto('http://localhost:5176/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Dismiss Cosmos Intro if present
  try {
    const enterBtn = page.locator('#enterBtn');
    if (await enterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Dismissing Cosmos Intro with #enterBtn...');
      await enterBtn.click();
      await page.waitForTimeout(1200);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }
  } catch (e) {
    console.log('No intro overlay detected');
  }

  // Wait for the redesigned hero heading
  await page.waitForSelector('.hero-redesign-wrapper', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // 1. Verify floating guestbook button count (should be EXACTLY 1 now!)
  const guestbookButtons = page.locator('button[aria-label="Open Guestbook"], #floating-guestbook-trigger, button:has(svg.lucide-feather)');
  const guestbookCount = await guestbookButtons.count();
  console.log('Floating Guestbook / Poetic Note count:', guestbookCount);

  // 2. Measure top gap between header bottom and hero heading
  const navBox = await page.locator('.di-header-root, nav').first().boundingBox();
  const heroHeadingBox = await page.locator('.hero-redesign-wrapper h1').first().boundingBox();
  if (navBox && heroHeadingBox) {
    const gap = heroHeadingBox.y - (navBox.y + navBox.height);
    console.log(`Gap between header bottom and Hero Heading: ${Math.round(gap)}px`);
  }

  // 3. Take desktop screenshot of Hero with Emerald Green Background
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/redesign_emerald_hero.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  // 4. Scroll to Vault & take screenshot
  await page.locator('#curated-works-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/redesign_emerald_vault.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  // 5. Scroll to Poetry & Music sections & take screenshot
  await page.locator('#poetry').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/redesign_emerald_poetry_music.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  await browser.close();
  console.log('Emerald theme verification complete!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
