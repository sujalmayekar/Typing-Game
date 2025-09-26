import React, { useState, useEffect } from 'react';
import './Rules.css';

export default function Rules() {
    const [activeSection, setActiveSection] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveSection('rules');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="rules-container">
            <div className="rules-content">
                <div className="rules-row">
                    <div 
                        className={`rules-section ${activeSection === 'rules' ? 'active' : ''}`}
                        onMouseEnter={() => setActiveSection('rules')}
                    >
                        <h2 className="rules-title">Rules:</h2>
                        <div className="rules-text">
                            <p>Welcome to the mystical realm of TypeRacer, where your typing skills determine your fate in an enchanted forest adventure.</p>
                            
                            <p><strong>Game Mechanics:</strong></p>
                            <ul>
                                <li>Type the displayed text as accurately and quickly as possible</li>
                                <li>Each level presents unique challenges with different difficulty tiers</li>
                                <li>Your accuracy and speed determine your progression through the forest</li>
                                <li>Complete each level to advance deeper into the mystical realm</li>
                            </ul>

                            <p><strong>Level Completion Criteria:</strong></p>
                            <ul>
                                <li><strong>Beginner:</strong> 20 WPM minimum, 85% accuracy</li>
                                <li><strong>Intermediate:</strong> 35 WPM minimum, 90% accuracy</li>
                                <li><strong>Advanced:</strong> 50 WPM minimum, 95% accuracy</li>
                                <li><strong>Expert:</strong> 70 WPM minimum, 98% accuracy</li>
                                <li><strong>Master:</strong> 90 WPM minimum, 99% accuracy</li>
                            </ul>

                            <p>Each mistake slows your journey, while perfect typing accelerates your progress through the enchanted forest.</p>
                        </div>
                    </div>
                    <div className="rules-image">
                        <img src="/assets/Typing.png" alt="Typing keyboard" className="image-fill" />
                    </div>
                </div>

                <div className="rules-row">
                    <div 
                        className={`lore-section ${activeSection === 'lore' ? 'active' : ''}`}
                        onMouseEnter={() => setActiveSection('lore')}
                    >
                        <h2 className="lore-title">Lore:</h2>
                        <div className="lore-text">
                            <p>In the ancient realm of TypeRacer, a mystical forest holds the key to ultimate typing mastery. Legend speaks of a lone wanderer who discovered the power of words flowing like a river through their fingertips.</p>
                            
                            <p>Deep within the enchanted woods, where shadows dance with light and the very air hums with magical energy, lies the sacred typing grounds. Here, brave souls test their mettle against passages that shift and change with each attempt, never allowing the same challenge twice.</p>
                            
                            <p>The forest remembers every keystroke, every moment of hesitation, and every triumph. Those who master the art of swift and accurate typing find themselves transformed, their fingers dancing across the keyboard like leaves in the wind.</p>
                            
                            <p>Will you be the one to unlock the deepest secrets of the forest? The path awaits, and your journey begins with a single keystroke.</p>
                        </div>
                    </div>
                    <div className="lore-image">
                        <img src="/assets/The-Dwan.png" alt="Dawn forest scene" className="image-fill" />
                    </div>
                </div>
            </div>
        </div>
    );
}
