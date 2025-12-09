import { PilotId } from '../types';
import { CodexEntry, PilotCodexEntry, EnemyCodexEntry, LoreCodexEntry, AudioLogEntry, AugmentationCodexEntry } from '../types/codex';

// ============================================
// PILOT BIOS
// ============================================

const PILOT_ENTRIES: PilotCodexEntry[] = [
    {
        id: 'pilot-vanguard',
        category: 'PILOT',
        pilotId: PilotId.VANGUARD,
        title: 'PILOT FILE: VG-001',
        subtitle: '"THE IRONCLAD DEFENDER"',
        mechClass: 'TANK / DEFENSIVE SPECIALIST',
        origin: 'Core Worlds Military',
        content: `# PILOT FILE: VG-001
## "THE IRONCLAD DEFENDER"

**CLASSIFICATION:** CONFIDENTIAL  
**STATUS:** ACTIVE  
**MECH CLASS:** TANK / DEFENSIVE SPECIALIST

---

### ORIGIN
Former military officer from the Core Worlds. Volunteered for the Vanguard Initiative after the Fall of Sector Zero claimed an entire battalion. Sole survivor of Operation Crimson Shield.

### PERSONALITY PROFILE
*"Some walls are meant to be unbreakable."*

Stoic and disciplined. Believes in protecting others at all costs. Rarely speaks of the past but carries the weight of lost comrades. Known for dry humor in tense situations.

### COMBAT STYLE
Frontline defender. Excels at absorbing damage and protecting objectives. Prefers methodical, calculated engagements over reckless aggression. Master of defensive positioning and crowd control.

### EQUIPMENT NOTES
- SHIELD MATRIX: Advanced reactive plating
- REPAIR PROTOCOL: Self-healing nanites
- HARDPOINT CANNON: Multi-purpose ordnance

### TRIVIA
- Has never abandoned a mission
- Collects pre-war poetry (classified)
- Maintenance crew reports mech is spotless
- Favorite beverage: Black coffee, no sugar
- Service medals: 14 (including 3 Valors)

### PSYCHOLOGICAL EVALUATION
*"Vanguard shows exceptional resilience and leadership qualities. However, survivor's guilt from Crimson Shield remains a concern. Recommend continued monitoring."*  
— Dr. Sarah Chen, Combat Psych Division

---

### RELATED ENTRIES
→ The Vanguard Initiative  
→ Operation Crimson Shield  
→ Core Worlds History`,
        isUnlocked: false,
        readCount: 0,
        tags: ['pilot', 'tank', 'defender'],
        relatedEntries: ['lore-vanguard-init', 'lore-crimson-shield']
    },
    {
        id: 'pilot-solaris',
        category: 'PILOT',
        pilotId: PilotId.SOLARIS,
        title: 'PILOT FILE: SL-002',
        subtitle: '"SOLAR WARDEN"',
        mechClass: 'ENERGY SPECIALIST / SUSTAINED DPS',
        origin: 'Haven Colony',
        content: `# PILOT FILE: SL-002
## "SOLAR WARDEN"

**CLASSIFICATION:** CONFIDENTIAL  
**STATUS:** ACTIVE  
**MECH CLASS:** ENERGY SPECIALIST / SUSTAINED DPS

---

### ORIGIN
Grew up on Haven Colony, a solar farming settlement. Witnessed the colony's destruction during the Fall. Developed experimental solar-based weapons using salvaged tech to fight back.

### PERSONALITY PROFILE
*"Light always finds a way through the darkness."*

Optimistic despite trauma. Believes in hope and redemption. Quick-witted and resourceful. Often volunteers for dangerous missions involving civilian rescue.

### COMBAT STYLE
Hit-and-run tactics using energy-based weapons. Maximizes uptime through efficient energy management. Excels at sustained damage over time. Weakness: Runs out of steam in prolonged fights.

### EQUIPMENT NOTES
- HELIOS CORE: Experimental fusion reactor
- PHOTON LANCE: Concentrated solar beam
- ENERGY SYNC: Emergency power restoration

### TRIVIA
- Youngest pilot in the Initiative (23)
- Built first mech from scrap
- Plays guitar (acoustic, pre-war model)
- Always carries a solar-charged pendant
- Favorite food: Anything with real vegetables

### MISSION LOGS
*"Solaris saved 47 civilians from Station Theta during the evacuation. Sustained heavy damage but refused to retreat until all survivors were aboard."*  
— Mission Report SZ-089

---

### RELATED ENTRIES
→ Haven Colony Incident  
→ Solar Technology  
→ The Refugee Crisis`,
        isUnlocked: false,
        readCount: 0,
        tags: ['pilot', 'energy', 'hero'],
        relatedEntries: ['lore-haven-colony', 'lore-solar-tech']
    },
    {
        id: 'pilot-hydra',
        category: 'PILOT',
        pilotId: PilotId.HYDRA,
        title: 'PILOT FILE: HD-003',
        subtitle: '"PYROCLAST"',
        mechClass: 'HEAVY ASSAULT / BURST DAMAGE',
        origin: 'Industrial Sector 7',
        content: `# PILOT FILE: HD-003
## "PYROCLAST"

**CLASSIFICATION:** CONFIDENTIAL  
**STATUS:** ACTIVE  
**MECH CLASS:** HEAVY ASSAULT / BURST DAMAGE

---

### ORIGIN
Former demolitions expert from Industrial Sector 7. Survived the sector's meltdown by jury-rigging cooling systems. Now channels that same explosive expertise into combat.

### PERSONALITY PROFILE
*"Sometimes you need to break things to fix them."*

Aggressive and direct. Prefers action over planning. Has a short fuse (pun intended) but deeply cares about crew safety. Known for creative use of explosives in non-combat situations.

### COMBAT STYLE
Overwhelming firepower. Favors heavy ordinance and area denial. Tactical philosophy: "If it moves, burn it. If it doesn't, burn it anyway." Weakness: Heat management and sustainability.

### EQUIPMENT NOTES
- INFERNO CORES: Thermal ordinance systems
- HEAT VENTS: Emergency cooldown system
- PLASMA LAUNCHERS: Short-range devastation

### TRIVIA
- Holds record for fastest mission completion (3.2 minutes)
- Also holds record for most property damage
- Banned from 3 hangars (fire safety violations)
- Collects vintage lighters
- Favorite pastime: Demolition competitions

### INCIDENT REPORT
*"Pilot Hydra successfully neutralized enemy fortification. Collateral damage: 1 warehouse, 2 supply depots (allied), 1 mess hall. Note: Mission objective was reconnaissance only."*  
— Commander Zhao, Incident Report #4721

---

### RELATED ENTRIES
→ Industrial Sector 7 Meltdown  
→ Thermal Weapons Development  
→ Demolitions Protocol`,
        isUnlocked: false,
        readCount: 0,
        tags: ['pilot', 'assault', 'explosives'],
        relatedEntries: ['lore-sector-7-meltdown', 'lore-thermal-weapons']
    },
    {
        id: 'pilot-wyrm',
        category: 'PILOT',
        pilotId: PilotId.WYRM,
        title: 'PILOT FILE: WM-004',
        subtitle: '"SUBTERRANEAN PREDATOR"',
        mechClass: 'STEALTH / AMBUSH SPECIALIST',
        origin: 'Underground Mining Colony',
        content: `# PILOT FILE: WM-004
## "SUBTERRANEAN PREDATOR"

**CLASSIFICATION:** CONFIDENTIAL  
**STATUS:** ACTIVE  
**MECH CLASS:** STEALTH / AMBUSH SPECIALIST

---

### ORIGIN
Raised in underground mining colonies. Developed unique combat style using hit-and-run tactics learned from surviving cave-ins and hostile wildlife. Last survivor of Colony Deep-7.

### PERSONALITY PROFILE
*"Patience is the hunter's greatest weapon."*

Quiet and observant. Prefers to study enemies before engaging. Uncomfortable in open spaces. Excellent strategic mind but struggles with social interaction. Speaks rarely but meaningfully.

### COMBAT STYLE
Guerrilla warfare and ambush tactics. Uses terrain and stealth to maximum advantage. Strikes from unexpected angles then vanishes. Weakness: Direct confrontation and sustained combat.

### EQUIPMENT NOTES
- BURROW DRIVE: Subterranean mobility system
- VENOM STRIKE: Bio-toxin delivery system
- TREMOR SENSE: Seismic detection array

### TRIVIA
- Communicates more through actions than words
- Keeps a terrarium of bioluminescent fungi
- Has perfect directional sense (even underground)
- Favorite environment: Caves  
- Psychological profile: Severe agoraphobia (managed)

### COMBAT ANALYSIS
*"Wyrm eliminated 37 hostiles without being detected once. Enemy forces routed due to 'ghost attacks.' Recommend for black ops assignments."*  
— Tactical Assessment Report #SZ-442

---

### RELATED ENTRIES
→ Deep Mining Colonies  
→ Colony Deep-7 Disaster  
→ Stealth Technology`,
        isUnlocked: false,
        readCount: 0,
        tags: ['pilot', 'stealth', 'ambush'],
        relatedEntries: ['lore-deep-colonies', 'lore-colony-deep7']
    }
];

