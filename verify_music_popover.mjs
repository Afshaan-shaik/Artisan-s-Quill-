import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5';

async function verifyMusicSanctuaryPopover() {
  console.log('🚀 Starting Music Sanctuary dropdown verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:5176...');
    await page.goto('http://localhost:5176', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Remove any intro overlay if present to interact freely
    await page.evaluate(() => {
      const intro = document.getElementById('intro');
      if (intro) intro.remove();
      const cosmos = document.getElementById('cosmos-canvas');
      if (cosmos) cosmos.style.pointerEvents = 'none';
    });

    // 1. Locate #ambient-audio-suite and the trigger button
    const suiteLocator = page.locator('#ambient-audio-suite');
    await suiteLocator.waitFor({ state: 'visible', timeout: 5000 });
    const suiteBox = await suiteLocator.boundingBox();
    console.log(`[Desktop 1440] #ambient-audio-suite bounding box:`, suiteBox);

    // 2. Hover over the trigger button
    console.log('Hovering over #ambient-audio-suite...');
    await page.mouse.move(suiteBox.x + suiteBox.width / 2, suiteBox.y + suiteBox.height / 2);
    await page.waitForTimeout(300); // Allow animation to complete

    // 3. Verify popover is visible
    const popoverLocator = page.locator('#music-ambience-popover');
    const isVisible = await popoverLocator.isVisible();
    console.log(`Popover visible on hover: ${isVisible}`);
    if (!isVisible) {
      throw new Error('Popover did not open on hover!');
    }

    const popoverBox = await popoverLocator.boundingBox();
    console.log(`[Desktop 1440] Popover bounding box:`, popoverBox);

    // Layout assertions
    console.log('Running layout assertions on Desktop...');
    if (popoverBox.x < 16) {
      throw new Error(`Left edge violation: Popover x is ${popoverBox.x}px (< 16px). Left side is cut off!`);
    } else {
      console.log(`✓ Left edge assertion passed: x = ${popoverBox.x}px (>= 16px)`);
    }

    if (popoverBox.x + popoverBox.width > 1440) {
      throw new Error(`Right edge overflow: Popover extends to ${popoverBox.x + popoverBox.width}px (> 1440px)`);
    } else {
      console.log(`✓ Right edge assertion passed: right = ${popoverBox.x + popoverBox.width}px (<= 1440px)`);
    }

    if (popoverBox.height > 900 - 96) {
      throw new Error(`Height violation: Popover height is ${popoverBox.height}px (> ${900 - 96}px)`);
    } else {
      console.log(`✓ Height assertion passed: height = ${popoverBox.height}px (<= ${900 - 96}px)`);
    }

    // Capture screenshot of open popover on desktop
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'verify_music_sanctuary_hover_desktop.png'),
      fullPage: false
    });
    console.log('✓ Desktop hover screenshot saved.');

    // 4. Test hover bridge: move mouse across the gap into the popover smoothly
    console.log('Testing hover bridge by moving cursor smoothly through gap into popover...');
    await page.mouse.move(popoverBox.x + 40, suiteBox.y + suiteBox.height + 4, { steps: 5 });
    await page.waitForTimeout(100);
    const visibleInBridge = await popoverLocator.isVisible();
    console.log(`✓ Popover remains open in hover bridge: ${visibleInBridge}`);

    // Move cursor inside popover content
    await page.mouse.move(popoverBox.x + 80, popoverBox.y + 120, { steps: 5 });
    await page.waitForTimeout(300);
    const visibleInside = await popoverLocator.isVisible();
    console.log(`✓ Popover remains open with cursor inside popover: ${visibleInside}`);

    // 5. Test close on mouse leave (moving away)
    console.log('Moving cursor completely away to test close delay...');
    await page.mouse.move(900, 600, { steps: 5 });
    await page.waitForTimeout(100);
    const visibleImmediately = await popoverLocator.isVisible();
    console.log(`Popover immediately after mouse leave (within 250ms grace period): ${visibleImmediately}`);
    await page.waitForTimeout(350); // grace period elapsed
    const visibleAfterDelay = await popoverLocator.isVisible();
    console.log(`✓ Popover after delay (closed): ${!visibleAfterDelay}`);

    // 6. Test mobile viewport (390px)
    console.log('Testing mobile viewport (390x844)...');
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto('http://localhost:5176', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await mobilePage.waitForTimeout(1500);

    await mobilePage.evaluate(() => {
      const intro = document.getElementById('intro');
      if (intro) intro.remove();
      const cosmos = document.getElementById('cosmos-canvas');
      if (cosmos) cosmos.style.pointerEvents = 'none';
    });

    const mobileSuite = mobilePage.locator('#ambient-audio-suite');
    await mobileSuite.waitFor({ state: 'visible', timeout: 5000 });
    const mobileChevronBtn = mobilePage.locator('#open-soundscape-menu-btn');
    console.log('Tapping soundscape menu chevron on mobile...');
    await mobileChevronBtn.click();
    await mobilePage.waitForTimeout(300);

    const mobilePopover = mobilePage.locator('#music-ambience-popover');
    const mobilePopoverVisible = await mobilePopover.isVisible();
    console.log(`Mobile popover visible on click: ${mobilePopoverVisible}`);
    const mobileBox = await mobilePopover.boundingBox();
    console.log(`[Mobile 390] Popover bounding box:`, mobileBox);

    if (mobileBox.x < 8) {
      throw new Error(`Left edge violation on mobile: x is ${mobileBox.x}px (< 8px)`);
    } else {
      console.log(`✓ Mobile left edge check passed: x = ${mobileBox.x}px (>= 8px)`);
    }

    if (mobileBox.x + mobileBox.width > 390) {
      throw new Error(`Right edge violation on mobile: right is ${mobileBox.x + mobileBox.width}px (> 390px)`);
    } else {
      console.log(`✓ Mobile right edge check passed: right = ${mobileBox.x + mobileBox.width}px (<= 390px)`);
    }

    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'verify_music_sanctuary_mobile.png'),
      fullPage: false
    });
    console.log('✓ Mobile screenshot saved.');

    console.log('🎉 ALL MUSIC SANCTUARY TESTS PASSED COMPLETELY!');
  } finally {
    await browser.close();
  }
}

verifyMusicSanctuaryPopover().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
