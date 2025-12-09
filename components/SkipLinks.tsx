import React from 'react';
import { ScreenReaderOnly } from './ScreenReaderOnly';

interface SkipLinksProps {
    links: Array<{
        href: string;
        label: string;
    }>;
}

/**
 * Skip Links pour navigation rapide au clavier
 * Conforme WCAG 2.4.1 - Bypass Blocks
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
    return (
        <nav aria-label="Liens de navigation rapide" className="skip-links-container">
            {links.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className="skip-link sr-only-focusable"
                >
                    {link.label}
                </a>
            ))}
        </nav>
    );
};

/**
 * Skip Links par défaut pour le jeu
 */
export const DefaultSkipLinks: React.FC = () => {
    const defaultLinks = [
        { href: '#main-content', label: 'Aller au contenu principal' },
        { href: '#main-navigation', label: 'Aller à la navigation' },
        { href: '#combat-actions', label: 'Aller aux actions de combat' },
    ];

    return <SkipLinks links={defaultLinks} />;
};
