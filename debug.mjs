import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  
  // Listen for console errors to catch the React unminified error
  page1.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });
  
  page1.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: ${exception}`);
  });

  console.log('Navigating to live Vercel server...');
  await page1.goto('https://the-artisans-quill-digital-art-poet.vercel.app');
  
  await page1.waitForTimeout(5000); // Give it time to crash
  
  await browser.close();
})();
