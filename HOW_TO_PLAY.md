# 🎮 How to Play - Neon Vanguard: Sector Zero

## ✅ SIMPLE SOLUTION THAT WORKS (Recommended)

### Double-click on: `PLAY.bat`

That's it! The file will:
1. Start the server automatically
2. Open the game in your browser
3. The game is ready to play!

**Important**: Don't close the black window while you're playing.

---

## 🌐 Alternative Solution: Manually

If the .bat file doesn't work:

```powershell
# 1. Open PowerShell in this folder
npm run dev

# 2. Open your browser at:
http://localhost:5173
```

---

## ♿ For NVDA (Screen Reader)

The game works with NVDA in the browser:

1. Launch `PLAY.bat`
2. The game opens in Chrome/Firefox  
3. Use **Tab** to navigate
4. **Enter/Space** to activate buttons
5. Combat events are announced

---

## ❓ Problems?

### Port 5173 is already in use

```powershell
# Find what's using the port
netstat -ano | findstr :5173

# Kill the process (replace PID)
taskkill /PID <number> /F
```

### Browser doesn't open

Open manually: http://localhost:5173

### Error "npm not found"

Make sure Node.js is installed: https://nodejs.org

---

## 🎯 Why Not the EXE?

The Electron application requires complex configuration.  
This web solution is:
- ✅ Simpler
- ✅ Works for sure
- ✅ Better NVDA compatibility
- ✅ No build issues

---

**Have fun! 🚀**
