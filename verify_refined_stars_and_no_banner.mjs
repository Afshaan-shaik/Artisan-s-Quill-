import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5176...');
  await page.goto('http://localhost:5176', { waitUntil: 'domcontentloaded' });

  // 1. Capture pristine refined stars intro during flight (delicate pinpoints, zero clumsy blobs)
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_refined_stars_intro.png'
  });
  console.log('Captured verify_refined_stars_intro.png');

  // Dismiss intro
  const skipBtn = page.locator('#skipBtn');
  const enterBtn = page.locator('#enterBtn');
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  } else if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }

  await page.waitForTimeout(1000);

  // 2. Scroll down to show Marquee Ribbon and Curated Works with the tabular banner removed
  await page.evaluate(() => {
    const el = document.getElementById('curated-works-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600);

  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_curated_works_no_banner.png'
  });
  console.log('Captured verify_curated_works_no_banner.png');

  await browser.close();
  console.log('Done!');
})();

