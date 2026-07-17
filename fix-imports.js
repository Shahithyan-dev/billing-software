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
      
      const targets = ['components', 'config', 'assets', 'layouts', 'hooks', 'store', 'utils'];
      
      targets.forEach(t => {
        // Replace ../../t or ../../../t with @/t
        const regex = new RegExp('([\'\\"])(\\.{2}/)+' + t + '(/|[\'\\"])', 'g');
        content = content.replace(regex, (match, p1, p2) => p1 + '@/' + t + (match.endsWith('/') ? '/' : p1));
      });
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir(path.join('apps', 'frontend', 'src', 'app'));
console.log('Fixed relative imports in app routes');
