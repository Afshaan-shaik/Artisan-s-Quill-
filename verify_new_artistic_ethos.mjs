import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5176...');
  await page.goto('http://localhost:5176', { waitUntil: 'domcontentloaded' });

  // Dismiss intro immediately
  const skipBtn = page.locator('#skipBtn');
  const enterBtn = page.locator('#enterBtn');
  try {
    await page.waitForSelector('#skipBtn', { timeout: 3000 });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }
  } catch (e) {
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
    }
  }

  await page.waitForTimeout(1200);

  // Capture hero section showing the new artistic description
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_hero_artistic_ethos_description.png'
  });
  console.log('Captured verify_hero_artistic_ethos_description.png');

  await browser.close();
  console.log('Verification done!');
})();