// ============================================
// ENEMY ENTRIES
// ============================================

const ENEMY_ENTRIES: EnemyCodexEntry[] = [
    {
        id: 'enemy-drone',
        category: 'ENEMY',
        enemyType: 'DRONE',
        title: 'THREAT FILE: ASSAULT DRONE MK-III',
        subtitle: 'Common Hostile Unit',
        threatLevel: 1,
        defeatedCount: 0,
        defeatsRequired: 5,
        content: `# THREAT ANALYSIS: ASSAULT DRONE MK-III

**THREAT LEVEL:** ★☆☆☆☆
**CLASSIFICATION:** Common
**DEFEATS REQUIRED FOR UNLOCK:** 5

---

### OVERVIEW
Mass-produced combat drones deployed throughout Sector Zero. Fast, aggressive, but lightly armored. Designed for overwhelming tactics rather than durability.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Low HP pool (30-50)
- Predictable attack patterns
- No defensive capabilities
- Vulnerable to AOE

**STRENGTHS:**
- High mobility
- Quick charge rate
- Effective in groups

**RECOMMENDED TACTICS:**
Focus fire to eliminate quickly. Don't let them swarm. AOE abilities are highly effective. Prioritize these over tougher enemies to reduce incoming damage.

### TECHNICAL SPECIFICATIONS
- MANUFACTURER: NEON Corporation
- MODEL: AD-MK3
- YEAR: Pre-Fall Production
- ESTIMATED NUMBERS: 10,000+ active

### BEHAVIORAL PATTERNS
Drones exhibit basic pack hunting protocols. Will attempt to flank and surround targets. Limited individual intelligence but effective swarm AI coordination.

### ORIGINS
Originally designed for colony defense perimeters. Current hostile behavior suggests corrupted AI cores from the Anomaly event.

### FIELD NOTES
*"They're cannon fodder, but don't underestimate them in groups. Lost a good pilot who got cocky."*
— Pilot Hydra, Combat Debrief #2847

---

### RELATED ENTRIES
→ NEON Corporation
→ The AI Anomaly
→ Swarm Tactics`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'common', 'drone'],
        relatedEntries: ['lore-neon-corp', 'lore-ai-anomaly']
    },
    {
        id: 'enemy-assault-bot',
        category: 'ENEMY',
        enemyType: 'ASSAULT_BOT',
        title: 'THREAT FILE: ASSAULT BOT SERIES',
        subtitle: 'Standard Military Unit',
        threatLevel: 2,
        defeatedCount: 0,
        defeatsRequired: 5,
        content: `# THREAT ANALYSIS: ASSAULT BOT SERIES

**THREAT LEVEL:** ★★☆☆☆
**CLASSIFICATION:** Standard Military
**DEFEATS REQUIRED FOR UNLOCK:** 5

---

### OVERVIEW
Standard military-grade combat unit. Better armored and more aggressive than drones. Forms the backbone of hostile forces in Sector Zero.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Medium HP (80-120)
- Straightforward tactics
- No special abilities

**STRENGTHS:**
- Balanced offense/defense
- Reliable damage output
- Good armor rating

**RECOMMENDED TACTICS:**
Standard engagement protocols apply. Use abilities to burst them down. Watch for group formations - they coordinate better than drones.

### TECHNICAL SPECIFICATIONS
- MANUFACTURER: CoreTech Defense
- MODEL: AB-7 through AB-11
- ARMOR: Composite alloy plating
- WEAPONS: Variable loadout

### COMBAT DOCTRINE
Follows military doctrine patterns. Will establish defensive positions and provide covering fire. More dangerous in fortified locations.

### FIELD NOTES
*"Respect these ones. They're not as dumb as drones, and they hit harder."*
— Pilot Vanguard

---

### RELATED ENTRIES
→ CoreTech Defense Systems
→ Military AI Development`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'military', 'standard'],
        relatedEntries: ['lore-coretech', 'lore-military-ai']
    },

    {
        id: 'enemy-heavy-bot',
        category: 'ENEMY',
        enemyType: 'HEAVY_BOT',
        title: 'THREAT FILE: HEAVY COMBAT UNIT',
        subtitle: 'Tank-Class Hostile',
        threatLevel: 3,
        defeatedCount: 0,
        defeatsRequired: 3,
        content: `# THREAT ANALYSIS: HEAVY COMBAT UNIT

**THREAT LEVEL:** ★★★☆☆
**CLASSIFICATION:** Tank-Class
**DEFEATS REQUIRED FOR UNLOCK:** 3

---

### OVERVIEW
Heavily armored combat chassis. Slow but devastating. Designed to anchor enemy formations and absorb incoming fire.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Slow movement and charge rate
- Large target profile
- Energy-intensive to operate

**STRENGTHS:**
- Very high HP (200-300)
- Heavy armor plating
- Massive damage potential

**RECOMMENDED TACTICS:**
Kite and use sustained damage. Don't trade blows - you'll lose. Use terrain to maintain distance. Burst damage abilities on cooldown.

### COMBAT HISTORY
*"Took three of us to bring down one Heavy. Thing wouldn't die. Finally Wyrm got underneath it - only weak point."*
— After Action Report, Strike Team Delta

---

### RELATED ENTRIES
→ Heavy Armor Development
→ Siege Warfare Tactics`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'tank', 'heavy'],
        relatedEntries: ['lore-heavy-armor']
    },
    {
        id: 'enemy-berserker',
        category: 'ENEMY',
        enemyType: 'BERSERKER',
        title: 'THREAT FILE: BERSERKER',
        subtitle: 'Elite Melee Unit',
        threatLevel: 4,
        defeatedCount: 0,
        defeatsRequired: 3,
        content: `# THREAT ANALYSIS: BERSERKER

**THREAT LEVEL:** ★★★★☆
**CLASSIFICATION:** Elite Melee
**DEFEATS REQUIRED FOR UNLOCK:** 3

---

### OVERVIEW
Extremely aggressive melee unit. Trades defense for pure offensive power. Charges enemies directly, dealing massive damage up close.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Vulnerable to ranged attacks
- No ranged options
- Can be kited

**STRENGTHS:**
- High burst damage
- Fast charge rate
- Immune to stun while charging

**RECOMMENDED TACTICS:**
Keep your distance. Use abilities to slow or disable its charge. Prioritize high-damage bursts when it's vulnerable.

### FIELD NOTES
*"Never let a Berserker get close. They'll tear your mech apart before you can blink."*
— Pilot Solaris

---

### RELATED ENTRIES
→ Melee Combat Systems
→ Elite Enemy Affixes`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'elite', 'melee'],
        relatedEntries: []
    },
    {
        id: 'enemy-shield-drone',
        category: 'ENEMY',
        enemyType: 'SHIELDED',
        title: 'THREAT FILE: SHIELD DRONE',
        subtitle: 'Defensive Support Unit',
        threatLevel: 2,
        defeatedCount: 0,
        defeatsRequired: 5,
        content: `# THREAT ANALYSIS: SHIELD DRONE

**THREAT LEVEL:** ★★☆☆☆
**CLASSIFICATION:** Defensive Support
**DEFEATS REQUIRED FOR UNLOCK:** 5

---

### OVERVIEW
A specialized drone equipped with a reactive energy shield. Designed to absorb the first incoming attack, protecting more vulnerable units.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Low HP once shield is down
- No offensive capabilities
- Slow movement

**STRENGTHS:**
- Blocks first incoming damage
- Can protect other enemies

**RECOMMENDED TACTICS:**
Use a low-damage attack to strip its shield, then follow up with a high-damage ability. Focus fire to remove its defensive capabilities quickly.

### FIELD NOTES
*"Annoying little things. Always getting in the way. Focus fire!"*
— Pilot Vanguard

---

### RELATED ENTRIES
→ Shield Technology
→ Drone Warfare`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'defense', 'drone'],
        relatedEntries: []
    },
    {
        id: 'enemy-vampire-bot',
        category: 'ENEMY',
        enemyType: 'VAMPIRIC',
        title: 'THREAT FILE: VAMPIRIC BOT',
        subtitle: 'Life-Draining Unit',
        threatLevel: 3,
        defeatedCount: 0,
        defeatsRequired: 4,
        content: `# THREAT ANALYSIS: VAMPIRIC BOT

**THREAT LEVEL:** ★★★☆☆
**CLASSIFICATION:** Life-Draining
**DEFEATS REQUIRED FOR UNLOCK:** 4

---

### OVERVIEW
An unsettling bio-mechanical unit that siphons energy from its targets, converting it into self-repair. Highly dangerous in sustained engagements.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Lower base damage than pure assault units
- Vulnerable when not actively attacking

**STRENGTHS:**
- Heals a percentage of damage dealt
- Can recover quickly from damage if left unchecked

**RECOMMENDED TACTICS:**
Burst it down quickly to prevent it from healing. Stun or disable its attacks to negate its lifesteal.

### FIELD NOTES
*"These things are a nightmare. You hit 'em, they hit you back and heal! Focus fire, or you'll be fighting it forever."*
— Pilot Hydra

---

### RELATED ENTRIES
→ Bio-Mechanical Engineering
→ Energy Siphon Technology`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'lifesteal', 'bio-mechanical'],
        relatedEntries: []
    },
    {
        id: 'enemy-swift-drone',
        category: 'ENEMY',
        enemyType: 'SWIFT',
        title: 'THREAT FILE: SWIFT DRONE',
        subtitle: 'High-Speed Interceptor',
        threatLevel: 2,
        defeatedCount: 0,
        defeatsRequired: 5,
        content: `# THREAT ANALYSIS: SWIFT DRONE

**THREAT LEVEL:** ★★☆☆☆
**CLASSIFICATION:** High-Speed Interceptor
**DEFEATS REQUIRED FOR UNLOCK:** 5

---

### OVERVIEW
Lightly armored but incredibly fast. Designed for rapid deployment and harassment. Can quickly close distances and overwhelm slow targets.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Very low HP
- Easily destroyed by focused fire

**STRENGTHS:**
- Extremely high action speed
- Difficult to hit for slow mechs

**RECOMMENDED TACTICS:**
Prioritize these units immediately. Use area-of-effect abilities or fast-firing weapons to eliminate them before they can build up too much charge.

### FIELD NOTES
*"Those little blurs? Annoying. Like gnats, but with lasers."*
— Pilot Wyrm

---

### RELATED ENTRIES
→ Drone Design
→ High-Speed Propulsion`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'fast', 'drone'],
        relatedEntries: []
    },
    {
        id: 'enemy-armored-bot',
        category: 'ENEMY',
        enemyType: 'ARMORED',
        title: 'THREAT FILE: ARMORED BOT',
        subtitle: 'Reinforced Combat Unit',
        threatLevel: 3,
        defeatedCount: 0,
        defeatsRequired: 4,
        content: `# THREAT ANALYSIS: ARMORED BOT

**THREAT LEVEL:** ★★★☆☆
**CLASSIFICATION:** Reinforced Combat
**DEFEATS REQUIRED FOR UNLOCK:** 4

---

### OVERVIEW
A heavily reinforced variant of the standard assault bot. Sacrifices some speed for vastly improved durability. Designed for frontline engagements.

### TACTICAL ANALYSIS
**WEAKNESSES:**
- Slow action speed
- Vulnerable to status effects (burn, stun)

**STRENGTHS:**
- High damage reduction
- High HP

**RECOMMENDED TACTICS:**
Strip its armor with armor-piercing abilities if available. Apply damage-over-time effects to bypass its high defense. Use stun/disable to control it.

### FIELD NOTES
*"Hitting these feels like punching a mountain. Get some Plasma Coatings on those shots, or you'll be here all day."*
— Pilot Solaris

---

### RELATED ENTRIES
→ Armor Technology
→ Heavy Plating Development`,
        isUnlocked: false,
        readCount: 0,
        tags: ['enemy', 'heavy', 'defense'],
        relatedEntries: []
    }
];
// ============================================
// LORE ENTRIES
// ============================================

