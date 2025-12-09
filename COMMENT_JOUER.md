# 🎮 Comment Jouer - Neon Vanguard: Sector Zero

## ✅ SOLUTION SIMPLE QUI MARCHE (Recommandé)

### Double-cliquez sur: `JOUER.bat`

C'est tout! Le fichier va:
1. Démarrer le serveur automatiquement
2. Ouvrir le jeu dans votre navigateur
3. Le jeu est prêt à jouer!

**Important**: Ne fermez pas la fenêtre noire tant que vous jouez.

---

## 🌐 Solution Alternative: Manuellement

Si le fichier .bat ne marche pas:

```powershell
# 1. Ouvrir PowerShell dans ce dossier
npm run dev

# 2. Ouvrir votre navigateur à:
http://localhost:5173
```

---

## ♿ Pour NVDA (Lecteur d'Écran)

Le jeu fonctionne avec NVDA dans le navigateur:

1. Lancez `JOUER.bat`
2. Le jeu s'ouvre dans Chrome/Firefox  
3. Utilisez **Tab** pour naviguer
4. **Enter/Espace** pour activer les boutons
5. Les événements de combat sont annoncés

---

## ❓ Problèmes?

### Le port 5173 est déjà utilisé

```powershell
# Trouver ce qui utilise le port
netstat -ano | findstr :5173

# Tuer le processus (remplacez PID)
taskkill /PID <numéro> /F
```

### Le navigateur ne s'ouvre pas

Ouvrez manuellement: http://localhost:5173

### Erreur "npm not found"

Assurez-vous que Node.js est installé: https://nodejs.org

---

## 🎯 Pourquoi Pas l'EXE?

L'application Electron nécessite une configuration complexe.  
Cette solution web est:
- ✅ Plus simple
- ✅ Fonctionne à coup sûr
- ✅ Meilleure compatibilité NVDA
- ✅ Pas de problèmes de build

---

**Amusez-vous bien! 🚀**
