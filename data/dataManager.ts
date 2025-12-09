import { PILOTS, ENEMY_TEMPLATES as DEFAULT_ENEMY_TEMPLATES, NARRATIVE_EVENTS as DEFAULT_NARRATIVE_EVENTS } from '../constants';
import { PilotConfig, GameEvent } from '../types';

export interface EnemyTemplate {
  name: string;
  maxHp: number;
  speed: number;
  damage: number;
  flavorText: string;
  scrapValue: number;
}

let allPilots: PilotConfig[] = [...PILOTS];
let allEnemyTemplates: EnemyTemplate[] = [...DEFAULT_ENEMY_TEMPLATES];
let allEvents: GameEvent[] = [...DEFAULT_NARRATIVE_EVENTS];
let isInitialized = false;

export const getAllPilots = (): PilotConfig[] => {
  if (!isInitialized) {
    console.warn("Data manager has not been initialized. Returning default data.");
  }
  return allPilots;
};

export const getAllEnemyTemplates = (): EnemyTemplate[] => {
  if (!isInitialized) {
    console.warn("Data manager has not been initialized. Returning default data.");
  }
  return allEnemyTemplates;
}

export const getAllEvents = (): GameEvent[] => {
	if (!isInitialized) {
		console.warn("Data manager has not been initialized. Returning default data.");
	}
	return allEvents;
}

export const initializeDataManager = async () => {
  if (isInitialized) {
    return;
  }

  console.log('Initializing data manager...');

  // Load pilots
  const defaultPilots = [...PILOTS];
  const customPilots: PilotConfig[] = [];
  const pilotModules = import.meta.glob('/mods/pilots/*.json');

  for (const path in pilotModules) {
    try {
      const mod = await pilotModules[path]();
      const pilotConfig = (mod as any).default as PilotConfig;
      if (pilotConfig && pilotConfig.id && pilotConfig.name) {
        console.log(`Loaded custom pilot: ${pilotConfig.name}`);
        customPilots.push(pilotConfig);
      } else {
        console.warn(`Invalid pilot data in ${path}`);
      }
    } catch (e) {
      console.error(`Failed to load custom pilot from ${path}`, e);
    }
  }
  allPilots = [...defaultPilots, ...customPilots];

  // Load enemies
  const defaultEnemies = [...DEFAULT_ENEMY_TEMPLATES];
  const customEnemies: EnemyTemplate[] = [];
  const enemyModules = import.meta.glob('/mods/enemies/*.json');

  for (const path in enemyModules) {
    try {
      const mod = await enemyModules[path]();
      const enemyTemplate = (mod as any).default as EnemyTemplate;
      if (enemyTemplate && enemyTemplate.name && enemyTemplate.maxHp) {
        console.log(`Loaded custom enemy: ${enemyTemplate.name}`);
        customEnemies.push(enemyTemplate);
      } else {
        console.warn(`Invalid enemy data in ${path}`);
      }
    } catch (e) {
      console.error(`Failed to load custom enemy from ${path}`, e);
    }
  }
  allEnemyTemplates = [...defaultEnemies, ...customEnemies];

  // Load events
  const defaultEvents = [...DEFAULT_NARRATIVE_EVENTS];
  const customEvents: GameEvent[] = [];
  const eventModules = import.meta.glob('/mods/events/*.ts');

  for (const path in eventModules) {
    try {
      const mod = await eventModules[path]();
      const gameEvent = (mod as any).default as GameEvent;
      if (gameEvent && gameEvent.id && gameEvent.title) {
        console.log(`Loaded custom event: ${gameEvent.title}`);
        customEvents.push(gameEvent);
      } else {
        console.warn(`Invalid event data in ${path}`);
      }
    } catch (e) {
      console.error(`Failed to load custom event from ${path}`, e);
    }
  }
  allEvents = [...defaultEvents, ...customEvents];

  isInitialized = true;
  console.log('Data manager initialized.');
};
