import React from 'react';

// **FIX:** The sprite is now a simple, happy box.
// This is much easier to work with until you're ready for a final design.
const Sprite = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="8" fill="#283618"/>
        <circle cx="12" cy="14" r="3" fill="#fefae0"/>
        <circle cx="24" cy="14" r="3" fill="#fefae0"/>
        <path d="M10 24C10 21.7909 11.7909 20 14 20H22C24.2091 20 26 21.7909 26 24" stroke="#fefae0" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

export default Sprite;

