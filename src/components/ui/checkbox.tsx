import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        return (
            <div className="relative inline-flex">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    ref={ref}
                    {...props}
                />
                <div
                    className={cn(
                        'h-4 w-4 rounded border border-gray-300 flex items-center justify-center transition-colors',
                        checked ? 'bg-blue-600 border-blue-600' : 'bg-white',
                        'hover:border-blue-400 cursor-pointer',
                        className
                    )}
                    onClick={() => onCheckedChange?.(!checked)}
                >
                    {checked && <Check className="h-3 w-3 text-white" />}
                </div>
            </div>
        );
    }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
