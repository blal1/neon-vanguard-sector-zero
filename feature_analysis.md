\### 2. GHOST Pilot Not Implemented

\*\*Location\*\*: \[types.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/types.ts#L18)



\*\*Current State\*\*: `PilotId.GHOST` is defined in the enum but:

\- No talent tree exists in \[talents.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/constants/talents.ts) (only VANGUARD, SOLARIS, HYDRA, WYRM)

\- No pilot config found in constants

\- Mods folder has \[mods/pilots/ghost.json](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/mods/pilots/ghost.json) suggesting it's mod content



\*\*Recommendation\*\*: Either implement GHOST as a base pilot or document it as mod-only content.



---



\### 3. Mission Types Partially Implemented

\*\*Location\*\*: \[types.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/types.ts#L29)



\*\*Current State\*\*: 

\- `ASSAULT`: Fully implemented ✅

\- `DEFENSE`: UI exists (`coreHp` state) but mechanics are basic

\- `SURVIVAL`: Timer exists but lacks distinct gameplay



\*\*Missing for DEFENSE\*\*:

\- Core/objective visual representation

\- Enemies targeting the objective

\- Priority system for objective vs player



\*\*Missing for SURVIVAL\*\*:

\- Wave spawning during timer

\- Escalating difficulty during survival

\- Bonus rewards for surviving longer



---



\### 4. Crafting System Underutilized

\*\*Location\*\*: \[CraftingPanel.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/CraftingPanel.tsx)



\*\*Current State\*\*: The crafting panel exists but:

\- Only 2 special recipes defined (MEGA-STIM, CRYO-BOMB)

\- No visual feedback for crafting success

\- Limited integration with Hangar shop



\*\*Recommendation\*\*: 

\- Add 5-10 more recipes

\- Add crafting animations/sounds

\- Show crafted items in a "crafted" category



---



\### 5. Daily Modifiers Logic Incomplete

\*\*Location\*\*: \[combatUtils.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/utils/combatUtils.ts)



\*\*Defined Modifiers\*\*: `DOUBLE\_HAZARDS`, `BOSS\_RUSH`, `PACIFIST`, `NONE`



\*\*Current Implementation\*\*:

\- Parameter passed to \[generateEnemies()](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/utils/combatUtils.ts#425-511) but effects are minimal

\- No UI indicator during combat showing active modifier

\- PACIFIST logic not fully tied to consumable hiding



\*\*Recommendation\*\*: Implement full modifier effects and display them prominently.



---



\### 6. Weak Points System Defined but Unused



\*\*Location\*\*: \[types.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/types.ts)



\*\*Current State\*\*: \[Enemy](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/types.ts#196-214) interface has `weakPoint?: WeakPoint` but:

\- No weak point generation logic

\- No UI indicator for weak points

\- No bonus damage calculation for hitting weak points



\*\*Recommendation\*\*: Implement weak point system with visual indicators and bonus damage.



---



\### 7. Synergy System Needs More Content

\*\*Location\*\*: \[synergyUtils.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/utils/synergyUtils.ts)



\*\*Current State\*\*: 

\- Only 1 synergy defined

\- `getActiveSynergies()` exists but rarely triggers

\- Augmentation synergies have 5+ but lack visual feedback



\*\*Recommendation\*\*: 

\- Add 5+ talent synergies

\- Add synergy activation notification

\- Show synergy bonuses in stats panel



---



\### 8. Replay System Export Missing

\*\*Location\*\*: \[ReplayViewer.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/ReplayViewer.tsx)



\*\*Current State\*\*: Replays can be saved and viewed but:

\- No export functionality (share replays)

\- No import functionality

\- No replay speed control (slow-mo, fast-forward)



\*\*Recommendation\*\*: Add export to file, import, and playback speed controls.



---



\## 🟡 MEDIUM PRIORITY: Missing Features



\### 9. Settings Screen Not Found

\*\*Issue\*\*: \[ARCHITECTURE.md](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/docs/ARCHITECTURE.md) references `SettingsScreen.tsx` but this component doesn't exist.



\*\*Workaround\*\*: Settings are accessed via \[AudioSettings.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/components/AudioSettings.tsx), \[VisualSettings.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/components/VisualSettings.tsx), \[KeybindingSettings.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/components/KeybindingSettings.tsx) individually.



\*\*Recommendation\*\*: Create unified `SettingsScreen.tsx` with tabs for all settings.



---



\### 10. Leaderboard System Missing

\*\*Current State\*\*: No competitive features exist.



\*\*Recommendation\*\*: Add:

\- Local leaderboard (best times, highest waves, most kills)

\- Optional cloud sync for global leaderboards

\- Achievement comparisons



---



\### 11. Tutorial System Incomplete

\*\*Location\*\*: \[TutorialModal.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/TutorialModal.tsx)



\*\*Current State\*\*: Basic tutorial modal exists but:

\- Only shows on first play

\- No contextual help during gameplay

\- No interactive tutorial (hands-on learning)



\*\*Recommendation\*\*: Add contextual tooltips and a guided first-run experience.



---



\### 12. Story/Narrative Expansion Needed

\*\*Location\*\*: \[NarrativeScreen.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/NarrativeScreen.tsx)



\*\*Current State\*\*: Component exists but:

\- Only 2.3KB of content

\- Not prominently featured in game flow

\- No branching narratives



\*\*Recommendation\*\*: 

\- Add more lore entries

\- Include narrative between stages

\- Add pilot-specific storylines



---



\### 13. Statistics Dashboard Enhancement

\*\*Location\*\*: \[StatsScreen.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/StatsScreen.tsx)



\*\*Good\*\*: Comprehensive stats tracking exists.



\*\*Missing\*\*:

\- Historical graphs (damage over time, kill rate)

\- Session vs All-time toggle

\- Export stats to file



---



\### 14. Audio Files Are Placeholder Quality

\*\*Location\*\*: \[public/audio/](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/public/audio/)



\*\*Current State\*\*: 24 audio files exist but:

\- Music files are ~700KB each (very short loops)

\- No variations for sound effects

\- Generated via \[generatePlaceholderAudio.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/scripts/generatePlaceholderAudio.ts)



\*\*Recommendation\*\*: Replace with higher-quality, longer audio tracks.



---



\### 15. Voice Lines Service Underutilized

\*\*Location\*\*: \[voiceLineService.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/services/voiceLineService.ts)



\*\*Current State\*\*: Service exists but:

\- Uses TTS for all voice lines (no pre-recorded audio)

\- Limited contextual triggers

\- No pilot personality through voice



\*\*Recommendation\*\*: Add more contextual voice lines and consider pre-recorded audio.



---



\### 16. Modding System Documentation Incomplete

\*\*Location\*\*: \[MODDING\_GUIDE.md](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/MODDING\_GUIDE.md)



\*\*Current State\*\*: 

\- 5.7KB of documentation

\- Missing: Events modding, augmentation modding, talents modding



\*\*Recommendation\*\*: Expand guide with complete API reference and examples.



---



\### 17. Codex Entry Filtering Missing

\*\*Location\*\*: \[CodexScreen.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/CodexScreen.tsx)



\*\*Current State\*\*: Codex entries can be unlocked and viewed but:

\- No search functionality

\- No category filtering

\- No "favorites" or bookmarks



\*\*Recommendation\*\*: Add search bar and category tabs.



---



\### 18. Endless Mode Lacks Variety

\*\*Location\*\*: \[EndlessWaveScreen.tsx](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw!App/neon-vanguard\_-sector-zero/components/EndlessWaveScreen.tsx)



\*\*Current State\*\*: Basic endless mode works.



\*\*Missing\*\*:

\- Mini-bosses every 10 waves

\- Random events/blessings

\- Leaderboard integration

\- "Breather" waves with shops



---



\### 19. Character Portraits/Art Missing

\*\*Current State\*\*: Pilots display emoji/text symbols only.



\*\*Recommendation\*\*: Add illustrated pilot portraits for:

\- Character select screen

\- Combat HUD

\- Victory/Defeat screens



---



\### 20. Consumable Hotbar Missing

\*\*Current State\*\*: Consumables are listed but require clicking.



\*\*Recommendation\*\*: Add hotbar (1-4 keys) for quick consumable use in combat.



---



\## 🟢 LOW PRIORITY: Nice-to-Have Features



\### 21. Controller/Gamepad Support

\*\*Current State\*\*: Keyboard + Mouse only.



\### 22. Screen Reader Enhancements

\*\*Current State\*\*: Basic ARIA labels exist but could be more comprehensive.



\### 23. Custom Difficulty Creator

\*\*Current State\*\*: 4 fixed difficulty presets.



\### 24. Achievement Rarity Statistics

\*\*Current State\*\*: No global unlock percentages.



\### 25. Cloud Save Support

\*\*Current State\*\*: LocalStorage only.



\### 26. Steam/Discord Rich Presence

\*\*Current State\*\*: Electron app has no platform integration.



\### 27. Challenge Modes

\*\*Current State\*\*: Only standard and endless modes.



\### 28. Daily/Weekly Challenges

\*\*Current State\*\*: Daily modifiers exist but no rotating challenges.



\### 29. Pilot Skins/Customization

\*\*Current State\*\*: Pilots have fixed appearance.



\### 30. Combat Log Export

\*\*Current State\*\*: Logs are session-only.



---



\## 🔧 TECHNICAL DEBT



\### TD-1. CombatScreen.tsx is 1525 Lines

\*\*Issue\*\*: Single file handling all combat logic.

\*\*Recommendation\*\*: Extract into smaller hooks/components:

\- `useCombatLogic.ts`

\- `useBossLogic.ts`

\- `PlayerHUD.tsx`

\- `EnemyList.tsx`



\### TD-2. Constants.ts is 1116 Lines

\*\*Issue\*\*: All game data in one file.

\*\*Recommendation\*\*: Split into:

\- `constants/pilots.ts`

\- `constants/enemies.ts`

\- `constants/consumables.ts`

\- `constants/bosses.ts`



\### TD-3. Inconsistent Type Locations

\*\*Issue\*\*: Types split between \[/types.ts](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview\_g9c9v27vpyspw%21App/neon-vanguard\_-sector-zero/types.ts), `/types/`, and inline.

\*\*Recommendation\*\*: Consolidate all types in `/types/` directory.



\### TD-4. Test Coverage Sparse

\*\*Issue\*\*: Only 5 test files for 44 components.

\*\*Recommendation\*\*: Aim for 80%+ coverage on utils and key components.



\### TD-5. Documentation in French

\*\*Issue\*\*: `ARCHITECTURE.md` is in French.

\*\*Recommendation\*\*: Convert to English (completed per earlier request).



---



\## 📊 Summary Table



| Priority | Category | Count | Effort Estimate |

|----------|----------|-------|-----------------|

| 🔴 High | Incomplete Features | 8 | 20-40 hours |

| 🟡 Medium | Missing Features | 12 | 30-50 hours |

| 🟢 Low | Nice-to-Have | 10 | 40-60 hours |

| 🔧 Tech Debt | Refactoring | 5 | 10-15 hours |



---



\## Recommended Implementation Order



1\. \*\*Phase 1 (Quick Wins)\*\*: Visual effects integration, Weak points, Synergy notifications

2\. \*\*Phase 2 (Core)\*\*: Mission types completion, GHOST pilot, Crafting expansion

3\. \*\*Phase 3 (Polish)\*\*: Settings screen, Leaderboards, Tutorial improvement

4\. \*\*Phase 4 (Content)\*\*: Audio replacement, Voice lines, Story expansion

5\. \*\*Phase 5 (Technical)\*\*: Refactoring CombatScreen, Test coverage



---



\## Files Analyzed



| Directory | Files | Key Findings |

|-----------|-------|---------------|

| `/components` | 44 | CombatScreen needs refactoring |

| `/services` | 3 | Voice line service underutilized |

| `/utils` | 8 | Good test coverage for combatUtils |

| `/constants` | 5 | Needs splitting |

| `/types` | 3 | Good typing overall |

| `/context` | 3 | GameContext is comprehensive |

| `/mods` | 4 | Modding framework exists |

| `/public/audio` | 24 | Placeholder quality |



---



\*Generated by comprehensive codebase analysis\*