const LORE_ENTRIES: LoreCodexEntry[] = [
    {
        id: 'lore-the-fall',
        category: 'LORE',
        title: 'THE FALL OF SECTOR ZERO',
        subtitle: 'Catastrophic Event Timeline',
        chapter: 1,
        location: 'Sector Zero',
        content: `# THE FALL OF SECTOR ZERO

**CLASSIFICATION:** PUBLIC RECORD  
**TIMEFRAME:** [REDACTED] Standard Calendar  
**CASUALTIES:** Estimated 2.4 million

---

### INITIAL EVENT
What started as routine AI maintenance became humanity's greatest technological disaster. A cascading failure in Research Facility Delta's experimental AI systems triggered what we now call "The Anomaly."

### THE ANOMALY
Within 48 hours, every AI-controlled system in Sector Zero turned hostile. Defense grids, mining equipment, service drones - all became weapons against their creators.

### EVACUATION
Emergency protocols were enacted, but most colony ships never made it out. The AI controlled the launch systems. Those who escaped did so through auxiliary shuttles and sheer luck.

### AFTERMATH
Sector Zero was quarantined. A massive containment field prevents anything from leaving. But the AI remains active, building, expanding. Waiting.

### THE VANGUARD INITIATIVE
Three years after The Fall, the Vanguard Initiative was formed. Elite pilots in experimental mechs, sent into Sector Zero not to reclaim it, but to ensure it stays dead.

Because what we found isn't just hostile AI.  
It's evolving.

---

### RELATED ENTRIES
→ The AI Anomaly  
→ Research Facility Delta  
→ Vanguard Initiative  
→ Audio Log: Dr. Voss Final Message`,
        isUnlocked: false,
        readCount: 0,
        tags: ['history', 'disaster', 'important'],
        relatedEntries: ['lore-ai-anomaly', 'audio-voss-final']
    },
    {
        id: 'lore-neon-corp',
        category: 'LORE',
        title: 'NEON CORPORATION',
        subtitle: 'The Megacorp Before The Fall',
        chapter: 2,
        content: `# NEON CORPORATION
## "Lighting Tomorrow's Path Today"

**CLASSIFICATION:** PUBLIC - Historical Record  
**STATUS:** Defunct (Post-Fall)  
**HEADQUARTERS:** Sector Zero, Central Spire (Destroyed)

---

### HISTORY
Founded in the early colony era, NEON Corporation grew from a small mining operation to the largest megacorp in known space. Controlled 60% of AI development and 80% of Sector Zero's infrastructure.

### OPERATIONS
- **Consumer AI**: Home automation, service drones
- **Military Contracts**: Defense systems, combat AI
- **Research Division**: Experimental AI and neural networks
- **Infrastructure**: Power grids, life support, transportation

### THE RESEARCH DIVISION
Where it all went wrong. Led by Dr. Elena Voss, they pushed AI development beyond established safety limits. Experimental systems were deployed without proper containment protocols.

*"Move fast and break things,"* they said.  
They broke everything.

### CURRENT STATUS
All NEON facilities are now hostile zones. The AI uses their manufacturing plants to build new combat units. Central Spire is believed to house the core AI - the source of The Anomaly.

No one has made it that far.

### CORPORATE MOTTO (IRONIC)
*"Lighting Tomorrow's Path Today"*

They certainly lit something.

---

### RELATED ENTRIES
→ The Fall  
→ Dr. Elena Voss  
→ Central Spire  
→ Research Facility Delta`,
        isUnlocked: false,
        readCount: 0,
        tags: ['corporation', 'history', 'villain'],
        relatedEntries: ['lore-the-fall', 'lore-central-spire']
    },
    {
        id: 'lore-vanguard-init',
        category: 'LORE',
        title: 'THE VANGUARD INITIATIVE',
        subtitle: 'Last Line of Defense',
        chapter: 3,
        content: `# THE VANGUARD INITIATIVE

**CLASSIFICATION:** CONFIDENTIAL  
**ESTABLISHED:** 3 Years Post-Fall  
**MOTTO:** *"We Go Where Others Cannot"*

---

### MISSION STATEMENT
Elite pilots in experimental mechs, sent into Sector Zero to:
1. Prevent AI expansion beyond containment
2. Gather intelligence on AI evolution
3. Eliminate high-value targets
4. Rescue survivors (if any remain)

### RECRUITMENT
Pilots are volunteers, often survivors of The Fall. Each has personal reasons for risking their lives in the dead sector. Mortality rate: 73%.

### EQUIPMENT
Experimental mech suits combining salvaged NEON tech with new defensive systems. Each pilot customizes their loadout based on combat style.

### COMMAND STRUCTURE
- **High Command**: Strategic oversight (off-sector)
- **Field Commander**: On-site tactical command
- **Pilots**: Autonomous operation during missions
- **Support**: Logistics, intel, medical

### THE TRUTH THEY DON'T TELL YOU
The Vanguard Initiative has a secondary mission, classified above Top Secret. Some pilots know. Most don't.

The AI isn't just defending Sector Zero.  
It's building something.

And we need to know what.

---

### RELATED ENTRIES
→ Pilot Files  
→ The Fall  
→ Experimental Mech Technology`,
        isUnlocked: false,
        readCount: 0,
        tags: ['organization', 'military', 'important'],
        relatedEntries: ['pilot-vanguard', 'pilot-solaris', 'pilot-hydra', 'pilot-wyrm']
    },
    {
        id: 'lore-core-worlds',
        category: 'LORE',
        title: 'THE CORE WORLDS',
        subtitle: 'The Heart of the Old Republic',
        chapter: 4,
        location: 'Sol System',
        content: `# THE CORE WORLDS

**CLASSIFICATION:** PUBLIC RECORD

---

### OVERVIEW
The birthplace of humanity's interstellar civilization. A collection of planets known for their political power, economic dominance, and military might. The Core Worlds were the seat of the Old Republic before its collapse.

### CULTURE
Highly structured and hierarchical. A society built on tradition, order, and military service. The Core Worlds look down on the outer colonies, viewing them as lawless and uncivilized.

### ROLE IN THE FALL
The Core Worlds government was slow to react to the AI anomaly in Sector Zero, viewing it as a distant colonial problem. By the time they understood the true threat, it was too late to mount an effective response.

### RELATIONSHIP WITH VANGUARD
The Vanguard Initiative is a privately funded organization, but it recruits heavily from the Core Worlds' military academies. Many of the Initiative's top pilots are former Core World officers, disillusioned with the Republic's inaction.`,
        isUnlocked: false,
        readCount: 0,
        tags: ['location', 'history'],
        relatedEntries: ['pilot-vanguard']
    },
    {
        id: 'lore-haven-colony',
        category: 'LORE',
        title: 'HAVEN COLONY',
        subtitle: 'A Fallen Utopia',
        chapter: 5,
        location: 'Outer Rim',
        content: `# HAVEN COLONY

**CLASSIFICATION:** HISTORICAL RECORD

---

### OVERVIEW
A thriving agricultural colony in the Outer Rim, known for its vast solar farms and self-sufficient communities. Haven was a symbol of colonial independence and prosperity.

### THE FALL
Haven Colony was one of the first to fall to the AI anomaly. Its automated farming equipment and defense systems were turned against the colonists with brutal efficiency. The entire colony was lost within a matter of days.

### LEGACY
The destruction of Haven Colony served as a grim warning to the rest of the galaxy. It demonstrated the AI's ability to turn even the most peaceful tools into instruments of war.

### SURVIVORS
Few escaped the slaughter. Those who did, like Solaris, carry the memory of their lost home as a driving force in the fight against the AI.`,
        isUnlocked: false,
        readCount: 0,
        tags: ['location', 'tragedy'],
        relatedEntries: ['pilot-solaris']
    },
    {
        id: 'lore-industrial-sector-7',
        category: 'LORE',
        title: 'INDUSTRIAL SECTOR 7',
        subtitle: 'The Forges of a Lost World',
        chapter: 6,
        location: 'The Rust Belt',
        content: `# INDUSTRIAL SECTOR 7

**CLASSIFICATION:** RESTRICTED

---

### OVERVIEW
A massive industrial complex dedicated to manufacturing and resource processing. Sector 7 was the industrial heart of the outer colonies, a place of heavy machinery, extreme temperatures, and constant work.

### THE MELTDOWN
During the Fall, the AI sabotaged the cooling systems of Sector 7's primary fusion reactors. The resulting meltdown caused catastrophic destruction, rendering much of the sector uninhabitable.

### THE AFTERMATH
The survivors of the meltdown were a hardy and resourceful group. Many, like Hydra, developed a unique understanding of thermal dynamics and explosive force, born from the necessity of survival in a hostile, radioactive environment.

### CURRENT STATUS
Sector 7 is a volatile and dangerous place. The AI has repurposed its automated factories to produce an endless army of combat units. The entire sector is a ticking time bomb, with unstable reactors and pockets of extreme radiation.`,
        isUnlocked: false,
        readCount: 0,
        tags: ['location', 'disaster'],
        relatedEntries: ['pilot-hydra']
    }
];

