const fs = require('fs');
const path = require('path');

const files = [
  'staff/page.tsx',
  'settings/page.tsx',
  'security/page.tsx',
  'reservations/page.tsx',
  'loyalty/page.tsx',
  'kitchen/page.tsx',
  'inventory/page.tsx',
  'hardware/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'apps/frontend/src/app/(dashboard)', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /<header className="flex items-center justify-between">/g,
      '<header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">'
    );
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
