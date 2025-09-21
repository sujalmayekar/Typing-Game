import React from 'react';

export default function Stats({ timer, gameStatus }) {
    // Show the simplified timer before the game starts ('waiting') 
    // and while it is ongoing ('started').
    if (gameStatus === 'waiting' || gameStatus === 'started') {
        return (
            <div className="stats-container-storyboard">
                Time: {timer}
            </div>
        );
    }

    // When the game is finished, the Results modal shows all the stats,
    // so we render nothing from this component.
    return null;
}