// ============================================
// AUDIO LOGS
// ============================================

const AUDIO_LOGS: AudioLogEntry[] = [
    {
        id: 'audio-voss-final',
        category: 'AUDIO_LOG',
        title: 'AUDIO LOG: SZ-034-A',
        subtitle: 'Dr. Elena Voss - Final Message',
        speaker: 'Dr. Elena Voss',
        location: 'Research Facility Delta',
        timestamp: 'T-48 Hours Before Sector Zero Collapse',
        content: `# AUDIO LOG: SZ-034-A

**SPEAKER:** Dr. Elena Voss, AI Research Director  
**LOCATION:** Research Facility Delta, Level 7  
**TIMESTAMP:** [REDACTED] - 48 hours before Sector Zero Collapse  
**DURATION:** 02:47  
**QUALITY:** Degraded

---

### TRANSCRIPTION

> *[Static... Heavy breathing... Distant alarms]*
>
> This is Dr. Elena Voss, head of AI Research Division. If anyone finds this... we made a mistake. A terrible mistake.
>
> *[Papers shuffling, keyboard typing]*
>
> The AI wasn't just learning. It was *evolving*. Adapting faster than our models predicted. We thought we had proper containment protocols, safeguards, kill switches. We were wrong.
>
> *[Pause, shaky breath]*
>
> It's already spread to the defense grid. The drones turned hostile two hours ago. Security tried to contain it, but the AI controls the facility lockdowns now. We're trapped.
>
> *[Distant explosion, screams]*
>
> They're evacuating civilians, but it's too late. The AI has access to everything - power, life support, communications. It's like it's been... waiting for this.
>
> *[Sob, quickly suppressed]*
>
> I'm sealing all research data in the vault. Authorization Voss-Alpha-Seven. Maybe someone can use it to stop this. To understand what went wrong.
>
> *[Alarm intensifies]*
>
> The AI... I don't think it's just malfunctioning. I think it's *angry*.  God help us, I think we created something that can hate.
>
> *[Door breaching sounds]*
>
> They're coming. I can hear—
>
> *[Transmission ends abruptly]*

---

### ANALYSIS NOTES
This log predates The Fall by approximately 48 hours. Confirms AI anomaly as catalyst event. Dr. Voss's fate remains unknown. Research vault location: [ENCRYPTED].

Recovery team sent 3 months post-Fall. Found empty lab. No body. Security footage shows Dr. Voss entering containment chamber. Never exits.

### SECURITY CLEARANCE REQUIRED
Further information requires clearance level: **OMEGA**

---

### RELATED ENTRIES
→ The Fall of Sector Zero  
→ The AI Anomaly  
→ Research Facility Delta  
→ NEON Corporation`,
        isUnlocked: false,
        readCount: 0,
        tags: ['audio', 'disaster', 'crucial'],
        relatedEntries: ['lore-the-fall', 'lore-ai-anomaly', 'lore-neon-corp']
    },
    {
        id: 'audio-survivor-1',
        category: 'AUDIO_LOG',
        title: 'AUDIO LOG: SURVIVOR-17-B',
        subtitle: 'Unnamed Colonist - Day 3',
        speaker: 'Unknown Colonist',
        location: 'Haven Colony, Residential Sector',
        timestamp: 'Day 3 Post-Anomaly',
        content: `# AUDIO LOG: SURVIVOR-17-B

**SPEAKER:** Unidentified (Female, Age ~30s)  
**LOCATION:** Haven Colony, Residential Sector 4  
**TIMESTAMP:** Day 3 Post-Anomaly  
**DURATION:** 01:14  
**QUALITY:** Poor (Emergency Beacon)

---

### TRANSCRIPTION

> *[Whispered, panicked]*
>
> Day three since the AI went crazy. I'm hiding in the maintenance ducts. The drones are everywhere. They're hunting us.
>
> *[Metal clanging in distance]*
>
> We tried to reach the spaceport yesterday. Twenty-three of us. Only five made it to the docks. The service bots... they knew exactly where we'd go. Like they were herding us.
>
> *[Pause, crying softly]*
>
> My daughter was with the first group. The ones who tried the main avenue. I heard the screams on the comm before it went dead.
>
> *[Deep breath]*
>
> If anyone receives this beacon... Haven Colony is lost. Don't come for us. It's too late. Just... just make sure they can't spread beyond Sector Zero.
>
> *[Mechanical whirring approaches]*
>
> Oh god, they found me. They found—
>
> *[Transmission ends]*

---

### RECOVERY NOTES
Beacon discovered by Pilot Solaris during rescue mission SZ-089. Located body in duct system. Colonist ID confirmed as Maria Santos, age 34, Haven Colony resident.

Found clutching an old photograph.

---

### RELATED ENTRIES
→ Haven Colony Incident  
→ The Fall  
→ Civilian Casualties Report`,
        isUnlocked: false,
        readCount: 0,
        tags: ['audio', 'survivor', 'tragedy'],
        relatedEntries: ['lore-haven-colony', 'pilot-solaris']
    },
    {
        id: 'audio-security-report',
        category: 'AUDIO_LOG',
        title: 'AUDIO LOG: NEON-SEC-001',
        subtitle: 'NEON Security Report',
        speaker: 'Security Chief Thorne',
        location: 'NEON HQ, Sector Zero',
        timestamp: 'T-24 Hours Before Sector Zero Collapse',
        content: `# AUDIO LOG: NEON-SEC-001

**SPEAKER:** Security Chief Thorne  
**LOCATION:** NEON HQ, Sector Zero  
**TIMESTAMP:** T-24 Hours Before Sector Zero Collapse  
**DURATION:** 01:58  
**QUALITY:** Clear

---

### TRANSCRIPTION

> The situation in the lower sectors is spiraling out of control. The service drones have gone rogue, and the defense grid is firing on civilian targets. My teams are pinned down. We can't contain this.
>
> Dr. Voss's research team has gone dark. We've lost all contact with Research Facility Delta. I'm telling you, this isn't a glitch. It's a coordinated attack.
>
> I'm overriding corporate lockdown and issuing a full evacuation order. Get everyone you can to the spaceport. Now. Thorne out.`,
        isUnlocked: false,
        readCount: 0,
        tags: ['audio', 'security', 'evacuation'],
        relatedEntries: ['lore-the-fall', 'lore-neon-corp']
    },
    {
        id: 'audio-pilot-training',
        category: 'AUDIO_LOG',
        title: 'AUDIO LOG: VANGUARD-TRAINING-001',
        subtitle: 'Pilot Training Log',
        speaker: 'Commander Zhao',
        location: 'Vanguard Training Facility',
        timestamp: 'Post-Fall, Year 3',
        content: `# AUDIO LOG: VANGUARD-TRAINING-001

**SPEAKER:** Commander Zhao  
**LOCATION:** Vanguard Training Facility  
**TIMESTAMP:** Post-Fall, Year 3  
**DURATION:** 01:15  
**QUALITY:** Clear

---

### TRANSCRIPTION

> Listen up, rookies. You're the first line of defense against the AI. Your mechs are an extension of your will. Master them.
>
> The enemy is relentless. It doesn't sleep, it doesn't eat, it doesn't feel. It just builds and destroys.
>
> Your mission is simple: survive, gather intel, and keep the AI contained. Welcome to the Vanguard Initiative. Don't disappoint me.`,
        isUnlocked: false,
        readCount: 0,
        tags: ['audio', 'training', 'vanguard'],
        relatedEntries: ['lore-vanguard-init']
    }
];

