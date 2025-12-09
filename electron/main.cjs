const { app, BrowserWindow, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

// ===== CRASH DEBUGGING FLAGS =====
// Force single instance to avoid named pipe collisions
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    console.error('Another instance is already running. Exiting...');
    app.quit();
    process.exit(0);
}

// Disable sandbox (can cause silent crashes)
app.commandLine.appendSwitch('no-sandbox');

// Enable verbose logging
app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('v', '1');

// Disable renderer backgrounding
app.commandLine.appendSwitch('disable-renderer-backgrounding');

// Uncomment if crashes persist (GPU driver issues):
// app.commandLine.appendSwitch('disable-gpu');
// app.disableHardwareAcceleration();

// ===== ENHANCED LOGGING =====
const userDataPath = app.getPath('userData');
const logPath = path.join(userDataPath, 'electron-log.txt');

console.log('=== ELECTRON STARTUP ===');
console.log('User Data Path:', userDataPath);
console.log('Log Path:', logPath);
console.log('Electron Version:', process.versions.electron);
console.log('Chrome Version:', process.versions.chrome);
console.log('Node Version:', process.versions.node);
console.log('Platform:', process.platform, process.arch);
console.log('========================\n');

function writeLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(logPath, logMessage);
    } catch (err) {
        console.error('Failed to write to log:', err);
    }
}

writeLog('Electron main process started');
writeLog(`Single instance lock acquired: ${gotTheLock}`);

// ===== CRITICAL ERROR HANDLERS =====
process.on('uncaughtException', (error) => {
    const errorMsg = `UNCAUGHT EXCEPTION: ${error.stack || error}`;
    writeLog(errorMsg);
    clipboard.writeText(errorMsg);
    dialog.showErrorBoxSync('Critical Error', `Uncaught Exception:\n${error.message}\n\n✅ Copiée au presse-papier\nLog: ${logPath}`);
});

process.on('unhandledRejection', (reason, promise) => {
    const errorMsg = `UNHANDLED REJECTION: ${reason}`;
    writeLog(errorMsg);
    clipboard.writeText(errorMsg);
    dialog.showErrorBoxSync('Promise Rejection', `${reason}\n\n✅ Copiée au presse-papier\nLog: ${logPath}`);
});

// ===== SECOND INSTANCE HANDLER =====
app.on('second-instance', () => {
    writeLog('Second instance attempted to launch');
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

let mainWindow;

function createWindow() {
    writeLog('Creating main window...');

    try {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            backgroundColor: '#000000',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false,
                enableRemoteModule: false,
            },
            accessibilitySupport: true,
            title: 'Neon Vanguard: Sector Zero',
            show: false // Don't show until ready
        });

        // Renderer crash handler
        mainWindow.webContents.on('crashed', (event, killed) => {
            const errorMsg = `RENDERER CRASHED! Killed: ${killed}`;
            writeLog(errorMsg);
            clipboard.writeText(errorMsg);
            dialog.showErrorBoxSync('Renderer Process Crashed', `Le processus de rendu a crashé.\n\nKilled: ${killed}\n\n✅ Copiée au presse-papier\nLog: ${logPath}`);
        });

        // Unresponsive handler
        mainWindow.on('unresponsive', () => {
            writeLog('Window became unresponsive');
        });

        mainWindow.on('responsive', () => {
            writeLog('Window became responsive again');
        });

        // Show window when ready
        mainWindow.once('ready-to-show', () => {
            writeLog('Window ready to show');
            mainWindow.show();
        });

        const isDev = !app.isPackaged;
        writeLog(`Environment: ${isDev ? 'Development' : 'Production'}`);

        let startUrl;
        if (isDev) {
            startUrl = 'http://localhost:5173';
            writeLog(`Loading DEV URL: ${startUrl}`);
        } else {
            // In production, dist is packaged alongside main.cjs
            // After electron-builder, structure is:
            // resources/
            //   app.asar (or app/)
            //     electron/main.cjs
            //     dist/index.html
            const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

            writeLog(`Production mode - __dirname: ${__dirname}`);
            writeLog(`Attempting to load: ${indexPath}`);
            writeLog(`File exists: ${fs.existsSync(indexPath)}`);

            // Use loadFile instead of loadURL for better error handling
            mainWindow.loadFile(indexPath).catch(err => {
                writeLog(`LOAD FILE ERROR: ${err}`);
                // Fallback: try from __dirname directly
                const fallbackPath = path.join(__dirname, 'dist', 'index.html');
                writeLog(`Trying fallback: ${fallbackPath}`);
                return mainWindow.loadFile(fallbackPath);
            });

            // Skip the loadURL below
            writeLog('Main window created successfully');
            return;
        }

        writeLog(`Loading URL: ${startUrl}`);

        mainWindow.loadURL(startUrl);

        // En dev, ouvrir DevTools
        if (isDev) {
            writeLog('Opening DevTools');
            mainWindow.webContents.openDevTools();
        }

        // Gestion d'erreur avec clipboard
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            const errorMsg = `ERREUR DE CHARGEMENT\n\nCode: ${errorCode}\nDescription: ${errorDescription}\nURL: ${validatedURL}\n\nChemin __dirname: ${__dirname}\nChemin index tenté: ${path.join(__dirname, 'dist', 'index.html')}`;

            writeLog(errorMsg);
            clipboard.writeText(errorMsg);

            dialog.showErrorBox(
                'Erreur de chargement',
                `${errorDescription}\n\n✅ Erreur copiée au presse-papier (Ctrl+V)`
            );
        });

        writeLog('Main window created successfully');

    } catch (error) {
        const errorMsg = `ERROR IN createWindow: ${error.stack || error}`;
        writeLog(errorMsg);
        clipboard.writeText(errorMsg);
        dialog.showErrorBoxSync('Window Creation Failed', `${error.message}\n\n✅ Copiée au presse-papier\nLog: ${logPath}`);
        throw error;
    }
}

// ===== APP LIFECYCLE =====
app.whenReady().then(() => {
    writeLog('App ready, creating window...');
    createWindow();
    writeLog('App initialization complete');
});

app.on('window-all-closed', () => {
    writeLog('All windows closed');
    if (process.platform !== 'darwin') {
        writeLog('Quitting app');
        app.quit();
    }
});

app.on('activate', () => {
    writeLog('App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
        writeLog('No windows, creating new one');
        createWindow();
    }
});

// Additional lifecycle logging
app.on('before-quit', () => {
    writeLog('App about to quit (before-quit event)');
});

app.on('will-quit', () => {
    writeLog('App will quit (will-quit event)');
});

app.on('quit', (event, exitCode) => {
    writeLog(`App quit with exit code: ${exitCode}`);
});

writeLog('Main.cjs loaded completely');
