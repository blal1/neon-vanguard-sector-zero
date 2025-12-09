import React from 'react';

interface ScreenReaderOnlyProps {
    children: React.ReactNode;
    as?: keyof JSX.IntrinsicElements;
}

/**
 * Component pour du contenu visible uniquement par les lecteurs d'écran
 * Suit les meilleures pratiques WCAG pour le texte SR-only
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
    children,
    as: Component = 'span'
}) => {
    return (
        <Component className="sr-only">
            {children}
        </Component>
    );
};