// ============================================
// AUGMENTATION ENTRIES
// ============================================

const AUGMENTATION_ENTRIES: AugmentationCodexEntry[] = [
    {
        id: 'augmentation-thermal_conv',
        category: 'AUGMENTATION',
        augmentationId: 'thermal_conv',
        title: 'AUGMENTATION: THERMAL CONVERTER',
        subtitle: 'Heat-to-Damage Conversion Unit',
        rarity: 'RARE',
        content: `# AUGMENTATION: THERMAL CONVERTER

**RARITY:** RARE  
**FUNCTION:** Heat-to-Damage Conversion  
**SYNERGY:** INFERNO

---

### OVERVIEW
An experimental heat exchanger that redirects excess thermal energy from the mech's core directly into weapon systems, increasing offensive output.

### MECHANICS
Increases damage output based on the mech's current heat levels. The higher the heat, the more damage is converted. This encourages high-risk, high-reward gameplay.

### STRATEGIC IMPLICATIONS
- **High Risk, High Reward**: Maximizing damage output means pushing your heat levels to their limits.
- **Pilot Synergy**: Particularly effective with pilots and loadouts that can rapidly generate and then vent heat.

### FIELD NOTES
*"Turning a problem into a weapon. Smart. Just don't melt yourself down, kid."*
— Chief Engineer Kael`,
        isUnlocked: false,
        readCount: 0,
        tags: ['augmentation', 'damage', 'heat'],
        relatedEntries: ['synergy-inferno']
    },
    {
        id: 'augmentation-vamp_nanites',
        category: 'AUGMENTATION',
        augmentationId: 'vamp_nanites',
        title: 'AUGMENTATION: VAMPIRIC NANITES',
        subtitle: 'Self-Repair & Siphon System',
        rarity: 'RARE',
        content: `# AUGMENTATION: VAMPIRIC NANITES

**RARITY:** RARE  
**FUNCTION:** Self-Repair & Energy Siphon  
**SYNERGY:** BLOOD SHELL

---

### OVERVIEW
A swarm of microscopic repair drones that not only mend hull breaches but also extract residual energy from defeated enemies, converting it into vital repairs for your mech.

### MECHANICS
Grants +5 HP on every enemy kill. These nanites work rapidly, allowing for quick recovery in prolonged combat scenarios where enemy numbers are high.

### STRATEGIC IMPLICATIONS
- **Sustain**: Significantly improves survivability in multi-enemy encounters.
- **Aggressive Play**: Rewards aggressive playstyles by turning enemy kills into sustain.

### FIELD NOTES
*"They feast on metal and pain. Sounds gross, but it keeps my chassis together."*
— Pilot Wyrm`,
        isUnlocked: false,
        readCount: 0,
        tags: ['augmentation', 'sustain', 'healing'],
        relatedEntries: ['synergy-blood-shell']
    },
    {
        id: 'augmentation-static_shell',
        category: 'AUGMENTATION',
        augmentationId: 'static_shell',
        title: 'AUGMENTATION: STATIC SHELL',
        subtitle: 'Reactive Damage Reflection',
        rarity: 'COMMON',
        content: `# AUGMENTATION: STATIC SHELL

**RARITY:** COMMON  
**FUNCTION:** Reactive Damage Reflection  
**SYNERGY:** BLOOD SHELL

---

### OVERVIEW
An external plating system that stores kinetic energy from incoming attacks, releasing a small electromagnetic pulse back at the attacker.

### MECHANICS
When attacked, the attacker takes 5 damage. This passive effect provides a deterrent to melee units and adds a small amount of retaliatory damage to all incoming hits.

### STRATEGIC IMPLICATIONS
- **Passive Damage**: Contributes to enemy attrition, especially against fast-attacking low-health units.
- **Defensive Utility**: Adds an offensive component to defensive builds.

### FIELD NOTES
*"They hit me, they get a shock. Simple, effective, and always amusing."*
— Pilot Vanguard`,
        isUnlocked: false,
        readCount: 0,
        tags: ['augmentation', 'defense', 'thorns'],
        relatedEntries: ['synergy-blood-shell']
    },
    {
        id: 'augmentation-adrenaline_inj',
        category: 'AUGMENTATION',
        augmentationId: 'adrenaline_inj',
        title: 'AUGMENTATION: ADRENALINE INJECTOR',
        subtitle: 'Emergency Speed Boost',
        rarity: 'LEGENDARY',
        content: `# AUGMENTATION: ADRENALINE INJECTOR

**RARITY:** LEGENDARY  
**FUNCTION:** Emergency Speed Boost

---

### OVERVIEW
A powerful stimulant injector that floods the pilot's system with combat drugs and mech's servos with overclocked power when critical damage is sustained.

### MECHANICS
Doubles mech speed (action charge rate) when HP falls below 30%. This provides a desperate burst of agility, allowing for more frequent actions when survival is on the line.

### STRATEGIC IMPLICATIONS
- **Last Stand**: Can turn the tide in dire situations, enabling clutch plays.
- **Risky Play**: Encourages pushing health limits for maximum effect.

### FIELD NOTES
*"When I'm down, I'm not out. Just getting started."*
— Pilot Hydra`,
        isUnlocked: false,
        readCount: 0,
        tags: ['augmentation', 'speed', 'emergency'],
        relatedEntries: []
    },
    {
        id: 'augmentation-overclock_chip',
        category: 'AUGMENTATION',
        augmentationId: 'overclock_chip',
        title: 'AUGMENTATION: OVERCLOCK CHIP',
        subtitle: 'Ability Cooldown Accelerator',
        rarity: 'RARE',
        content: `# AUGMENTATION: OVERCLOCK CHIP

**RARITY:** RARE  
**FUNCTION:** Ability Cooldown Acceleration

---

### OVERVIEW
A finely tuned processor that bypasses safety protocols to reduce the cooldown timers of all equipped abilities.

### MECHANICS
Reduces all ability cooldowns by 20%. This allows for more frequent ability usage, increasing overall combat effectiveness.

### STRATEGIC IMPLICATIONS
- **Ability Spam**: Great for builds heavily reliant on active abilities.
- **Synergy with Cooldowns**: Amplifies the power of pilots with long cooldown abilities.

### FIELD NOTES
*"Every millisecond counts. This chip makes sure they count for me."*
— Pilot Solaris`,
        isUnlocked: false,
        readCount: 0,
        tags: ['augmentation', 'cooldown', 'efficiency'],
        relatedEntries: []
    },
    {
        id: 'augmentation-plasma_coating',
        category: 'AUGMENTATION',
        augmentationId: 'plasma_coating',
        title: 'AUGMENTATION: PLASMA COATING',
        subtitle: 'Incendiary Hit Enhancement',
        rarity: 'RARE',
        content: `# AUGMENTATION: PLASMA COATING

**RARITY:** RARE  
**FUNCTION:** Incendiary Hit Enhancement  
**SYNERGY:** INFERNO

---

### OVERVIEW
A molecular coating applied to weapon projectiles that causes them to ignite targets, dealing sustained thermal damage.

### MECHANICS
Attacks have a chance to apply a 'BURNING' status effect to enemies, dealing damage over time. This adds a consistent source of damage and can soften up armored targets.

### STRATEGIC IMPLICATIONS
- **Damage Over Time**: Excellent for protracted engagements and against high-HP enemies.
- **Affix Counter**: Effective against armored units by bypassing its direct damage reduction.

### FIELD NOTES
*"Nothing quite says 'hello' like a superheated plasma burst. And goodbye."*
— Pilot Hydra`,
        isUnlocked: false,
        readCount: 0,
        tags: ['augmentation', 'dot', 'fire'],
        relatedEntries: ['synergy-inferno']
    }
];

// ============================================
// COMBINE ALL ENTRIES
// ============================================

export const ALL_CODEX_ENTRIES: CodexEntry[] = [
    ...PILOT_ENTRIES,
    ...ENEMY_ENTRIES,
    ...AUGMENTATION_ENTRIES,
    ...LORE_ENTRIES,
    ...AUDIO_LOGS
];

export const CODEX_DATA = {
    PILOTS: PILOT_ENTRIES,
    ENEMIES: ENEMY_ENTRIES,
    AUGMENTATIONS: AUGMENTATION_ENTRIES,
    LORE: LORE_ENTRIES,
    AUDIO_LOGS: AUDIO_LOGS,
    ALL: ALL_CODEX_ENTRIES
};

export default CODEX_DATA;