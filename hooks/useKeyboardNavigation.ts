// Hook pour navigation au clavier avec touches fléchées
import { useEffect, useState, useCallback } from 'react';
import { tts } from '../services/ttsService';

interface NavigableElement {
    id: string;
    element: HTMLElement;
    label: string;
}

export const useKeyboardNavigation = (enabled: boolean = true) => {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [elements, setElements] = useState<NavigableElement[]>([]);

    // Trouver tous les éléments navigables
    const scanElements = useCallback(() => {
        const navigable = Array.from(
            document.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        );

        const mapped = navigable
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0; // Visible seulement
            })
            .map((el, index) => ({
                id: el.id || `nav-${index}`,
                element: el,
                label: el.getAttribute('aria-label') || el.textContent?.trim() || 'Sans label',
            }));

        setElements(mapped);
    }, []);

    // Naviguer vers un index
    const focusElement = useCallback((index: number) => {
        if (index < 0 || index >= elements.length) return;

        const item = elements[index];
        if (item) {
            item.element.focus();
            item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Annoncer avec TTS
            tts.announceFocus(item.element);

            setFocusedIndex(index);
        }
    }, [elements]);

    // Gestionnaire de touches
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                focusElement((focusedIndex + 1) % elements.length);
                break;

            case 'ArrowUp':
                e.preventDefault();
                focusElement((focusedIndex - 1 + elements.length) % elements.length);
                break;

            case 'ArrowRight':
                // Navigation horizontale (pour grilles, tabs, etc.)
                e.preventDefault();
                const nextHorizontal = focusedIndex + 1;
                if (nextHorizontal < elements.length) {
                    focusElement(nextHorizontal);
                }
                break;

            case 'ArrowLeft':
                e.preventDefault();
                const prevHorizontal = focusedIndex - 1;
                if (prevHorizontal >= 0) {
                    focusElement(prevHorizontal);
                }
                break;

            case 'Home':
                e.preventDefault();
                focusElement(0);
                tts.speak('Début de la liste', true);
                break;

            case 'End':
                e.preventDefault();
                focusElement(elements.length - 1);
                tts.speak('Fin de la liste', true);
                break;

            case 't':
            case 'T':
                // Toggle TTS
                if (e.ctrlKey) {
                    e.preventDefault();
                    const newState = !tts['enabled']; // Access private for toggle
                    tts.setEnabled(newState);
                    tts.speak(newState ? 'Synthèse vocale activée' : 'Synthèse vocale désactivée', true);
                }
                break;
        }
    }, [enabled, focusedIndex, elements, focusElement]);

    // Setup
    useEffect(() => {
        if (!enabled) return;

        // Scan initial
        scanElements();

        // Re-scan quand le DOM change
        const observer = new MutationObserver(() => {
            scanElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Écouter les touches
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            observer.disconnect();
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, handleKeyDown, scanElements]);

    // Annoncer le nombre d'éléments
    useEffect(() => {
        if (elements.length > 0) {
            tts.addToQueue(`${elements.length} éléments navigables`);
        }
    }, [elements.length]);

    return {
        focusedIndex,
        totalElements: elements.length,
        focusElement,
        currentElement: elements[focusedIndex],
    };
};
