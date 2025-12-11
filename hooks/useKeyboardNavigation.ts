// Hook for keyboard navigation with arrow keys
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

    // Find all navigable elements
    const scanElements = useCallback(() => {
        const navigable = Array.from(
            document.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        );

        const mapped = navigable
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0; // Visible only
            })
            .map((el, index) => ({
                id: el.id || `nav-${index}`,
                element: el,
                label: el.getAttribute('aria-label') || el.textContent?.trim() || 'Unlabeled',
            }));

        setElements(mapped);
    }, []);

    // Navigate to an index
    const focusElement = useCallback((index: number) => {
        if (index < 0 || index >= elements.length) return;

        const item = elements[index];
        if (item) {
            item.element.focus();
            item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Announce with TTS
            tts.announceFocus(item.element);

            setFocusedIndex(index);
        }
    }, [elements]);

    // Key handler
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
                // Horizontal navigation (for grids, tabs, etc.)
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
                tts.speak('Start of list', true);
                break;

            case 'End':
                e.preventDefault();
                focusElement(elements.length - 1);
                tts.speak('End of list', true);
                break;

            case 't':
            case 'T':
                // Toggle TTS
                if (e.ctrlKey) {
                    e.preventDefault();
                    const newState = !tts['enabled']; // Access private for toggle
                    tts.setEnabled(newState);
                    tts.speak(newState ? 'Text-to-speech enabled' : 'Text-to-speech disabled', true);
                }
                break;
        }
    }, [enabled, focusedIndex, elements, focusElement]);

    // Setup
    useEffect(() => {
        if (!enabled) return;

        // Initial scan
        scanElements();

        // Re-scan when DOM changes
        const observer = new MutationObserver(() => {
            scanElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Listen for keystrokes
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            observer.disconnect();
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, handleKeyDown, scanElements]);

    // Announce number of elements
    useEffect(() => {
        if (elements.length > 0) {
            tts.addToQueue(`${elements.length} navigable elements`);
        }
    }, [elements.length]);

    return {
        focusedIndex,
        totalElements: elements.length,
        focusElement,
        currentElement: elements[focusedIndex],
    };
};
