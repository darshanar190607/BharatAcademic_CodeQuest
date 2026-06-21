import React, { useEffect, useRef } from 'react';

export const OpticsAnimation: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const gsap = (window as any).gsap;
        if (!gsap || !containerRef.current) return;

        const svg = containerRef.current.querySelector('svg');
        if (!svg) return;

        const { width, height } = svg.getBoundingClientRect();

        const beam = svg.querySelector('#beam');
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        const refractedBeams = Array.from(svg.querySelectorAll('.refracted-beam'));

        gsap.set(beam, {
            x: -width * 0.6,
            y: height * 0.5,
            scaleY: 0.2,
        });

        refractedBeams.forEach(rBeam => {
            gsap.set(rBeam, {
                opacity: 0,
                transformOrigin: '0% 50%',
            });
        });

        const tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.to(beam, {
            duration: 2,
            x: width * 0.45,
            ease: 'power1.inOut',
        }).to(refractedBeams, {
            duration: 1.5,
            opacity: 1,
            stagger: {
                each: 0.05,
                from: 'center',
            },
            scaleX: 2.5,
            ease: 'power2.out',
        }, "-=1.5");


        // Mouse interaction
        const handleMouseMove = (e: MouseEvent) => {
            const rect = svg.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const newY = gsap.utils.mapRange(0, rect.height, height * 0.25, height * 0.75, y);
            
            gsap.to(beam, {
                duration: 0.5,
                y: newY,
                ease: 'power2.out'
            });

            refractedBeams.forEach((rBeam, i) => {
                const rotation = gsap.utils.mapRange(0, rect.height, -25, 25, y);
                gsap.to(rBeam, {
                    duration: 0.5,
                    rotation: rotation + (i - Math.floor(colors.length / 2)) * 6,
                    ease: 'power2.out'
                });
            });
        };

        svg.addEventListener('mousemove', handleMouseMove);

        return () => {
            tl.kill();
            svg.removeEventListener('mousemove', handleMouseMove);
        };

    }, []);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 800 500">
                {/* Prism */}
                <polygon points="400,100 250,400 550,400" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="3" />

                {/* Incoming Light Beam */}
                <rect id="beam" x="0" y="0" width="100%" height="2" fill="white" />

                {/* Refracted Beams */}
                <g transform="translate(450, 250)">
                    {['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'].map((color, i) => (
                        <rect 
                            key={color}
                            className="refracted-beam"
                            x="0" 
                            y="0" 
                            width="100%" height="1.5" 
                            fill={color} 
                            style={{ mixBlendMode: 'screen', transform: `rotate(${(i - 3) * 6}deg)` }}
                        />
                    ))}
                </g>
                 <text x="50" y="50" fontFamily="Arial" fontSize="20" fill="gray">Move your mouse over the animation</text>
            </svg>
        </div>
    );
};