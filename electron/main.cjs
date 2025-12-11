const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ===== SIMPLE LOGGING =====
const logMessages = [];
function log(msg) {
    const timestamp = new Date().toISOString();
    const fullMsg = `[${timestamp}] ${msg}`;
    console.log(fullMsg);
    logMessages.push(fullMsg);
}

log('=== ELECTRON STARTING ===');
log(`__dirname: ${__dirname}`);
log(`process.cwd: ${process.cwd()}`);
log(`app.isPackaged: ${app.isPackaged}`);

// Write log to file in app directory (not userData which may not exist yet)
function saveLog() {
    try {
        const logContent = logMessages.join('\n');
        const logPath = path.join(__dirname, 'startup-log.txt');
        fs.writeFileSync(logPath, logContent);
        log(`Log saved to: ${logPath}`);
    } catch (e) {
        console.error('Could not save log:', e);
    }
}

// ===== ERROR HANDLERS =====
process.on('uncaughtException', (error) => {
    log(`UNCAUGHT EXCEPTION: ${error.stack || error}`);
    saveLog();
    dialog.showErrorBoxSync('Error', `${error.message}\n\nCheck: ${path.join(__dirname, 'startup-log.txt')}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    log(`UNHANDLED REJECTION: ${reason}`);
    saveLog();
});

// ===== MAIN WINDOW =====
let mainWindow = null;

async function createWindow() {
    log('Creating window...');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: '#000000',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: 'Neon Vanguard: Sector Zero'
    });

    mainWindow.once('ready-to-show', () => {
        log('Window ready, showing...');
        mainWindow.show();
    });

    mainWindow.webContents.on('did-fail-load', (event, code, desc, url) => {
        log(`LOAD FAILED: ${code} - ${desc} - ${url}`);
        saveLog();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        log('Page loaded successfully');
    });

    // Determine what to load
    const isDev = !app.isPackaged;
    log(`Mode: ${isDev ? 'DEV' : 'PROD'}`);

    if (isDev) {
        log('Loading localhost:5173...');
        await mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // Production path
        const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
        log(`Loading: ${indexPath}`);
        log(`Exists: ${fs.existsSync(indexPath)}`);

        if (fs.existsSync(indexPath)) {
            await mainWindow.loadFile(indexPath);
        } else {
            log('ERROR: index.html not found!');
            saveLog();
            dialog.showErrorBoxSync('Error', `File not found: ${indexPath}`);
        }
    }

    log('Window created');
    saveLog();
}

// ===== APP READY =====
app.whenReady().then(() => {
    log('App ready');
    createWindow();
}).catch(err => {
    log(`APP READY ERROR: ${err}`);
    saveLog();
});

app.on('window-all-closed', () => {
    log('All windows closed, quitting');
    saveLog();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

log('main.cjs loaded');
saveLog();
