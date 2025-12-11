import React from 'react';

interface ScreenReaderOnlyProps {
    children: React.ReactNode;
    as?: keyof JSX.IntrinsicElements;
}

/**
 * Component for content visible only to screen readers
 * Follows WCAG best practices for SR-only text
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
