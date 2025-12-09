# Electron Build Guide

Guide pour construire et distribuer l'application desktop **Neon Vanguard: Sector Zero** avec Electron.

## 📋 Table des Matières

- [Configuration](#configuration)
- [Développement](#développement)
- [Build de Production](#build-de-production)
- [Distribution](#distribution)
- [Signature et Notarization](#signature-et-notarization)
- [Updates Automatiques](#updates-automatiques)
- [Troubleshooting](#troubleshooting)

---

## Configuration

### Fichiers Electron

#### `electron/main.cjs`

Main process Electron:

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

## Développement

### Lancer en Mode Développement

```bash
npm run electron:dev
```

Cette commande:
1. Démarre le serveur Vite (http://localhost:5173)
2. Attend que le serveur soit prêt
3. Lance Electron qui charge l'URL locale

**Avantages**:
- ✅ Hot-reload automatique
- ✅ DevTools ouvert
- ✅ Fast refresh

### Debugging

#### Main Process

Ajoutez dans `electron/main.cjs`:

```javascript
console.log('Electron app started');
console.log('App path:', app.getPath('userData'));
```

#### Renderer Process

Ouvrir les DevTools (déjà actif en dev):

```javascript
mainWindow.webContents.openDevTools();
```

---

## Build de Production

### Windows

```bash
npm run electron:build:win
```

**Outputs** (dans `release/`):
- `Neon Vanguard Sector Zero Setup 1.0.0.exe` - Installeur NSIS
- `Neon Vanguard Sector Zero 1.0.0.exe` - Portable

**Configuration NSIS**:
- Installation dans `C:\Program Files\Neon Vanguard Sector Zero`
- Raccourci desktop optionnel
- Raccourci menu démarrer
- Désinstalleur inclus

### macOS

```bash
npm run electron:build:mac
```

**Requirements**:
- macOS 10.13+
- Xcode Command Line Tools

**Outputs**:
- `Neon Vanguard Sector Zero-1.0.0.dmg` - Image disque
- `Neon Vanguard Sector Zero-1.0.0-mac.zip` - Archive

### Linux

```bash
npm run electron:build:linux
```

**Outputs**:
- `Neon Vanguard Sector Zero-1.0.0.AppImage` - AppImage universelle
- `neon-vanguard-sector-zero_1.0.0_amd64.deb` - Debian/Ubuntu
- `neon-vanguard-sector-zero-1.0.0.x86_64.rpm` - Fedora/RHEL

---

## Distribution

### Taille des Builds

| Platform | Format | Taille (approx) |
|----------|--------|-----------------|
| Windows | NSIS | ~150 MB |
| Windows | Portable | ~140 MB |
| macOS | DMG | ~160 MB |
| Linux | AppImage | ~155 MB |

### Réduire la Taille

1. **Supprimer DevDependencies**:
   ```bash
   npm prune --production
   ```

2. **Compression dans electron-builder**:
   ```json
   "build": {
     "compression": "maximum",
     "asar": true
   }
   ```

3. **Tree-shaking Vite**:
   - Déjà actif par défaut
   - Supprime le code mort

### Upload vers GitHub Releases

1. **Tag la version**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Créer la release GitHub**:
   - Aller sur GitHub Releases
   - "Draft a new release"
   - Sélectionner le tag `v1.0.0`
   - Upload les fichiers depuis `release/`

3. **Fichiers à upload**:
   - Windows: `.exe` (installer + portable)
   - macOS: `.dmg`
   - Linux: `.AppImage`, `.deb`, `.rpm`
   - `latest.yml` / `latest-mac.yml` (pour auto-update)

---

## Signature et Notarization

### Windows Code Signing

**Requirements**:
- Certificat code signing (.pfx ou .p12)
- Password du certificat

**Configuration**:

```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "password",
  "signingHashAlgorithms": ["sha256"],
  "signDlls": true
}
```

**Via environment variables** (recommandé):

```bash
set CSC_LINK=path/to/certificate.pfx
set CSC_KEY_PASSWORD=password
npm run electron:build:win
```

### macOS Code Signing & Notarization

**Requirements**:
- Apple Developer Account ($99/an)
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

## Updates Automatiques

### Avec electron-updater

1. **Installation**:
   ```bash
   npm install electron-updater
   ```

2. **Configuration dans main.cjs**:

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

4. **Publier update**:

   ```bash
   npm run electron:build -- --publish always
   ```

---

## Troubleshooting

### "Application can't be opened" (macOS)

**Cause**: App non signée.

**Solution**:
1. Clic droit → Ouvrir
2. OU: `xattr -cr /Applications/Neon\ Vanguard.app`

### "Windows protected your PC" (Windows)

**Cause**: App non signée ou certificat non reconnu.

**Solutions**:
- Obtenir certificat code signing
- OU: Cliquer "More info" → "Run anyway"

### Build échoue avec "Cannot find module"

**Cause**: Mauvais paths dans electron/main.cjs.

**Solution**: Vérifier:

```javascript
// DEV
mainWindow.loadURL('http://localhost:5173');

// PROD
mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
```

### Blank screen après build

**Causes possibles**:
1. **Base URL incorrecte**: Dans `vite.config.ts`, s'assurer `base: './'`
2. **Paths assets**: Vérifier chemins dans `index.html`
3. **CSP headers**: Désactiver ou ajuster Content Security Policy

**Debug**:

```javascript
// Dans main.cjs
mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('Failed to load:', errorCode, errorDescription);
});

mainWindow.webContents.on('console-message', (event, level, message) => {
  console.log('Console:', message);
});
```

### App trop lourde

**Solutions**:
1. Activer `asar: true` dans build config
2. `compression: "maximum"`
3. Supprimer node_modules inutiles
4. Ne pas inclure `src/` dans files (seulement `dist/`)

---

## Ressources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto-Update Guide](https://www.electron.build/auto-update)

---

**Dernière mise à jour**: 2025-12-09
