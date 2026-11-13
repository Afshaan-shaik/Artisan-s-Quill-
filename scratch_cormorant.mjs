import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const html = `
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400&display=swap" rel="stylesheet">
<style>
  body {
    background: #050608;
    color: #ded7c8;
    padding: 60px;
    font-family: 'Inter', sans-serif;
  }
  .h1 {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 72px;
    font-weight: 300;
    line-height: 0.95;
    color: #f4efe6;
    margin-bottom: 24px;
  }
  .gt {
    background: linear-gradient(120deg, #f6e3b4, #d8b779 45%, #b68b45);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .lead {
    font-size: 17px;
    color: #8d897f;
    line-height: 1.6;
    max-width: 540px;
    margin-bottom: 20px;
  }
  .card {
    background: rgba(13, 74, 37, 0.15);
    border: 1px solid rgba(201, 168, 117, 0.25);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    max-width: 600px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="h1">Where every work <em class="gt" style="font-style: italic;">breathes.</em></div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    
    <div style="color: #d8b779; font-size: 11px; margin-bottom: 6px;">Variant A: Upright Font-Light (Same as "Where every work")</div>
    <div class="gt" style="font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 32px; letter-spacing: -0.01em; filter: drop-shadow(0 2px 18px rgba(216,183,121,0.35));">
      Share your art , get connected
    </div>
  </div>

  <div class="card">
    <div class="h1">Where every work <em class="gt" style="font-style: italic;">breathes.</em></div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    
    <div style="color: #d8b779; font-size: 11px; margin-bottom: 6px;">Variant B: Elegant Italic (Same as "breathes")</div>
    <div class="gt" style="font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: 32px; letter-spacing: 0.01em; filter: drop-shadow(0 2px 18px rgba(216,183,121,0.35));">
      Share your art , get connected
    </div>
  </div>

  <div class="card">
    <div class="h1">Where every work <em class="gt" style="font-style: italic;">breathes.</em></div>
    <div class="lead">A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.</div>
    
    <div style="color: #d8b779; font-size: 11px; margin-bottom: 6px;">Variant C: Upright "Share your art," + Italic "get connected"</div>
    <div class="gt" style="font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 32px; letter-spacing: -0.01em; filter: drop-shadow(0 2px 18px rgba(216,183,121,0.35));">
      Share your art , <em style="font-style: italic;">get connected</em>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Afshaan/.gemini/antigravity/brain/50ce9e41-12a4-4077-a951-b4c239ffe6a5/cormorant_variations.png' });
  await browser.close();
  console.log('Captured cormorant variations!');
})();

