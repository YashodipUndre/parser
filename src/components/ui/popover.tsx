'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const Popover = ({ children }: PopoverProps) => {
    return <div className="relative">{children}</div>;
};

const PopoverTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, ...props }, ref) => {
    return (
        <button ref={ref} onClick={onClick} {...props}>
            {children}
        </button>
    );
});
PopoverTrigger.displayName = 'PopoverTrigger';

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'center' | 'end';
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
    ({ className, align = 'center', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'absolute z-50 mt-2 rounded-md border border-gray-200 bg-white p-4 shadow-lg',
                    align === 'end' && 'right-0',
                    align === 'start' && 'left-0',
                    align === 'center' && 'left-1/2 -translate-x-1/2',
                    className
                )}
                {...props}
            />
        );
    }
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
