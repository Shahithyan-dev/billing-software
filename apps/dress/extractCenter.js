const sharp = require('sharp');

async function processIcon() {
  const originalPath = 'C:/Users/venka/.gemini/antigravity-ide/brain/cda2b883-c7e7-42e7-9edc-149704af0c0f/media__1784542417907.png';
  const outputPath = 'build/icon.png';

  try {
    // Zoom in incredibly aggressively to just the core logo
    // Extract a 400x400 square from the absolute center
    await sharp(originalPath)
      .extract({ left: 312, top: 312, width: 400, height: 400 }) 
      .resize(1024, 1024, { fit: 'contain' })
      .toFile(outputPath);
      
    console.log('Icon successfully ultra-zoomed!');
  } catch (err) {
    console.error('Error cropping icon:', err);
  }
}

processIcon();
