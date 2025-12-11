// Minimal Electron test script
const { app, BrowserWindow } = require('electron');

console.log('TEST: Script started');
console.log('TEST: app.isPackaged =', app.isPackaged);

app.whenReady().then(() => {
    console.log('TEST: App ready');

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: true
    });

    console.log('TEST: Window created');

    win.loadURL('http://localhost:5173').then(() => {
        console.log('TEST: URL loaded');
    }).catch(err => {
        console.log('TEST: Load error:', err);
    });
});

app.on('window-all-closed', () => {
    console.log('TEST: Windows closed');
    app.quit();
});
