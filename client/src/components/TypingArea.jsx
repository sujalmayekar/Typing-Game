import React, { useRef, useEffect } from 'react';

// The visible cursor
const Cursor = () => <span className="cursor"></span>;

export default function TypingArea({ textToType, userInput, onInputChange, gameStatus }) {
    const inputRef = useRef(null);
    const textWrapperRef = useRef(null); // Ref for the element that will scroll

    // Keep the invisible textarea focused so the user can always type
    useEffect(() => {
        if (gameStatus !== 'finished') {
            inputRef.current.focus();
        }
    }, [gameStatus, textToType]);

    // This effect handles the line-by-line scrolling
    useEffect(() => {
        if (textWrapperRef.current) {
            // Find the span that represents the current cursor position
            const activeChar = textWrapperRef.current.querySelector('.active-char');
            
            if (activeChar) {
                // Get the line-height and the top position of the active character
                const lineHeight = parseFloat(getComputedStyle(activeChar).lineHeight);
                const charTop = activeChar.offsetTop;

                // Calculate which line the user is currently on (0-indexed)
                const currentLine = Math.floor(charTop / lineHeight);

                // We want to start scrolling when the user reaches the 3rd line (index 2).
                // For every line after the 2nd, we scroll up by one line's height.
                const scrollOffset = Math.max(0, currentLine - 1) * lineHeight;
                
                // Apply the scroll effect using transform
                textWrapperRef.current.style.transform = `translateY(-${scrollOffset}px)`;
            } else {
                 // Reset scroll when there is no text or cursor
                textWrapperRef.current.style.transform = 'translateY(0px)';
            }
        }
    }, [userInput, textToType]); // Rerun whenever the user types

    const renderText = () => {
        if (!textToType) return "Loading...";

        const textChars = textToType.split('');
        const inputChars = userInput.split('');

        return textChars.map((char, index) => {
            const isTyped = index < inputChars.length;
            const isCursorPosition = index === inputChars.length;

            let className = 'char-default';
            if (isTyped) {
                className = char === inputChars[index] ? 'char-correct' : 'char-incorrect';
            }
            // Add a special class to the character where the cursor is
            if (isCursorPosition) {
                className += ' active-char';
            }

            return (
                <span key={`${char}-${index}`} className={className}>
                    {isCursorPosition && <Cursor />}
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="typing-area-container" onClick={() => inputRef.current.focus()}>
            <div className="typing-area-display shared-typing-style">
                <div ref={textWrapperRef} className="text-scroll-wrapper">
                    {renderText()}
                </div>
            </div>
            <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => onInputChange(e.target.value)}
                className="typing-textarea shared-typing-style"
                disabled={gameStatus === 'finished'}
                spellCheck="false"
                autoFocus
            />
        </div>
    );
}

