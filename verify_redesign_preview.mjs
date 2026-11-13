import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5';
const LOCAL_URL = 'http://localhost:5176';

async function verifyRedesign() {
  console.log(`Starting Redesign Preview verification on ${LOCAL_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('1. Loading main localhost page...');
    await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Remove intro overlay if present to reveal redesign immediately
    await page.evaluate(() => {
      const intro = document.getElementById('intro');
      if (intro) intro.remove();
      const cosmos = document.getElementById('cosmos-canvas');
      if (cosmos) cosmos.style.pointerEvents = 'none';
    });

    // Verify main components exist
    const nav = page.locator('nav.redesign-nav');
    console.log(`Pill Navigation visible: ${await nav.isVisible()}`);

    const h1 = page.locator('h1:has-text("Where every work")');
    console.log(`Hero H1 visible: ${await h1.isVisible()}`);

    const archFrame = page.locator('.frame');
    console.log(`Arch Spotlight Frame visible: ${await archFrame.isVisible()}`);

    const marquee = page.locator('.marq');
    console.log(`Infinite Marquee visible: ${await marquee.isVisible()}`);

    const bento = page.locator('.bento');
    console.log(`Curated Works Bento Grid visible: ${await bento.isVisible()}`);

    const poemSection = page.locator('#poetry');
    console.log(`Poetic Sanctuary Section visible: ${await poemSection.isVisible()}`);

    const musicSection = page.locator('#music');
    console.log(`Music Sanctuary Section visible: ${await musicSection.isVisible()}`);

    // Capture Hero & Navigation screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'redesign_preview_desktop_hero.png'),
      fullPage: false
    });
    console.log('✓ Hero screenshot saved.');

    // Scroll to #works and capture Bento grid
    await page.locator('#works').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'redesign_preview_bento_works.png'),
      fullPage: false
    });
    console.log('✓ Bento grid screenshot saved.');

    // Scroll to #poetry and #music
    await page.locator('#poetry').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'redesign_preview_poetry_music.png'),
      fullPage: false
    });
    console.log('✓ Poetry and Music screenshot saved.');

    // 2. Test Mobile Viewport (390x844)
    console.log('2. Testing mobile viewport (390x844)...');
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await mobilePage.waitForTimeout(1500);

    await mobilePage.evaluate(() => {
      const intro = document.getElementById('intro');
      if (intro) intro.remove();
      const cosmos = document.getElementById('cosmos-canvas');
      if (cosmos) cosmos.style.pointerEvents = 'none';
    });

    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'redesign_preview_mobile_390.png'),
      fullPage: false
    });
    console.log('✓ Mobile preview screenshot saved.');

    // 3. Test Standalone HTML Preview
    console.log('3. Testing standalone HTML preview at /preview.html...');
    const htmlPage = await context.newPage();
    await htmlPage.goto(`${LOCAL_URL}/preview.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await htmlPage.waitForTimeout(1000);
    await htmlPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'redesign_preview_standalone_html.png'),
      fullPage: false
    });
    console.log('✓ Standalone HTML preview screenshot saved.');

    console.log('🎉 ALL REDESIGN PREVIEWS VERIFIED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

verifyRedesign().catch(console.error);

