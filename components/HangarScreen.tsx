import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SHOP_PRICES, RUN_CONFIG, CONSUMABLES, AUGMENTATIONS, SYNERGIES } from '../constants';
import { audio } from '../services/audioService';
import { CraftingPanel } from './CraftingPanel';
import { AudioSettings } from './AudioSettings';
import { VisualSettings } from './VisualSettings';
import { KeybindingSettings } from './KeybindingSettings';
import { getActiveSynergies } from '../utils/synergyUtils';
import { useTranslation } from 'react-i18next';

interface HangarScreenProps {
  onContinue: () => void;
}

export const HangarScreen: React.FC<HangarScreenProps> = ({ onContinue }) => {
  const { t } = useTranslation();
  const { runState, purchaseUpgrade, purchaseAugmentation, settings, dailyModifier } = useGame();
  const [activeTab, setActiveTab] = useState<'shop' | 'crafting' | 'settings' | 'synergies'>('shop');

  const handleBuy = (type: 'hp' | 'dmg' | 'repair' | 'item', itemId?: string, cost: number = 0) => {
    if (runState.scrap >= cost) {
      audio.playBlip();
      purchaseUpgrade(type, itemId, cost);
    } else {
      audio.playAlarm();
    }
  };

  const handleBuyAug = (augId: string, cost: number) => {
    if (runState.scrap >= cost && !runState.augmentations.includes(augId)) {
      audio.playBlip();
      purchaseAugmentation(augId, cost);
    } else {
      audio.playAlarm();
    }
  };

  const currentHp = runState.currentHp;
  const maxHp = runState.currentHp + (runState.maxHpUpgrade - runState.maxHpUpgrade); // Rough calc since we don't have base here, but actually `currentHp` tracks damage. 
  // Wait, currentHp is the *current* health. 
  // We need to know Max HP to disable repair if full? 
  // Logic simplified: allow repair always if have money.

  const activeSynergies = getActiveSynergies(runState.augmentations);

  return (
    <div className="flex flex-col h-full text-white font-mono p-4" role="main" aria-label="Hangar resupply interface">
      <header className="border-b border-gray-700 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-200">SECTOR {runState.currentStage} CLEARED</h1>
          <p className="text-gray-500 text-xs md:text-sm">FIELD HANGAR // RESUPPLY SEQUENCE</p>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <div className="text-xs text-gray-500">{t('hangar.availableScrap')}</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-accent)]">{runState.scrap}</div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => { setActiveTab('shop'); audio.playBlip(); }}
          className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${activeTab === 'shop'
            ? 'text-cyan-400 border-b-2 border-cyan-400'
            : 'text-gray-500 hover:text-gray-300'
            }`}
          aria-label="Shop tab - purchase upgrades and items"
          aria-selected={activeTab === 'shop'}
          role="tab"
        >
          🛒 Shop
        </button>
        <button
          onClick={() => { setActiveTab('crafting'); audio.playBlip(); }}
          className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${activeTab === 'crafting'
            ? 'text-cyan-400 border-b-2 border-cyan-400'
            : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          🔧 Crafting
        </button>
        <button
          onClick={() => { setActiveTab('settings'); audio.playBlip(); }}
          className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${activeTab === 'settings'
            ? 'text-cyan-400 border-b-2 border-cyan-400'
            : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => { setActiveTab('synergies'); audio.playBlip(); }}
          className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors ${activeTab === 'synergies'
            ? 'text-cyan-400 border-b-2 border-cyan-400'
            : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          ✨ Synergies ({activeSynergies.length})
        </button>
      </div>

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
          {/* Upgrades */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-[var(--color-secondary)] border-b border-blue-900 pb-1">{t('hangar.systemUpgrades')}</h2>
            <div className="flex flex-col gap-4">

              {/* Repair */}
              <button
                onClick={() => handleBuy('repair', undefined, SHOP_PRICES.REPAIR)}
                className="flex justify-between items-center p-4 border border-green-800 bg-green-900/20 hover:bg-green-900/40 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={runState.scrap < SHOP_PRICES.REPAIR}
                aria-label={`Emergency repairs - restore 20 HP for ${SHOP_PRICES.REPAIR} scrap`}
              >
                <div>
                  <div className="font-bold text-[var(--color-success)]">EMERGENCY REPAIRS</div>
                  <div className="text-xs text-gray-400">Restore +20 HP</div>
                </div>
                <div className={`font-bold ${runState.scrap < SHOP_PRICES.REPAIR ? 'text-[var(--color-danger)]' : 'text-[var(--color-accent)]'}`}>
                  {SHOP_PRICES.REPAIR} SCRAP
                </div>
              </button>

              {/* Upgrade HP */}
              <button
                onClick={() => handleBuy('hp', undefined, SHOP_PRICES.UPGRADE_HP)}
                className="flex justify-between items-center p-4 border border-blue-800 bg-blue-900/20 hover:bg-blue-900/40 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={runState.scrap < SHOP_PRICES.UPGRADE_HP}
              >
                <div>
                  <div className="font-bold text-blue-400">REINFORCE HULL</div>
                  <div className="text-xs text-gray-400">Increase MAX HP (+10)</div>
                  <div className="text-[10px] text-blue-200 mt-1">Current Bonus: +{runState.maxHpUpgrade}</div>
                </div>
                <div className={`font-bold ${runState.scrap < SHOP_PRICES.UPGRADE_HP ? 'text-[var(--color-danger)]' : 'text-[var(--color-accent)]'}`}>
                  {SHOP_PRICES.UPGRADE_HP} SCRAP
                </div>
              </button>

              {/* Upgrade DMG */}
              <button
                onClick={() => handleBuy('dmg', undefined, SHOP_PRICES.UPGRADE_DMG)}
                className="flex justify-between items-center p-4 border border-red-800 bg-red-900/20 hover:bg-red-900/40 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={runState.scrap < SHOP_PRICES.UPGRADE_DMG}
              >
                <div>
                  <div className="font-bold text-red-400">WEAPON CALIBRATION</div>
                  <div className="text-xs text-gray-400">Increase BASE DAMAGE (+1)</div>
                  <div className="text-[10px] text-red-200 mt-1">Current Bonus: +{runState.damageUpgrade}</div>
                </div>
                <div className={`font-bold ${runState.scrap < SHOP_PRICES.UPGRADE_DMG ? 'text-[var(--color-danger)]' : 'text-[var(--color-accent)]'}`}>
                  {SHOP_PRICES.UPGRADE_DMG} SCRAP
                </div>
              </button>

            </div>
          </section>

          {/* Consumables */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-300 border-b border-purple-900 pb-1">{t('hangar.fabricator')}</h2>
            <div className="flex flex-col gap-2">
              {runState.consumables
                .filter(item => {
                  if (dailyModifier === 'PACIFIST') {
                    // Filter out offensive items for PACIFIST
                    return item.id !== 'emp_grenade' && item.id !== 'overdrive_inj' && item.id !== 'cryo_bomb';
                  }
                  return true;
                })
                .map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleBuy('item', item.id, item.cost)}
                    className="flex justify-between items-center p-3 border border-purple-900 bg-purple-900/10 hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                    disabled={runState.scrap < item.cost || item.count >= item.maxCount}
                  >
                    <div>
                      <div className={`font-bold text-sm ${item.color.split(' ')[0]}`}>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.count}/{item.maxCount} In Stock</div>
                    </div>
                    <div className="text-right">
                      {item.count >= item.maxCount ? (
                        <div className="text-xs text-gray-500">MAX</div>
                      ) : (
                        <div className={`font-bold text-sm ${runState.scrap < item.cost ? 'text-[var(--color-danger)]' : 'text-[var(--color-accent)]'}`}>
                          {item.cost} SCRAP
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              <div className="text-xs text-gray-600 mt-2 italic text-center">
                "Warning: Fabricator supplies limited to carried slots."
              </div>
            </div>
          </section>

          {/* Augmentations */}
          <section className="md:col-span-2 border-t border-gray-800 pt-6 mt-2">
            <h2 className="text-xl font-bold mb-4 text-purple-300 border-b border-purple-900 pb-1">{t('hangar.blackMarket')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AUGMENTATIONS.map((aug) => {
                const isOwned = runState.augmentations.includes(aug.id);
                const canAfford = runState.scrap >= aug.cost;

                return (
                  <button
                    key={aug.id}
                    onClick={() => handleBuyAug(aug.id, aug.cost)}
                    disabled={isOwned || !canAfford}
                    className={`border p-3 text-left relative group transition-all ${isOwned ? 'border-green-500 bg-green-900/20 opacity-50' :
                      canAfford ? 'border-purple-500 bg-purple-900/10 hover:bg-purple-900/30' :
                        'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-bold ${isOwned ? 'text-[var(--color-success)]' : 'text-purple-300'}`}>{aug.name}</span>
                      <span className="text-[10px] border border-gray-600 px-1 text-gray-400">{aug.rarity}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3 h-8">{aug.description}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-500">{aug.icon}</span>
                      <span className={`font-bold ${isOwned ? 'text-green-500' : canAfford ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]'}`}>
                        {isOwned ? 'INSTALLED' : `${aug.cost} SCRAP`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div >
      )}

      {/* Crafting Tab */}
      {activeTab === 'crafting' && (
        <CraftingPanel />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <AudioSettings />
          <VisualSettings />
          <KeybindingSettings />
        </div>
      )}

      {/* Synergies Tab */}
      {activeTab === 'synergies' && (
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">{t('hangar.activeSynergies')}</h2>
          {activeSynergies.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeSynergies.map(synergy => (
                <div key={synergy.id} className="border border-purple-600 p-4 bg-purple-900/20">
                  <h3 className="text-xl font-bold text-purple-300 mb-2">{synergy.name}</h3>
                  <p className="text-gray-300 mb-2">{synergy.description}</p>
                  <div className="text-sm text-gray-400">
                    <span className="font-bold">REQUIRES:</span> {synergy.augmentationIds.map(id => AUGMENTATIONS.find(aug => aug.id === id)?.name).join(' + ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No active synergies. Collect augmentations to discover powerful combinations!</p>
          )}

          <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-400">{t('hangar.availableSynergies')}</h2>
          <div className="grid grid-cols-1 gap-4">
            {SYNERGIES.filter(s => !activeSynergies.some(as => as.id === s.id)).map(synergy => (
              <div key={synergy.id} className="border border-gray-700 p-4 bg-gray-800/20 opacity-50">
                <h3 className="text-xl font-bold text-gray-500 mb-2">{synergy.name}</h3>
                <p className="text-gray-500 mb-2">{synergy.description}</p>
                <div className="text-sm text-gray-600">
                  <span className="font-bold">REQUIRES:</span> {synergy.augmentationIds.map(id => AUGMENTATIONS.find(aug => aug.id === id)?.name || id).join(' + ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-4">
        <div className="text-sm text-gray-400 text-center md:text-left">
          NEXT SECTOR: <span className="text-white font-bold">LEVEL {runState.currentStage + 1} / {RUN_CONFIG.MAX_STAGES}</span>
          <br />
          THREAT LEVEL: <span className="text-[var(--color-danger)]">INCREASED</span>
        </div>
        <button
          onClick={onContinue}
          className="mt-4 md:mt-0 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 hover:scale-105 transition-all w-full md:w-auto"
          aria-label={`Deploy to sector ${runState.currentStage + 1}`}
        >
          DEPLOY TO NEXT SECTOR
        </button>
      </div>
    </div >
  );
};
