const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace React Router Link
      content = content.replace(/import\s+\{([^}]*?)Link([^}]*?)\}\s+from\s+['"]react-router['"]/g, (match, p1, p2) => {
        return `import { ${p1.trim()} ${p2.trim()} } from 'react-router';\nimport Link from 'next/link';`;
      });
      content = content.replace(/<Link\s+to=/g, '<Link href=');
      
      // Replace useNavigate
      content = content.replace(/import\s+\{([^}]*?)useNavigate([^}]*?)\}\s+from\s+['"]react-router['"]/g, (match, p1, p2) => {
        return `import { ${p1.trim()} ${p2.trim()} } from 'react-router';\nimport { useNavigate } from '@/hooks/useNavigate';`;
      });
      
      // Clean up empty react-router imports (where only Link and useNavigate were imported)
      content = content.replace(/import\s+\{\s*\}\s+from\s+['"]react-router['"];?\n/g, '');
      content = content.replace(/import\s+\{\s*,\s*\}\s+from\s+['"]react-router['"];?\n/g, '');

      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir(path.join('apps', 'frontend-next', 'src'));
console.log('Finished bulk replace');
