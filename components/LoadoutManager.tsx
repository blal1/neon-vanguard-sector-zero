import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PILOTS, CONSUMABLES } from '../constants';
import { Loadout, PilotId, PilotModule, Consumable } from '../types';
import { audio } from '../services/audioService';

interface LoadoutManagerProps {
    onClose: () => void;
    onApplyLoadout?: (loadoutId: string) => void;
}

export const LoadoutManager: React.FC<LoadoutManagerProps> = ({ onClose, onApplyLoadout }) => {
    const { loadouts, createLoadout, updateLoadout, deleteLoadout, isPilotUnlocked } = useGame();

    const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'import'>('list');
    const [editingLoadout, setEditingLoadout] = useState<Loadout | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [importCode, setImportCode] = useState('');
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        pilotId: 'vanguard' as PilotId,
        module: 'ASSAULT' as PilotModule,
        color: '#06b6d4', // cyan-500
        consumables: [] as Consumable[]
    });

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreate = () => {
        setMode('create');
        setFormData({
            name: '',
            pilotId: 'vanguard',
            module: 'ASSAULT',
            color: PILOTS[0].color,
            consumables: []
        });
    };

    const handleEdit = (loadout: Loadout) => {
        setEditingLoadout(loadout);
        setFormData({
            name: loadout.name,
            pilotId: loadout.pilotId,
            module: loadout.module,
            color: loadout.color,
            consumables: loadout.consumables
        });
        setMode('edit');
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('Please enter a loadout name');
            return;
        }

        if (mode === 'create') {
            createLoadout(formData.name, formData.pilotId, formData.module, formData.consumables, formData.color);
            audio.playBlip();
        } else if (mode === 'edit' && editingLoadout) {
            updateLoadout(editingLoadout.id, {
                name: formData.name,
                pilotId: formData.pilotId,
                module: formData.module,
                consumables: formData.consumables,
                color: formData.color
            });
            audio.playBlip();
        }
        setMode('list');
        setEditingLoadout(null);
    };

    const handleDelete = (id: string) => {
        deleteLoadout(id);
        setDeleteConfirmId(null);
        audio.playBlip();
    };

    const toggleConsumable = (consumable: Consumable) => {
        const exists = formData.consumables.some(c => c.id === consumable.id);
        if (exists) {
            setFormData(prev => ({
                ...prev,
                consumables: prev.consumables.filter(c => c.id !== consumable.id)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                consumables: [...prev.consumables, { ...consumable, count: 1 }]
            }));
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleExport = (loadout: Loadout) => {
        try {
            const data = {
                name: loadout.name,
                pilotId: loadout.pilotId,
                module: loadout.module,
                color: loadout.color,
                consumables: loadout.consumables.map(({ id }) => ({ id, count: 1 })),
            };
            const json = JSON.stringify(data);
            const base64 = btoa(json);
            navigator.clipboard.writeText(base64);
            showNotification('Loadout code copied to clipboard!');
            audio.playBlip();
        } catch (e) {
            console.error(e);
            showNotification('Failed to export loadout.', 'error');
        }
    };

    const handleImport = () => {
        if (!importCode.trim()) return;
        try {
            const json = atob(importCode.trim());
            const data = JSON.parse(json);

            // Basic validation
            if (!data.pilotId || !data.module || !data.name) {
                throw new Error('Invalid loadout code.');
            }
            
            const pilot = PILOTS.find(p => p.id === data.pilotId);
            if (!pilot) {
                throw new Error(`Pilot with ID "${data.pilotId}" not found.`);
            }

            // Create new loadout from imported data
            createLoadout(
                `[IMPORT] ${data.name}`,
                data.pilotId,
                data.module,
                data.consumables || [],
                data.color || pilot.color,
            );

            showNotification(`Successfully imported loadout: ${data.name}`);
            setImportCode('');
            setMode('list');
            audio.playBlip();
        } catch (e) {
            console.error(e);
            showNotification('Invalid or corrupt loadout code.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative max-w-4xl w-full max-h-[90vh] mx-4 border-2 border-cyan-500 bg-black p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-y-auto">
                {notification && (
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-md text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {notification.message}
                    </div>
                )}
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b-2 border-cyan-500 pb-4">
                    <h2 className="text-3xl font-bold text-cyan-400 tracking-widest">💾 LOADOUT MANAGER</h2>
                    <button
                        onClick={() => { audio.playBlip(); onClose(); }}
                        className="border border-white text-white px-4 py-2 hover:bg-white hover:text-black transition-all"
                    >
                        [ CLOSE ]
                    </button>
                </div>

                {/* List Mode */}
                {mode === 'list' && (
                    <>
                        <div className="mb-4 flex justify-between items-center">
                            <div className="text-sm text-gray-400">
                                {loadouts.length} Loadout{loadouts.length !== 1 ? 's' : ''} Saved
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('import')}
                                    className="border border-yellow-500 text-yellow-400 px-6 py-2 hover:bg-yellow-900/50 transition-all font-bold"
                                >
                                    IMPORT FROM CODE
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="border border-green-500 text-green-400 px-6 py-2 hover:bg-green-900/50 transition-all font-bold"
                                >
                                    + CREATE NEW LOADOUT
                                </button>
                            </div>
                        </div>

                        {loadouts.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <div className="text-6xl mb-4">💾</div>
                                <div className="text-xl">No loadouts saved yet</div>
                                <div className="text-sm mt-2">Create your first loadout to get started!</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loadouts.map(loadout => {
                                    const pilot = PILOTS.find(p => p.id === loadout.pilotId);
                                    return (
                                        <div
                                            key={loadout.id}
                                            className="border border-gray-700 bg-gray-900/50 p-4 hover:border-cyan-500 transition-colors"
                                            style={{ borderLeftWidth: '4px', borderLeftColor: loadout.color }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white">{loadout.name}</h3>
                                                <div className="flex gap-2">
                                                    {onApplyLoadout && (
                                                        <button
                                                            onClick={() => { audio.playBlip(); onApplyLoadout(loadout.id); }}
                                                            className="border border-cyan-500 text-cyan-400 px-3 py-1 text-sm hover:bg-cyan-900/50"
                                                        >
                                                            LOAD
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(loadout)}
                                                        className="border border-blue-500 text-blue-400 px-3 py-1 text-sm hover:bg-blue-900/50"
                                                    >
                                                        EDIT
                                                    </button>
                                                    <button
                                                        onClick={() => handleExport(loadout)}
                                                        className="border border-yellow-500 text-yellow-400 px-3 py-1 text-sm hover:bg-yellow-900/50"
                                                    >
                                                        EXPORT
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(loadout.id)}
                                                        className="border border-red-500 text-red-400 px-3 py-1 text-sm hover:bg-red-900/50"
                                                    >
                                                        DELETE
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-400 space-y-1">
                                                <div><span className="text-cyan-400">Pilot:</span> {pilot?.name || 'Unknown'}</div>
                                                <div><span className="text-cyan-400">Module:</span> {loadout.module}</div>
                                                <div><span className="text-cyan-400">Items:</span> {loadout.consumables.length > 0 ? loadout.consumables.map(c => c.name).join(', ') : 'None'}</div>
                                                <div className="text-xs text-gray-600 mt-2">
                                                    Created: {formatDate(loadout.createdAt)}
                                                    {loadout.lastUsed && ` • Last Used: ${formatDate(loadout.lastUsed)}`}
                                                </div>
                                            </div>

                                            {/* Delete Confirmation */}
                                            {deleteConfirmId === loadout.id && (
                                                <div className="mt-3 pt-3 border-t border-red-500/50 flex justify-between items-center">
                                                    <span className="text-red-400 text-sm">Delete this loadout?</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDelete(loadout.id)}
                                                            className="border border-red-500 text-red-400 px-3 py-1 text-sm hover:bg-red-900/50"
                                                        >
                                                            CONFIRM
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="border border-gray-500 text-gray-400 px-3 py-1 text-sm hover:bg-gray-900/50"
                                                        >
                                                            CANCEL
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Import Mode */}
                {mode === 'import' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-cyan-400">IMPORT LOADOUT FROM CODE</h3>
                        <textarea
                            value={importCode}
                            onChange={(e) => setImportCode(e.target.value)}
                            className="w-full h-32 bg-gray-900 border border-gray-700 text-white p-2"
                            placeholder="Paste loadout code here..."
                        />
                        <div className="flex gap-4 justify-end">
                            <button onClick={() => setMode('list')} className="border border-gray-500 text-gray-400 px-6 py-2 hover:bg-gray-900/50 transition-all">CANCEL</button>
                            <button onClick={handleImport} className="border border-yellow-500 text-yellow-400 px-6 py-2 hover:bg-yellow-900/50 transition-all font-bold">IMPORT LOADOUT</button>
                        </div>
                    </div>
                )}

                {/* Create/Edit Mode */}
                {(mode === 'create' || mode === 'edit') && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                            <h3 className="text-xl font-bold text-cyan-400">
                                {mode === 'create' ? 'CREATE NEW LOADOUT' : 'EDIT LOADOUT'}
                            </h3>
                            <button
                                onClick={() => setMode('list')}
                                className="text-gray-400 hover:text-white"
                            >
                                ← BACK TO LIST
                            </button>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Loadout Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 focus:border-cyan-500 outline-none"
                                placeholder="Enter loadout name..."
                                maxLength={30}
                            />
                        </div>

                        {/* Pilot Selection */}
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Pilot</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PILOTS.map(pilot => {
                                    const unlocked = isPilotUnlocked(pilot);
                                    return (
                                        <button
                                            key={pilot.id}
                                            onClick={() => unlocked && setFormData(prev => ({ ...prev, pilotId: pilot.id, color: pilot.color }))}
                                            disabled={!unlocked}
                                            className={`border p-3 text-left transition-all ${formData.pilotId === pilot.id
                                                    ? 'bg-cyan-900/50 border-cyan-500'
                                                    : unlocked
                                                        ? 'border-gray-700 hover:border-cyan-500/50'
                                                        : 'border-gray-800 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="font-bold" style={{ color: pilot.color }}>{pilot.name}</div>
                                            <div className="text-xs text-gray-500">{pilot.mechName}</div>
                                            {!unlocked && <div className="text-xs text-red-500 mt-1">LOCKED</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Module Selection */}
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Module</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['ASSAULT', 'DEFENSE'] as PilotModule[]).map(mod => (
                                    <button
                                        key={mod}
                                        onClick={() => setFormData(prev => ({ ...prev, module: mod }))}
                                        className={`border p-3 transition-all ${formData.module === mod
                                                ? 'bg-cyan-900/50 border-cyan-500 text-white'
                                                : 'border-gray-700 text-gray-400 hover:border-cyan-500/50'
                                            }`}
                                    >
                                        {mod}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Consumables */}
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Consumables</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CONSUMABLES.map(consumable => {
                                    const selected = formData.consumables.some(c => c.id === consumable.id);
                                    return (
                                        <button
                                            key={consumable.id}
                                            onClick={() => toggleConsumable(consumable)}
                                            className={`border p-2 text-sm transition-all ${selected
                                                    ? 'bg-cyan-900/50 border-cyan-500'
                                                    : 'border-gray-700 hover:border-cyan-500/50'
                                                }`}
                                        >
                                            <div className="font-bold" style={{ color: consumable.color.split(' ')[0] }}>
                                                {consumable.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{consumable.cost}₡</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="block text-sm text-cyan-400 mb-2">Custom Color</label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-16 h-16 cursor-pointer border-2 border-gray-700"
                                />
                                <div className="flex-1">
                                    <div className="text-sm text-gray-400">Selected: {formData.color}</div>
                                    <div className="flex gap-2 mt-2">
                                        {PILOTS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFormData(prev => ({ ...prev, color: p.color }))}
                                                className="w-8 h-8 border border-gray-700 hover:border-white"
                                                style={{ backgroundColor: p.color }}
                                                title={p.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-gray-700">
                            <button
                                onClick={() => setMode('list')}
                                className="border border-gray-500 text-gray-400 px-6 py-2 hover:bg-gray-900/50 transition-all"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSave}
                                className="border border-green-500 text-green-400 px-6 py-2 hover:bg-green-900/50 transition-all font-bold"
                            >
                                {mode === 'create' ? 'CREATE LOADOUT' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>
            </div>
        </div>
    );
};