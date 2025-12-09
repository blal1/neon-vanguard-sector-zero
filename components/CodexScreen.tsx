import React, { useState, useMemo } from 'react';
import { CodexCategory, CodexEntry, CodexProgress } from '../types/codex';

interface CodexScreenProps {
    entries: Record<string, CodexEntry>;
    progress: CodexProgress;
    onBack: () => void;
    onReadEntry: (entryId: string) => void;
}

export const CodexScreen: React.FC<CodexScreenProps> = ({
    entries,
    progress,
    onBack,
    onReadEntry
}) => {
    const [selectedCategory, setSelectedCategory] = useState<CodexCategory>('PILOT');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    // Filter entries by category
    const categoryEntries = useMemo(() => {
        return Object.values(entries).filter(e => e.category === selectedCategory);
    }, [entries, selectedCategory]);

    // Sort: unlocked first, then by title
    const sortedEntries = useMemo(() => {
        return [...categoryEntries].sort((a, b) => {
            if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
            return a.title.localeCompare(b.title);
        });
    }, [categoryEntries]);

    const selectedEntry = selectedEntryId ? entries[selectedEntryId] : null;

    const handleSelectEntry = (entry: CodexEntry) => {
        if (!entry.isUnlocked) return;
        setSelectedEntryId(entry.id);
        onReadEntry(entry.id);
    };

    const getCategoryIcon = (cat: CodexCategory) => {
        switch (cat) {
            case 'PILOT': return '👤';
            case 'ENEMY': return '👾';
            case 'LORE': return '📖';
            case 'AUDIO_LOG': return '🎙️';
        }
    };

    const getThreatStars = (level: number) => {
        return '★'.repeat(level) + '☆'.repeat(5 - level);
    };

    return (
        <div className="w-full h-full bg-black text-green-500 font-mono terminal-screen relative overflow-hidden">
            {/* CRT Scanline Effect */}
            <div className="terminal-scanline absolute inset-0 pointer-events-none z-50" />

            {/* Screen Flicker Overlay */}
            <div className="absolute inset-0 bg-green-500 opacity-5 pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col p-4">
                {/* Header */}
                <div className="border-2 border-green-500 p-3 mb-4">
                    <div className="text-cyan-400 text-xl mb-1">
                        ═══════════════════════════════════════════════
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold mb-1">SECTOR ZERO :: TERMINAL DATABASE v2.4.1</div>
                        <div className="text-sm text-yellow-400">&gt; ACCESS GRANTED :: USER: VANGUARD_PILOT</div>
                    </div>
                    <div className="text-cyan-400 text-xl mt-1">
                        ═══════════════════════════════════════════════
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 border-b-2 border-green-500 pb-2">
                    {(['PILOT', 'ENEMY', 'LORE', 'AUDIO_LOG'] as CodexCategory[]).map(cat => {
                        const catProgress = progress.byCategory[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setSelectedEntryId(null);
                                }}
                                className={`px-4 py-2 border-2 transition-all ${selectedCategory === cat
                                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                        : 'border-green-700 hover:border-green-500'
                                    }`}
                            >
                                <span className="mr-2">{getCategoryIcon(cat)}</span>
                                {cat.replace('_', ' ')}
                                <div className="text-xs mt-1">
                                    {catProgress.unlocked}/{catProgress.total}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Entry List */}
                    <div className="w-1/3 border-2 border-green-500 p-3 overflow-y-auto">
                        <div className="text-xs text-cyan-400 mb-2">
                            &gt; {selectedCategory.replace('_', ' ')} DATABASE
                        </div>

                        <div className="space-y-1">
                            {sortedEntries.map(entry => (
                                <button
                                    key={entry.id}
                                    onClick={() => handleSelectEntry(entry)}
                                    disabled={!entry.isUnlocked}
                                    className={`w-full text-left p-2 border transition-all ${!entry.isUnlocked
                                            ? 'border-gray-700 text-gray-700 cursor-not-allowed'
                                            : selectedEntryId === entry.id
                                                ? 'border-cyan-400 bg-cyan-400/10'
                                                : 'border-green-700 hover:border-green-500 hover:bg-green-900/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {entry.isUnlocked ? (
                                                <>
                                                    <div className="text-sm font-bold flex items-center gap-2">
                                                        {entry.title.split(':')[0]}
                                                        {entry.isNew && (
                                                            <span className="text-xs px-1 bg-yellow-500 text-black">NEW</span>
                                                        )}
                                                    </div>
                                                    {entry.subtitle && (
                                                        <div className="text-xs text-gray-400">{entry.subtitle}</div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-sm">
                                                    [CLASSIFIED]
                                                    <div className="text-xs">
                                                        {entry.category === 'ENEMY' && 'defeatsRequired' in entry && (
                                                            `Unlock: Defeat ${entry.defeatsRequired}x`
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {entry.isUnlocked && entry.readCount > 0 && (
                                            <div className="text-xs text-gray-500">
                                                Read: {entry.readCount}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {sortedEntries.length === 0 && (
                            <div className="text-center text-gray-600 py-8">
                                NO DATA AVAILABLE
                            </div>
                        )}
                    </div>

                    {/* Entry Display */}
                    <div className="flex-1 border-2 border-green-500 p-4 overflow-y-auto">
                        {selectedEntry && selectedEntry.isUnlocked ? (
                            <div>
                                {/* Entry Header */}
                                <div className="mb-4 pb-3 border-b-2 border-green-700">
                                    <div className="text-cyan-400 text-xs mb-1">
                                        &gt; {selectedEntry.category.replace('_', ' ')} FILE
                                    </div>
                                    <h2 className="text-xl font-bold text-cyan-400 mb-1">
                                        {selectedEntry.title}
                                    </h2>
                                    {selectedEntry.subtitle && (
                                        <div className="text-sm text-yellow-400">{selectedEntry.subtitle}</div>
                                    )}

                                    {/* Meta info */}
                                    <div className="text-xs text-gray-500 mt-2 flex gap-4">
                                        {selectedEntry.unlockedDate && (
                                            <span>
                                                Unlocked: {new Date(selectedEntry.unlockedDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        {selectedEntry.category === 'ENEMY' && 'threatLevel' in selectedEntry && (
                                            <span className="text-red-400">
                                                Threat: {getThreatStars(selectedEntry.threatLevel)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Entry Content */}
                                <div className="prose prose-invert max-w-none codex-content">
                                    {selectedEntry.content.split('\n').map((line, idx) => {
                                        // Simple markdown rendering
                                        if (line.startsWith('# ')) {
                                            return <h1 key={idx} className="text-2xl font-bold text-cyan-400 mt-6 mb-3">{line.slice(2)}</h1>;
                                        } else if (line.startsWith('## ')) {
                                            return <h2 key={idx} className="text-xl font-bold text-green-400 mt-4 mb-2">{line.slice(3)}</h2>;
                                        } else if (line.startsWith('### ')) {
                                            return <h3 key={idx} className="text-lg font-bold text-yellow-400 mt-3 mb-2">{line.slice(4)}</h3>;
                                        } else if (line.startsWith('> ')) {
                                            return <blockquote key={idx} className="border-l-4 border-yellow-500 pl-3 my-2 text-gray-400 italic">{line.slice(2)}</blockquote>;
                                        } else if (line.startsWith('- ')) {
                                            return <li key={idx} className="ml-4 text-green-300">{line.slice(2)}</li>;
                                        } else if (line.startsWith('**') && line.endsWith('**')) {
                                            return <p key={idx} className="font-bold text-white my-1">{line.slice(2, -2)}</p>;
                                        } else if (line === '---') {
                                            return <hr key={idx} className="border-green-700 my-4" />;
                                        } else if (line.trim() === '') {
                                            return <div key={idx} className="h-2" />;
                                        } else if (line.startsWith('*') && line.endsWith('*')) {
                                            return <p key={idx} className="italic text-gray-400 my-1">{line.slice(1, -1)}</p>;
                                        } else if (line.startsWith('→ ')) {
                                            return <div key={idx} className="text-cyan-400 hover:text-cyan-300 cursor-pointer ml-4 my-1">→ {line.slice(2)}</div>;
                                        } else {
                                            return <p key={idx} className="my-1 leading-relaxed">{line}</p>;
                                        }
                                    })}
                                </div>

                                {/* Tags */}
                                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                    <div className="mt-6 pt-4 border-t-2 border-green-700">
                                        <div className="text-xs text-gray-500 mb-2">TAGS:</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedEntry.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-green-900/30 border border-green-700 text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📁</div>
                                    <div>SELECT AN ENTRY FROM THE LIST</div>
                                    <div className="text-xs mt-2">OR UNLOCK MORE BY PLAYING</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-green-500 pt-3 mt-4 flex justify-between items-center">
                    <div className="text-sm">
                        <span className="text-cyan-400">DATABASE STATUS:</span>{' '}
                        {progress.unlocked}/{progress.total} ENTRIES UNLOCKED ({progress.percent}%)
                    </div>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border-2 border-green-500 hover:bg-green-900/30 transition-all"
                    >
                        &lt; RETURN TO MENU
                    </button>
                </div>
            </div>
        </div>
    );
};
