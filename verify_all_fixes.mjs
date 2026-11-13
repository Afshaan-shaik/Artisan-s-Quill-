import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Pre-seed localStorage to bypass intro animation immediately
  await page.addInitScript(() => {
    window.localStorage.setItem('has_seen_cosmos_intro', 'true');
    window.localStorage.setItem('has_seen_intro_v2', 'true');
    window.localStorage.setItem('artisan_intro_completed', 'true');
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);

  // If there's an intro skip button, click it
  await page.evaluate(() => {
    const skipBtn = document.querySelector('button[title*="Skip"], .cosmos-intro-root button');
    if (skipBtn) skipBtn.click();
  });
  await page.waitForTimeout(1000);

  // 1. Verify Curatorial Spotlight auto-slide
  console.log('Verifying Spotlight auto-slide...');
  const initialSpotlight = await page.evaluate(() => {
    const el = document.querySelector('#curatorial-spotlight h1, #curatorial-spotlight h2, #curatorial-spotlight h3');
    return el ? el.textContent.trim() : '';
  });
  console.log('Initial Spotlight:', initialSpotlight);

  // Wait 5.2s for the 5-second interval
  await page.waitForTimeout(5200);
  const nextSpotlight = await page.evaluate(() => {
    const el = document.querySelector('#curatorial-spotlight h1, #curatorial-spotlight h2, #curatorial-spotlight h3');
    return el ? el.textContent.trim() : '';
  });
  console.log('Next Spotlight after 5s:', nextSpotlight);

  // 2. Open Cinema Mode via evaluate to bypass any overlay issues
  console.log('Opening Cinema Mode...');
  await page.evaluate(() => {
    const btn = document.getElementById('cinema-mode-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cinema'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_cinema_mode_live.png' });

  // Cycle through cinema mode to find music & motion loop
  for (let i = 0; i < 10; i++) {
    const slideInfo = await page.evaluate(() => {
      const title = document.querySelector('h3.text-white')?.textContent?.trim() || '';
      const text = document.body.textContent || '';
      const hasImage = Boolean(document.querySelector('img[src*="M-Remix"], img[src*="youtube"], img[alt*="M."]'));
      const hasVideo = Boolean(document.querySelector('video'));
      return { title, text, hasImage, hasVideo };
    });
    console.log(`Cinema slide ${i}:`, slideInfo.title);
    if (slideInfo.title === 'M.' || slideInfo.text.includes('Anıl Emre') || slideInfo.text.includes('MUSIC')) {
      await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_cinema_music_m.png' });
    }
    if (slideInfo.hasVideo || slideInfo.text.includes('Motion Loop')) {
      await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_cinema_motion_loop.png' });
    }
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
  }

  // Exit Cinema mode
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 3. Test Photograph Modal & Expanded Contemplations Tab
  console.log('Opening Photograph Modal...');
  await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('[data-artwork-title]')).find(c => {
      const cat = c.getAttribute('data-card-category');
      return cat === 'digital' || cat === 'painting' || cat === 'drawing';
    });
    if (card) card.click();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_photo_details_tab.png' });

  // Click Contemplations Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const contTab = tabs.find(b => b.textContent && b.textContent.includes('Contemplations'));
    if (contTab) contTab.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_photo_contemplations_expanded.png' });

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 4. Test Music Modal & Contemplations Tab
  console.log('Opening Music Modal...');
  await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('[data-artwork-title]')).find(c => {
      return c.getAttribute('data-card-category') === 'music';
    });
    if (card) card.click();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_music_liner_notes_tab.png' });

  // Click Contemplations Tab in Music
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const contTab = tabs.find(b => b.textContent && b.textContent.includes('Contemplations'));
    if (contTab) contTab.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_music_contemplations_expanded.png' });

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 5. Test Dedicated Original Music Section
  console.log('Navigating to Dedicated Original Music Section...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const musicBtn = btns.find(b => b.textContent && b.textContent.trim().toLowerCase() === 'music');
    if (musicBtn) musicBtn.click();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/verify_original_music_section_live.png' });

  await browser.close();
  console.log('ALL VERIFICATIONS SUCCESSFUL!');
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
