import React from 'react';
import { ScreenReaderOnly } from './ScreenReaderOnly';
import { useTranslation } from 'react-i18next';

interface SkipLinksProps {
    links: Array<{
        href: string;
        label: string;
    }>;
}

/**
 * Skip Links for quick keyboard navigation
 * WCAG 2.4.1 Compliant - Bypass Blocks
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
    const { t } = useTranslation();
    return (
        <nav aria-label={t('accessibility.skipNav')} className="skip-links-container">
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
 * Default skip links for the game
 */
export const DefaultSkipLinks: React.FC = () => {
    const defaultLinks = [
        { href: '#main-content', label: 'Skip to main content' },
        { href: '#main-navigation', label: 'Skip to navigation' },
        { href: '#combat-actions', label: 'Skip to combat actions' },
    ];

    return <SkipLinks links={defaultLinks} />;
};
