const { app, BrowserWindow, protocol, net, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// MUST register custom scheme before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (app.isPackaged) {
    win.loadURL('app://./');
  } else {
    // In development, load from Next.js dev server
    win.loadURL('http://localhost:3000');
  }

  ipcMain.on('print-bill', (event) => {
    win.webContents.print({ silent: true, printBackground: true }, (success, failureReason) => {
      if (!success) console.log('Print failed', failureReason);
    });
  });
}

app.whenReady().then(() => {
  // Register app:// protocol to serve Next.js static export files
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let urlPath = decodeURIComponent(url.pathname);

    // Remove leading slash so it can be safely joined with outDir
    if (urlPath.startsWith('/')) {
      urlPath = urlPath.slice(1);
    }

    // Default to root
    if (!urlPath || urlPath === '') urlPath = 'index.html';

    const outDir = path.join(__dirname, 'out');
    let filePath = path.join(outDir, urlPath);

    // 1. Try exact path (e.g. _next/static/... assets)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return net.fetch(`file://${filePath}`);
    }

    // 2. Try as a Next.js page: /pos -> out/pos.html
    const htmlPath = filePath.endsWith('.html') ? filePath : filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      return net.fetch(`file://${htmlPath}`);
    }

    // 3. Try as a directory index: /pos -> out/pos/index.html
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return net.fetch(`file://${indexPath}`);
    }

    // 4. Fallback to root index.html (handles client-side redirects)
    return net.fetch(`file://${path.join(outDir, 'index.html')}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
