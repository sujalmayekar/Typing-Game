import React from 'react';
import Sprite from './Sprite';

export default function RacingTrack({ progress, errorState }) {
    const cappedProgress = Math.min(progress, 100);
    const spriteContainerWidth = 36;
    const spritePosition = `calc(${cappedProgress}% - ${cappedProgress / 100 * spriteContainerWidth}px)`;

    return (
        <div style={{ padding: '0 20px' }}>
            <div style={{ width: '100%', height: '50px', backgroundColor: 'rgba(40, 54, 24, 0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                {/* **FIX:** Removed the 'sprite-running' className to stop the animation. */}
                <div style={{
                    position: 'absolute',
                    top: '7px',
                    transition: 'left 0.2s linear',
                    left: spritePosition
                }}
                     className={errorState ? 'sprite-stumbling' : ''}
                >
                    <Sprite />
                </div>
                {errorState && (<div style={{ position: 'absolute', top: '10px', fontSize: '30px', left: `calc(${spritePosition} + 35px)` }} className="rock-appearing">🪨</div>)}
            </div>
        </div>
    );
}

