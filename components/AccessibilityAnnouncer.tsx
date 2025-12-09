import React, { useEffect, useRef } from 'react';
import { tts } from '../services/ttsService';

interface AccessibilityAnnouncerProps {
    message: string;
    priority?: 'polite' | 'assertive';
    clearAfter?: number; // ms avant de clear le message
}

/**
 * Composant pour annoncer des messages aux technologies d'assistance
 * Utilise ARIA live regions + TTS intégré
 */
export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
    message,
    priority = 'polite',
    clearAfter = 3000
}) => {
    const [displayMessage, setDisplayMessage] = React.useState(message);
    const previousMessage = useRef('');

    useEffect(() => {
        // Éviter les annonces répétées du même message
        if (message && message !== previousMessage.current) {
            setDisplayMessage(message);
            previousMessage.current = message;

            // Annoncer avec TTS
            tts.speak(message, priority === 'assertive');

            // Clear après délai
            if (clearAfter > 0) {
                const timeout = setTimeout(() => {
                    setDisplayMessage('');
                }, clearAfter);

                return () => clearTimeout(timeout);
            }
        }
    }, [message, priority, clearAfter]);

    return (
        <div
            role={priority === 'assertive' ? 'alert' : 'status'}
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
        >
            {displayMessage}
        </div>
    );
};
