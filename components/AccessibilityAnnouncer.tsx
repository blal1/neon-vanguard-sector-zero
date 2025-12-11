import React, { useEffect, useRef } from 'react';
import { tts } from '../services/ttsService';
import { useTranslation } from 'react-i18next';

interface AccessibilityAnnouncerProps {
    message: string;
    priority?: 'polite' | 'assertive';
    clearAfter?: number; // ms before clearing the message
}

/**
 * Component for announcing messages to assistive technologies
 * Uses ARIA live regions + integrated TTS
 */
export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
    message,
    priority = 'polite',
    clearAfter = 3000
}) => {
    const { t } = useTranslation();
    const [displayMessage, setDisplayMessage] = React.useState(message);
    const previousMessage = useRef('');

    useEffect(() => {
        // Avoid repeated announcements of the same message
        if (message && message !== previousMessage.current) {
            setDisplayMessage(message);
            previousMessage.current = message;

            // Announce with TTS
            tts.speak(message, priority === 'assertive');

            // Clear after delay
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
