import React, { useRef, useEffect } from 'react';

// A simple component for our custom cursor
const Cursor = () => <span className="cursor"></span>;

export default function TypingArea({ textToType, userInput, onInputChange, gameStatus }) {
    const inputRef = useRef(null);

    // Keep the invisible textarea focused
    useEffect(() => {
        if (gameStatus !== 'finished') {
            inputRef.current.focus();
        }
    }, [gameStatus, textToType]);

    const renderTextWithCursor = () => {
        if (!textToType) return "Loading...";

        const textChars = textToType.split('');
        const inputChars = userInput.split('');

        return (
            <>
                {textChars.map((char, index) => {
                    const isTyped = index < inputChars.length;
                    const isCorrect = isTyped && char === inputChars[index];
                    const isIncorrect = isTyped && char !== inputChars[index];
                    
                    let className = 'char-default';
                    if (isCorrect) className = 'char-correct';
                    if (isIncorrect) className = 'char-incorrect';

                    // Place the cursor BEFORE the character at the current typing position
                    const isCursorPosition = index === inputChars.length;

                    return (
                        <React.Fragment key={`${char}-${index}`}>
                            {isCursorPosition && <Cursor />}
                            <span className={className}>{char}</span>
                        </React.Fragment>
                    );
                })}
                {/* If user has typed all characters, show cursor at the end */}
                {userInput.length === textToType.length && <Cursor />}
            </>
        );
    };

    return (
        // Allow clicking anywhere in the container to focus the hidden textarea
        <div className="typing-area-container" onClick={() => inputRef.current.focus()}>
            <div className="typing-area-display shared-typing-style">
                {renderTextWithCursor()}
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
