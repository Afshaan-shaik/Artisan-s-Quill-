import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const html = `
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Alex+Brush&family=IM+Fell+English:ital@1&family=Fraunces:ital,wght@1,300;1,400&family=Italiana&family=Playfair+Display:ital@1&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap" rel="stylesheet">
<style>
  body {
    background: #050608;
    color: #ded7c8;
    padding: 60px;
    font-family: sans-serif;
  }
  .gt {
    background: linear-gradient(120deg, #fdf0d5 0%, #dfbd87 45%, #b68b45 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
  }
  .glow {
    filter: drop-shadow(0 4px 24px rgba(223, 189, 135, 0.5));
  }
  .card {
    background: rgba(13, 74, 37, 0.15);
    border: 1px solid rgba(201, 168, 117, 0.25);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
  }
  .lead {
    font-size: 17px;
    color: #8d897f;
    line-height: 1.6;
    margin-bottom: 16px;
  }
</style>
</head>
<body>
  <div class="card">
    <div style="color: #d8b779; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px;">Option 1: Pinyon Script (Aristocratic French Calligraphic Quill)</div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    <div class="gt glow" style="font-family: 'Pinyon Script', cursive; font-size: 38px; line-height: 1.3;">
      Share your art , get connected , stay creative , stay you
    </div>
  </div>

  <div class="card">
    <div style="color: #d8b779; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px;">Option 2: Alex Brush (Flowing Fine Pen Script)</div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    <div class="gt glow" style="font-family: 'Alex Brush', cursive; font-size: 34px; line-height: 1.3;">
      Share your art , get connected , stay creative , stay you
    </div>
  </div>

  <div class="card">
    <div style="color: #d8b779; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px;">Option 3: IM Fell English Italic (17th Century Antique Antiquarian Quill)</div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    <div class="gt glow" style="font-family: 'IM Fell English', serif; font-style: italic; font-size: 26px; line-height: 1.4; letter-spacing: 0.02em;">
      ✦ Share your art , get connected , stay creative , stay you
    </div>
  </div>

  <div class="card">
    <div style="color: #d8b779; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px;">Option 4: Italiana (Haute Couture Milanese Architectural Serif)</div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    <div class="gt glow" style="font-family: 'Italiana', serif; font-size: 28px; line-height: 1.4; letter-spacing: 0.06em;">
      Share your art , get connected , stay creative , stay you
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/font_comparison.png' });
  await browser.close();
  console.log('Font comparison captured!');
})();

