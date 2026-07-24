const sharp = require('sharp');

async function processIcon() {
  const originalPath = 'C:/Users/venka/.gemini/antigravity-ide/brain/cda2b883-c7e7-42e7-9edc-149704af0c0f/media__1784542417907.png';
  const outputPath = 'build/icon.png';

  try {
    const { data, info } = await sharp(originalPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    
    const visited = new Uint8Array(width * height);
    // Start from the corners
    const queue = [[0, 0], [width-1, 0], [0, height-1], [width-1, height-1]]; 
    
    for(const [x,y] of queue) {
      visited[y * width + x] = 1;
    }

    // A pixel is background if it's bright enough
    const isBg = (r, g, b) => r > 210 && g > 210 && b > 210;

    let head = 0;
    while(head < queue.length) {
      const [x, y] = queue[head++];
      const idx = (y * width + x) * 4;
      
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];

      if (isBg(r, g, b)) {
        data[idx+3] = 0; // Make transparent
        
        const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (visited[ny * width + nx] === 0) {
              visited[ny * width + nx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }
    
    // To fix jagged edges, let's do a simple anti-aliasing pass:
    // If a pixel is transparent, but neighbors are opaque, we can blend.
    // We'll skip complex anti-aliasing for now, trimming should help.
    const processedBuffer = await sharp(data, {
      raw: { width, height, channels: 4 }
    })
    .trim() // Crop out the newly transparent background
    .png()
    .toBuffer();

    await sharp(processedBuffer)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputPath);

    console.log('Background removed via flood fill!');
  } catch (err) {
    console.error(err);
  }
}

processIcon();
