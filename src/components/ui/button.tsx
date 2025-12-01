import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer',
                    {
                        'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-600':
                            variant === 'default',
                        'bg-linear-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-red-800 focus-visible:ring-red-600':
                            variant === 'destructive',
                        'border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400 focus-visible:ring-blue-400 font-semibold':
                            variant === 'outline',
                        'bg-linear-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus-visible:ring-gray-400':
                            variant === 'secondary',
                        'hover:bg-gray-100 hover:text-gray-900 font-medium': variant === 'ghost',
                        'text-blue-600 underline-offset-4 hover:underline font-semibold': variant === 'link',
                    },
                    {
                        'h-11 px-6 py-2.5': size === 'default',
                        'h-9 px-4 text-xs': size === 'sm',
                        'h-12 px-8 text-base': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
