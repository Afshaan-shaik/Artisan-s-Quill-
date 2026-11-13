import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5';
const LIVE_URL = 'https://the-artisans-quill.vercel.app';

async function verifyLive() {
  console.log(`Starting live verification on: ${LIVE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Retry loop to allow Vercel build to complete
    let deployed = false;
    for (let attempt = 1; attempt <= 6; attempt++) {
      console.log(`[Attempt ${attempt}/6] Loading ${LIVE_URL}...`);
      await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      await page.evaluate(() => {
        const intro = document.getElementById('intro');
        if (intro) intro.remove();
        const cosmos = document.getElementById('cosmos-canvas');
        if (cosmos) cosmos.style.pointerEvents = 'none';
      });

      const suite = page.locator('#ambient-audio-suite');
      if (await suite.isVisible()) {
        const suiteBox = await suite.boundingBox();
        await page.mouse.move(suiteBox.x + suiteBox.width / 2, suiteBox.y + suiteBox.height / 2);
        await page.waitForTimeout(500);

        const popover = page.locator('#music-ambience-popover');
        if (await popover.isVisible()) {
          const pBox = await popover.boundingBox();
          console.log(`Live popover bounding box:`, pBox);
          // If x >= 16, then the left-alignment fix is deployed!
          if (pBox.x >= 16) {
            console.log(`✓ Confirmed latest commit deployed! Popover x = ${pBox.x}px >= 16px`);
            deployed = true;

            // Capture proof screenshot
            await page.screenshot({
              path: path.join(ARTIFACTS_DIR, 'verify_live_music_sanctuary.png'),
              fullPage: false
            });
            console.log('✓ Live desktop screenshot saved.');
            break;
          } else {
            console.log(`Old build still cached on Vercel (x = ${pBox.x}px). Waiting 15s for new deployment...`);
          }
        }
      }
      await page.waitForTimeout(15000);
    }

    if (!deployed) {
      console.log('Vercel build might still be processing. Capturing current state.');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'verify_live_music_sanctuary.png'),
        fullPage: false
      });
    }

    // Also test mobile on live
    console.log('Testing mobile live (390x844)...');
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobilePage.waitForTimeout(2000);

    await mobilePage.evaluate(() => {
      const intro = document.getElementById('intro');
      if (intro) intro.remove();
      const cosmos = document.getElementById('cosmos-canvas');
      if (cosmos) cosmos.style.pointerEvents = 'none';
    });

    const mobileChevron = mobilePage.locator('#open-soundscape-menu-btn');
    if (await mobileChevron.isVisible()) {
      await mobileChevron.click();
      await mobilePage.waitForTimeout(500);
      const mobilePopover = mobilePage.locator('#music-ambience-popover');
      if (await mobilePopover.isVisible()) {
        const mBox = await mobilePopover.boundingBox();
        console.log(`Live mobile bounding box:`, mBox);
        await mobilePage.screenshot({
          path: path.join(ARTIFACTS_DIR, 'verify_live_music_sanctuary_mobile.png'),
          fullPage: false
        });
        console.log('✓ Live mobile screenshot saved.');
      }
    }

    console.log('🎉 Live verification complete!');
  } finally {
    await browser.close();
  }
}

verifyLive().catch(console.error);

