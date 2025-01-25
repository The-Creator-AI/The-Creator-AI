import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface AutoResizingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    placeholder?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    minRows?: number;
    maxRows?: number;
}

const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(
    ({ placeholder, value, onChange, minRows = 1, maxRows = Infinity, ...rest }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        useImperativeHandle(ref, () => textareaRef.current!, []);

        useEffect(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = '0px'; // Reset height to calculate scrollHeight
                const scrollHeight = textareaRef.current.scrollHeight;

                // Calculate min and max height based on minRows and maxRows
                const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight, 10) || 20; // Fallback to 20px if lineHeight is not found
                const minHeight = minRows * lineHeight;
                const maxHeight = maxRows * lineHeight;

                // Apply height constraints
                const height = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
                textareaRef.current.style.height = height + 'px';
            }
        }, [value, minRows, maxRows]);

        return (
            <textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{ background: 'inherit' }}
                className={"resize-none overflow-hidden box-border bg-inherit" + (rest.className ? ` ${rest.className}` : '')}
                {...rest}
            />
        );
    }
);

AutoResizingTextarea.displayName = 'AutoResizingTextarea';

export default AutoResizingTextarea;