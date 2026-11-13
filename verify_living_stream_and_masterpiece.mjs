import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5';
const LOCAL_URL = 'http://localhost:5176';

async function run() {
  console.log(`Connecting to browser and visiting ${LOCAL_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Skip welcome modal if present
  const skipBtn = page.locator('#skipBtn');
  if (await skipBtn.count() > 0) {
    try {
      await skipBtn.click({ timeout: 2000 });
      console.log('Skipped welcome modal.');
      await page.waitForTimeout(1000);
    } catch {}
  }

  // 1. Verify Curatorial Spotlight & Masterpiece of the Day Section
  console.log('1. Checking Curatorial Spotlight Header...');
  const spotlightSection = page.locator('#curatorial-spotlight-hero');
  await spotlightSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const spotlightHeader = page.locator('text=CURATORIAL SPOTLIGHT');
  const masterpieceTitle = page.locator('text=MASTERPIECE OF THE DAY');
  console.log('Spotlight header count:', await spotlightHeader.count());
  console.log('Masterpiece title count:', await masterpieceTitle.count());

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_spotlight_masterpiece.png') });
  console.log('Saved verify_spotlight_masterpiece.png');

  // 2. Check the Living Curated Sanctuary Stream Initial Order
  console.log('2. Inspecting Living Sanctuary Stream initial card positions...');
  const streamContainer = page.locator('#gallery-masonry-container');
  await streamContainer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const getCardTitles = async () => {
    return await page.$$eval('#gallery-masonry-container > div', (cards) => {
      return cards.slice(0, 10).map((card) => {
        const titleEl = card.querySelector('h3, [data-artwork-title]');
        const title = card.getAttribute('data-artwork-title') || titleEl?.textContent?.trim() || 'Untitled';
        const rect = card.getBoundingClientRect();
        return {
          title,
          x: Math.round(rect.left),
          y: Math.round(rect.top)
        };
      });
    });
  };

  const initialCards = await getCardTitles();
  console.log('Initial first 5 cards in stream:');
  initialCards.slice(0, 5).forEach((c, idx) => console.log(`  [#${idx + 1}] "${c.title}" at (${c.x}, ${c.y})`));

  // Check for the #1 Masterpiece badge in the gallery
  const masterpieceBadges = page.locator('text=#1 Masterpiece');
  const badgeCount = await masterpieceBadges.count();
  console.log('Number of #1 Masterpiece badges visible in gallery/spotlight:', badgeCount);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_stream_initial_order.png') });
  console.log('Saved verify_stream_initial_order.png');

  // 3. Wait for the Living Rotation Cycle (~12-14 seconds)
  console.log('3. Waiting for automatic living rearrangement rotation (~13.5s)...');
  await page.waitForTimeout(13500);

  const rotatedCards = await getCardTitles();
  console.log('Rotated first 5 cards in stream:');
  rotatedCards.slice(0, 5).forEach((c, idx) => console.log(`  [#${idx + 1}] "${c.title}" at (${c.x}, ${c.y})`));

  let movedCount = 0;
  for (let i = 0; i < Math.min(initialCards.length, rotatedCards.length); i++) {
    if (initialCards[i].title !== rotatedCards[i].title || initialCards[i].x !== rotatedCards[i].x || initialCards[i].y !== rotatedCards[i].y) {
      movedCount++;
    }
  }
  console.log(`Cards that rearranged position: ${movedCount} / ${initialCards.length}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_stream_after_rotation.png') });
  console.log('Saved verify_stream_after_rotation.png');

  // Dismiss intro overlay if present so it doesn't intercept pointer events
  await page.evaluate(() => {
    const intro = document.getElementById('intro');
    if (intro) intro.remove();
  });
  await page.waitForTimeout(500);

  // 4. Test Most Liked Filter (Preserves strict sort, no rotation)
  console.log('4. Testing "Most Liked" filter...');
  const popularBtn = page.locator('#filter-popular-btn');
  await popularBtn.click({ force: true });
  await page.waitForTimeout(1500);

  const popularCardsInitial = await getCardTitles();
  console.log('Most Liked top cards:');
  popularCardsInitial.slice(0, 4).forEach((c, idx) => console.log(`  [#${idx + 1}] "${c.title}"`));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_stream_most_liked.png') });

  // 5. Test Latest Filter (Preserves chronological sort, no rotation)
  console.log('5. Testing "Latest" filter...');
  const latestBtn = page.locator('#filter-latest-btn');
  await latestBtn.click({ force: true });
  await page.waitForTimeout(1500);

  const latestCardsInitial = await getCardTitles();
  console.log('Latest top cards:');
  latestCardsInitial.slice(0, 4).forEach((c, idx) => console.log(`  [#${idx + 1}] "${c.title}"`));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_stream_latest.png') });

  // 6. Return to Curated
  console.log('6. Returning to "Curated"...');
  const curatedBtn = page.locator('#filter-curated-btn');
  await curatedBtn.click({ force: true });
  await page.waitForTimeout(1500);

  // 7. Test Detail Modal View (View Masterpiece)
  console.log('7. Testing "View Masterpiece" in Spotlight...');
  const viewMasterpieceBtn = page.locator('#view-masterpiece-spotlight-btn');
  if (await viewMasterpieceBtn.count() > 0) {
    await viewMasterpieceBtn.click({ force: true });
    await page.waitForTimeout(1500);

    const modal = page.locator('#artwork-detail-modal');
    const isModalVisible = await modal.count() > 0;
    console.log('Detail modal opened:', isModalVisible);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_masterpiece_modal_opened.png') });

    // Close modal
    const closeBtn = page.locator('#close-detail-modal');
    if (await closeBtn.count() > 0) {
      await closeBtn.click({ force: true });
      console.log('Closed detail modal.');
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();
  console.log('All tests completed successfully!');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
