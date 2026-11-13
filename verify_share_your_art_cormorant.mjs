import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Testing http://localhost:5176...');
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

  // Capture hero section showing "Share your art , get connected" in Cormorant golden gradient
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_cormorant_share_your_art.png'
  });
  console.log('Captured verify_cormorant_share_your_art.png');

  await browser.close();
})();

