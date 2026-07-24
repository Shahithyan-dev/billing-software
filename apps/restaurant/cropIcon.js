const sharp = require('sharp');
const fs = require('fs');

async function processIcon() {
  const inputPath = 'build/icon.png';
  const outputPath = 'build/icon-cropped.png';

  try {
    await sharp(inputPath)
      .trim() // Automatically crops away the background (white)
      .toFile(outputPath);
      
    // Replace the old icon
    fs.renameSync(outputPath, inputPath);
    console.log('Icon successfully cropped!');
  } catch (err) {
    console.error('Error cropping icon:', err);
  }
}

processIcon();
