# Electron Build Guide

Guide for building and distributing the **Neon Vanguard: Sector Zero** desktop application with Electron.

## 📋 Table of Contents

- [Configuration](#configuration)
- [Development](#development)
- [Production Build](#production-build)
- [Distribution](#distribution)
- [Code Signing and Notarization](#code-signing-and-notarization)
- [Automatic Updates](#automatic-updates)
- [Troubleshooting](#troubleshooting)

---

## Configuration

### Electron Files

#### `electron/main.cjs`

Electron main process:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Neon Vanguard: Sector Zero'
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Error handling
  mainWindow.webContents.on('did-fail-load', () => {
    console.error('Failed to load app');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

#### `package.json` Configuration

```json
{
  "name": "neon-vanguard-sector-zero",
  "productName": "Neon Vanguard: Sector Zero",
  "version": "1.0.0",
  "main": "electron/main.cjs",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "build": {
    "appId": "com.neonvanguard.sectorzero",
    "productName": "Neon Vanguard: Sector Zero",
    "directories": {
      "buildResources": "public",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ],
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.games",
      "icon": "public/icon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "category": "Game",
      "icon": "public/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

---

## Development

### Run in Development Mode

```bash
npm run electron:dev
```

This command:
1. Starts the Vite server (http://localhost:5173)
2. Waits for the server to be ready
3. Launches Electron which loads the local URL

**Advantages**:
- ✅ Automatic hot-reload
- ✅ DevTools open
- ✅ Fast refresh

### Debugging

#### Main Process

Add to `electron/main.cjs`:

```javascript
console.log('Electron app started');
console.log('App path:', app.getPath('userData'));
```

#### Renderer Process

Open DevTools (already active in dev):

```javascript
mainWindow.webContents.openDevTools();
```

---

## Production Build

### Windows

```bash
npm run electron:build:win
```

**Outputs** (in `release/`):
- `Neon Vanguard Sector Zero Setup 1.0.0.exe` - NSIS installer
- `Neon Vanguard Sector Zero 1.0.0.exe` - Portable

**NSIS Configuration**:
- Installation in `C:\Program Files\Neon Vanguard Sector Zero`
- Optional desktop shortcut
- Start menu shortcut
- Uninstaller included

### macOS

```bash
npm run electron:build:mac
```

**Requirements**:
- macOS 10.13+
- Xcode Command Line Tools

**Outputs**:
- `Neon Vanguard Sector Zero-1.0.0.dmg` - Disk image
- `Neon Vanguard Sector Zero-1.0.0-mac.zip` - Archive

### Linux

```bash
npm run electron:build:linux
```

**Outputs**:
- `Neon Vanguard Sector Zero-1.0.0.AppImage` - Universal AppImage
- `neon-vanguard-sector-zero_1.0.0_amd64.deb` - Debian/Ubuntu
- `neon-vanguard-sector-zero-1.0.0.x86_64.rpm` - Fedora/RHEL

---

## Distribution

### Build Sizes

| Platform | Format | Size (approx) |
|----------|--------|---------------|
| Windows | NSIS | ~150 MB |
| Windows | Portable | ~140 MB |
| macOS | DMG | ~160 MB |
| Linux | AppImage | ~155 MB |

### Reduce Size

1. **Remove DevDependencies**:
   ```bash
   npm prune --production
   ```

2. **Compression in electron-builder**:
   ```json
   "build": {
     "compression": "maximum",
     "asar": true
   }
   ```

3. **Vite Tree-shaking**:
   - Already active by default
   - Removes dead code

### Upload to GitHub Releases

1. **Tag the version**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub release**:
   - Go to GitHub Releases
   - "Draft a new release"
   - Select tag `v1.0.0`
   - Upload files from `release/`

3. **Files to upload**:
   - Windows: `.exe` (installer + portable)
   - macOS: `.dmg`
   - Linux: `.AppImage`, `.deb`, `.rpm`
   - `latest.yml` / `latest-mac.yml` (for auto-update)

---

## Code Signing and Notarization

### Windows Code Signing

**Requirements**:
- Code signing certificate (.pfx or .p12)
- Certificate password

**Configuration**:

```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "password",
  "signingHashAlgorithms": ["sha256"],
  "signDlls": true
}
```

**Via environment variables** (recommended):

```bash
set CSC_LINK=path/to/certificate.pfx
set CSC_KEY_PASSWORD=password
npm run electron:build:win
```

### macOS Code Signing & Notarization

**Requirements**:
- Apple Developer Account ($99/year)
- Developer ID Application certificate
- App-specific password

**Configuration**:

```json
"mac": {
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist"
}
```

**Environment variables**:

```bash
export APPLE_ID="your-apple-id@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"
npm run electron:build:mac
```

**Entitlements** (`build/entitlements.mac.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
</dict>
</plist>
```

---

## Automatic Updates

### With electron-updater

1. **Installation**:
   ```bash
   npm install electron-updater
   ```

2. **Configuration in main.cjs**:

   ```javascript
   const { autoUpdater } = require('electron-updater');

   app.on('ready', () => {
     createWindow();
     
     // Check for updates
     autoUpdater.checkForUpdatesAndNotify();
   });

   autoUpdater.on('update-available', () => {
     console.log('Update available!');
   });

   autoUpdater.on('update-downloaded', () => {
     autoUpdater.quitAndInstall();
   });
   ```

3. **Publish configuration**:

   ```json
   "build": {
     "publish": [
       {
         "provider": "github",
         "owner": "yourusername",
         "repo": "neon-vanguard-sector-zero"
       }
     ]
   }
   ```

4. **Publish update**:

   ```bash
   npm run electron:build -- --publish always
   ```

---

## Troubleshooting

### "Application can't be opened" (macOS)

**Cause**: Unsigned app.

**Solution**:
1. Right-click → Open
2. OR: `xattr -cr /Applications/Neon\ Vanguard.app`

### "Windows protected your PC" (Windows)

**Cause**: Unsigned app or unrecognized certificate.

**Solutions**:
- Get code signing certificate
- OR: Click "More info" → "Run anyway"

### Build fails with "Cannot find module"

**Cause**: Incorrect paths in electron/main.cjs.

**Solution**: Verify:

```javascript
// DEV
mainWindow.loadURL('http://localhost:5173');

// PROD
mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
```

### Blank screen after build

**Possible causes**:
1. **Incorrect Base URL**: In `vite.config.ts`, ensure `base: './'`
2. **Asset paths**: Verify paths in `index.html`
3. **CSP headers**: Disable or adjust Content Security Policy

**Debug**:

```javascript
// In main.cjs
mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('Failed to load:', errorCode, errorDescription);
});

mainWindow.webContents.on('console-message', (event, level, message) => {
  console.log('Console:', message);
});
```

### App too large

**Solutions**:
1. Enable `asar: true` in build config
2. `compression: "maximum"`
3. Remove unnecessary node_modules
4. Don't include `src/` in files (only `dist/`)

---

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto-Update Guide](https://www.electron.build/auto-update)

---

**Last Updated**: 2025-12-09
