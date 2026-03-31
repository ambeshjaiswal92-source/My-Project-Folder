// Batch convert all .avif images in the uploads directory to .jpg using sharp
// Usage: node convert-avif-to-jpg.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadsDir = path.join(__dirname, 'uploads');

fs.readdir(uploadsDir, (err, files) => {
  if (err) {
    console.error('Error reading uploads directory:', err);
    process.exit(1);
  }

  const avifFiles = files.filter(file => file.endsWith('.avif'));
  if (avifFiles.length === 0) {
    console.log('No .avif files found in uploads directory.');
    return;
  }

  avifFiles.forEach(file => {
    const avifPath = path.join(uploadsDir, file);
    const jpgPath = avifPath.replace(/\.avif$/, '.jpg');
    sharp(avifPath)
      .jpeg({ quality: 90 })
      .toFile(jpgPath)
      .then(() => {
        console.log(`Converted: ${file} -> ${path.basename(jpgPath)}`);
      })
      .catch(err => {
        console.error(`Error converting ${file}:`, err);
      });
  });
});
