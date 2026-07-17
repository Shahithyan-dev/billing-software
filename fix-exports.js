const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('page.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for: export const ComponentName = 
      const match = content.match(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*(?:React\.FC)?\s*(?:<[^>]+>)?\s*\([^)]*\)\s*=>/);
      if (match) {
        const componentName = match[1];
        // Change "export const ComponentName =" to "const ComponentName ="
        content = content.replace(match[0], match[0].replace('export const', 'const'));
        // Add export default at the bottom if not present
        if (!content.includes(`export default ${componentName}`)) {
          content += `\nexport default ${componentName};\n`;
        }
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir(path.join('apps', 'frontend', 'src', 'app'));
console.log('Fixed exports in app routes');
