const fs = require('fs');
const path = require('path');

const srcPagesDir = path.join('apps', 'frontend', 'src', 'pages');
const appDir = path.join('apps', 'frontend-next', 'src', 'app');

const routeMapping = [
  { src: 'auth/Login.tsx', dest: '(auth)/login/page.tsx' },
  { src: 'auth/Register.tsx', dest: '(auth)/register/page.tsx' },
  { src: 'dashboard/Dashboard.tsx', dest: '(dashboard)/dashboard/page.tsx' },
  { src: 'pos/POS.tsx', dest: '(dashboard)/pos/page.tsx' },
  { src: 'kitchen/Kitchen.tsx', dest: '(dashboard)/kitchen/page.tsx' },
  { src: 'loyalty/Loyalty.tsx', dest: '(dashboard)/loyalty/page.tsx' },
  { src: 'hardware/Hardware.tsx', dest: '(dashboard)/hardware/page.tsx' },
  { src: 'staff/Staff.tsx', dest: '(dashboard)/staff/page.tsx' },
  { src: 'inventory/Inventory.tsx', dest: '(dashboard)/inventory/page.tsx' },
  { src: 'reservations/Reservations.tsx', dest: '(dashboard)/reservations/page.tsx' },
  { src: 'security/Security.tsx', dest: '(dashboard)/security/page.tsx' },
  { src: 'settings/Settings.tsx', dest: '(dashboard)/settings/page.tsx' }
];

for (const { src, dest } of routeMapping) {
  const fullSrc = path.join(srcPagesDir, src);
  const fullDest = path.join(appDir, dest);
  if (fs.existsSync(fullSrc)) {
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });
    
    let content = fs.readFileSync(fullSrc, 'utf8');
    
    // Add "use client" since these use React hooks
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      content = '"use client";\n\n' + content;
    }
    
    fs.writeFileSync(fullDest, content);
  } else {
    console.warn(`Source not found: ${fullSrc}`);
  }
}

// We also need to run our regex replacements on the newly copied page.tsx files
function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/import\s+\{([^}]*?)Link([^}]*?)\}\s+from\s+['"]react-router['"]/g, (match, p1, p2) => {
        return `import { ${p1.trim()} ${p2.trim()} } from 'react-router';\nimport Link from 'next/link';`;
      });
      content = content.replace(/<Link\s+to=/g, '<Link href=');
      content = content.replace(/import\s+\{([^}]*?)useNavigate([^}]*?)\}\s+from\s+['"]react-router['"]/g, (match, p1, p2) => {
        return `import { ${p1.trim()} ${p2.trim()} } from 'react-router';\nimport { useNavigate } from '@/hooks/useNavigate';`;
      });
      content = content.replace(/import\s+\{\s*\}\s+from\s+['"]react-router['"];?\n/g, '');
      content = content.replace(/import\s+\{\s*,\s*\}\s+from\s+['"]react-router['"];?\n/g, '');
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir(appDir);

console.log('Finished migrating pages to Next.js routes');
