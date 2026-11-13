import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5176 ...');
  await page.goto('http://localhost:5176', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // If cosmos intro overlay is up, click Enter
  try {
    const enterBtn = await page.$('#enterBtn, button:has-text("Enter the Atelier")');
    if (enterBtn && await enterBtn.isVisible()) {
      await enterBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {}

  // Close island menu if open by pressing Escape or clicking background
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 1. Open artwork modal via JavaScript click
  console.log('Opening artwork modal...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('VIEW MASTERPIECE') || b.textContent?.includes('TODAY\'S SPOTLIGHT'));
    if (btn) {
      btn.click();
    } else {
      const card = document.querySelector('[id^="artwork-card-"], .card-chromatic');
      if (card) card.click();
    }
  });
  await page.waitForTimeout(2000);

  // Find a Photo (Digital) artwork modal
  console.log('Navigating to Photo artwork...');
  for (let i = 0; i < 20; i++) {
    const isPhoto = await page.locator('#artwork-detail-modal span:has-text("PHOTO"), #artwork-detail-modal span:has-text("DIGITAL")').count();
    if (isPhoto > 0) {
      console.log('Found Photo modal at step', i);
      break;
    }
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
  }

  // Scroll to Photo Contemplations
  const rightCol = page.locator('#artwork-detail-modal .overflow-y-auto').last();
  if (await rightCol.isVisible()) {
    await rightCol.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_photo_contemplations_expanded.png' });
  console.log('Saved verify_photo_contemplations_expanded.png');

  // Test Photo Fullscreen Zoom (press 'Z')
  console.log('Testing Photo fullscreen zoom (Z)...');
  await page.keyboard.press('z');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_photo_fullscreen_zoom.png' });
  console.log('Saved verify_photo_fullscreen_zoom.png');

  // Exit fullscreen zoom (press 'Escape')
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // Navigate to find Motion Loop (Video)
  console.log('Navigating to Motion Loop (Video)...');
  for (let i = 0; i < 20; i++) {
    const isVideo = await page.locator('#artwork-detail-modal span:has-text("VIDEO")').count();
    if (isVideo > 0) {
      console.log('Found Video modal at step', i);
      break;
    }
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
  }

  // Scroll to video contemplations
  if (await rightCol.isVisible()) {
    await rightCol.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_video_contemplations_expanded.png' });
  console.log('Saved verify_video_contemplations_expanded.png');

  // Test Fullscreen Video (press 'F')
  console.log('Testing Video fullscreen theater (F)...');
  await page.keyboard.press('f');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_video_fullscreen_theater.png' });
  console.log('Saved verify_video_fullscreen_theater.png');

  // Exit fullscreen video
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // Navigate to find Music track
  console.log('Navigating to Music track...');
  for (let i = 0; i < 20; i++) {
    const isMusic = await page.locator('#artwork-detail-modal span:has-text("MUSIC")').count();
    if (isMusic > 0) {
      console.log('Found Music vinyl modal at step', i);
      break;
    }
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
  }

  // Scroll to music contemplations
  if (await rightCol.isVisible()) {
    await rightCol.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_music_contemplations_expanded.png' });
  console.log('Saved verify_music_contemplations_expanded.png');

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Scroll down to test bottom RedesignedMusicSection
  console.log('Testing bottom RedesignedMusicSection...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_bottom_music_section.png' });
  console.log('Saved verify_bottom_music_section.png');

  // Navigate to Original Music section by selecting music filter
  console.log('Testing Original Music Section hero...');
  await page.evaluate(() => {
    const item = document.querySelector('#island-item-original-music') || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Original music'));
    if (item) item.click();
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_original_music_section_hero.png' });
  console.log('Saved verify_original_music_section_hero.png');

  await browser.close();
  console.log('All verification checks completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
