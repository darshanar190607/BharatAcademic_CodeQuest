
import React from 'react';

const Confetti: React.FC<{ shapes?: string[] | null }> = ({ shapes }) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const numPieces = 150;
    const pieces = [];

    for (let i = 0; i < numPieces; i++) {
        pieces.push({
            initialX: Math.random() * 100,
            rotation: Math.random() * 360,
            delay: Math.random() * 1.5,
            duration: 3 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes && shapes.length > 0 ? shapes[Math.floor(Math.random() * shapes.length)] : null,
        });
    }

    return (
        <>
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-20vh) rotateZ(0deg) rotateY(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) rotateZ(720deg) rotateY(360deg);
                        opacity: 0;
                    }
                }
                .confetti-piece {
                    position: absolute;
                    top: 0;
                    opacity: 0;
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
                .confetti-piece.rect {
                    width: 10px;
                    height: 18px;
                }
                .confetti-piece.shape {
                    width: 20px;
                    height: 20px;
                }
            `}</style>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[9999] overflow-hidden">
                {pieces.map((p, i) => (
                    p.shape ? (
                        <svg
                            key={i}
                            className="confetti-piece shape"
                            style={{
                                left: `${p.initialX}%`,
                                transform: `rotate(${p.rotation}deg)`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                            viewBox="0 0 24 24"
                            fill={p.color}
                            stroke="none"
                        >
                            <path d={p.shape} />
                        </svg>
                    ) : (
                        <div
                            key={i}
                            className="confetti-piece rect"
                            style={{
                                left: `${p.initialX}%`,
                                backgroundColor: p.color,
                                transform: `rotate(${p.rotation}deg)`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    )
                ))}
            </div>
        </>
    );
};

export default Confetti;