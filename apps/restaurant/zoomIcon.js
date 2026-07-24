const sharp = require('sharp');

async function processIcon() {
  const originalPath = 'C:/Users/venka/.gemini/antigravity-ide/brain/cda2b883-c7e7-42e7-9edc-149704af0c0f/media__1784542417907.png';
  const outputPath = 'build/icon.png';

  try {
    // Zoom aggressively into the center (600x600 box) and scale back up to 1024x1024
    await sharp(originalPath)
      .extract({ left: 212, top: 180, width: 600, height: 664 }) // Taller box because the logo is vertical
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(outputPath);
      
    console.log('Icon successfully zoomed and cropped!');
  } catch (err) {
    console.error('Error cropping icon:', err);
  }
}

processIcon();
