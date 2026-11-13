import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5176...');
  await page.goto('http://localhost:5176', { waitUntil: 'domcontentloaded' });

  // 1. Capture Living Constellation Intro at 1s (showing all star dots visible and camera in flight)
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_intro_dots_slow_flight.png'
  });
  console.log('Captured verify_intro_dots_slow_flight.png');

  // 2. Capture Constellation at 3.5s (showing slow loading nodes and lines weaving in)
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_intro_constellation_weaving.png'
  });
  console.log('Captured verify_intro_constellation_weaving.png');

  // Click Enter or Skip to reach the main gallery
  const enterBtn = page.locator('#enterBtn');
  const skipBtn = page.locator('#skipBtn');
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  } else if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }

  await page.waitForTimeout(1000);

  // 3. Capture Hero Section with the golden highlighted sentence
  await page.screenshot({
    path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_hero_golden_highlighted_sentence.png'
  });
  console.log('Captured verify_hero_golden_highlighted_sentence.png');

  await browser.close();
  console.log('Verification complete!');
})();

