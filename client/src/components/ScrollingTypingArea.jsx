import React, { useRef, useLayoutEffect } from 'react';

// A simple component for our custom cursor
const Cursor = () => <span className="cursor"></span>;

export default function ScrollingTypingArea({ textToType, userInput, onInputChange, gameStatus }) {
    const inputRef = useRef(null);
    const textWrapperRef = useRef(null);
    const lineHeightRef = useRef(0);

    // Keep the invisible textarea focused
    useLayoutEffect(() => {
        if (gameStatus !== 'finished') {
            inputRef.current.focus();
        }
    }, [gameStatus]);

    // This is the definitive scrolling logic. It runs after every render
    // but before the browser paints, ensuring smooth, flicker-free updates.
    useLayoutEffect(() => {
        if (!textWrapperRef.current || !textToType) return;

        // Measure line height once per text block for efficiency
        if (lineHeightRef.current === 0) {
            const span = textWrapperRef.current.querySelector('span');
            if (span) {
                lineHeightRef.current = span.offsetHeight;
            }
        }
        const lineHeight = lineHeightRef.current;
        if (lineHeight === 0) return;

        // Find the cursor to determine the active line
        const cursorEl = textWrapperRef.current.querySelector('.cursor');
        
        // Calculate which line the user is currently on (0-indexed)
        const currentLine = cursorEl ? Math.floor(cursorEl.offsetTop / lineHeight) : 0;

        // This is the key calculation:
        // Move the entire text block up by one line height for each line the user completes.
        // On the first line (currentLine = 0), the offset is 0, so the text is at the top.
        // On the second line (currentLine = 1), the text moves up by exactly one line height.
        const scrollOffset = -currentLine * lineHeight;

        // Apply the transform to scroll the text.
        textWrapperRef.current.style.transform = `translateY(${scrollOffset}px)`;

    }, [userInput, textToType, gameStatus]);
    
    // Reset the line height measurement when the text changes to avoid stale values
    useLayoutEffect(() => {
        lineHeightRef.current = 0;
    }, [textToType]);


    const renderText = () => {
        if (!textToType) return "Loading...";

        const textChars = textToType.split('');
        const inputChars = userInput.split('');
        const cursorPosition = inputChars.length;

        return (
            <>
                {textChars.map((char, index) => {
                    const isTyped = index < cursorPosition;
                    const isCorrect = isTyped && char === inputChars[index];
                    const isIncorrect = isTyped && char !== inputChars[index];
                    
                    let className = 'char-default';
                    if (isCorrect) className = 'char-correct';
                    if (isIncorrect) className = 'char-incorrect';

                    const isCursor = index === cursorPosition;

                    return (
                        <React.Fragment key={`${char}-${index}`}>
                            {isCursor && <Cursor />}
                            <span className={className}>{char}</span>
                        </React.Fragment>
                    );
                })}
                {cursorPosition === textToType.length && <Cursor />}
            </>
        );
    };

    return (
        <div className="typing-area-container" onClick={() => inputRef.current.focus()}>
            <div className="typing-area-display shared-typing-style monkey-scroll">
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

