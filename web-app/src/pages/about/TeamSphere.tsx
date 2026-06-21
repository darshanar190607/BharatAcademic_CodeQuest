import React, { useEffect, useRef, useState, useMemo } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TeamMember {
    name: string;
    role: string;
    image?: string;
    initials: string;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
    member: TeamMember;
    id: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATH UTILS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SCENE_DEPTH = 1000;
const SPHERE_RADIUS = 320; // Radius of the team sphere

const project = (x: number, y: number, z: number, width: number, height: number) => {
    const scale = SCENE_DEPTH / (SCENE_DEPTH - z);
    const x2d = x * scale + width / 2;
    const y2d = y * scale + height / 2;
    return { x: x2d, y: y2d, scale, zIndex: Math.floor(scale * 1000) };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEAM DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TEAM_DATA: TeamMember[] = [
    { name: "Darshan A.R", role: "Lead Engineer", initials: "DA" },
    { name: "Gokulnaath.N", role: "AI Architect", initials: "GN" },
    { name: "Nitin.M", role: "XR Developer", initials: "NM" },
    { name: "Varun Kumar.S.N", role: "BCI Researcher", initials: "VK" },
    // Adding placeholders to fill the sphere for visual balance if needed, 
    // or just spacing them evenly. 4 items is small for a sphere, 
    // so we might arrange them in a tetrahedron or ring.
    // Let's stick to the core team but maybe duplicate for effect or add "Future Members"
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function TeamSphere() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [activeItem, setActiveItem] = useState<number | null>(null);

    // Generate points on a sphere (Fibonacci Sphere algorithm for even distribution)
    // Since we only have 4 members, we'll place them manually or use a ring.
    // A ring (circle) might look better for 4 people than a sphere.
    // OR we can add some "filler" nodes to make it look like a network.
    const points = useMemo(() => {
        const pts: Point3D[] = [];
        const count = TEAM_DATA.length;

        // Arrange in a circle on the X-Z plane (horizontal ring)
        // or a Tetrahedron for true 3D
        const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

        for (let i = 0; i < count; i++) {
            // Equidistant points on a sphere? For 4, simple tetrahedron is best.
            // Let's do a simple ring for now, active "rolling" will tilt the ring.
            const theta = (i / count) * Math.PI * 2;
            const x = SPHERE_RADIUS * Math.cos(theta);
            const z = SPHERE_RADIUS * Math.sin(theta);
            const y = (i % 2 === 0 ? 1 : -1) * 80; // Zag up and down slightly

            pts.push({
                x, y, z,
                member: TEAM_DATA[i],
                id: i
            });
        }
        return pts;
    }, []);

    // Animation Loop
    useEffect(() => {
        let animationFrameId: number;
        let autoRotateX = 0.002;
        let autoRotateY = 0.005;

        const animate = () => {
            setRotation(prev => ({
                x: prev.x + autoRotateX,
                y: prev.y + autoRotateY
            }));
            // Interactive mouse influence could go here
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Mouse Interaction
    const handleMouseMove = (e: React.MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
        const y = (e.clientY / innerHeight - 0.5) * 2;

        // Check if user is hovering a card?
        // We update rotation speeds or target rotation here
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{
                position: 'relative',
                width: '100%',
                height: '800px', // Visible area
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                perspective: '1000px',
                overflow: 'hidden',
                cursor: 'grab'
            }}
        >
            <style>{`
            @keyframes pulse-ring {
                0% { box-shadow: 0 0 0 0 rgba(99,220,255, 0.4); }
                70% { box-shadow: 0 0 0 20px rgba(99,220,255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(99,220,255, 0); }
            }
        `}</style>

            {/* 3D Scene Center */}
            <div style={{
                position: 'absolute',
                width: 0,
                height: 0,
                top: '50%',
                left: '50%',
                transformStyle: 'preserve-3d'
            }}>
                {points.map((pt, i) => {
                    // 3D Rotation Math
                    // Rotate Y
                    let x = pt.x * Math.cos(rotation.y) - pt.z * Math.sin(rotation.y);
                    let z = pt.z * Math.cos(rotation.y) + pt.x * Math.sin(rotation.y);
                    let y = pt.y;

                    // Rotate X
                    let yNew = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
                    let zNew = z * Math.cos(rotation.x) + y * Math.sin(rotation.x);
                    y = yNew;
                    z = zNew;

                    // Project
                    const { x: x2d, y: y2d, scale, zIndex } = project(x, y, z, 0, 0);
                    const opacity = Math.max(0.2, Math.min(1, (z + SPHERE_RADIUS) / (SPHERE_RADIUS * 1.5))); // Fade back items
                    const blur = Math.max(0, (1 - scale) * 10); // Blur distant items

                    return (
                        <div
                            key={pt.id}
                            onClick={() => setActiveItem(pt.id)}
                            style={{
                                position: 'absolute',
                                transform: `translate(-50%, -50%) translate3d(${x2d}px, ${y2d}px, 0) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: opacity,
                                filter: `blur(${blur}px)`,
                                transition: 'transform 0.1s linear', // Smooth out frame updates
                                pointerEvents: 'auto'
                            }}
                        >
                            {/* Card Content */}
                            <div style={{
                                background: 'rgba(2, 6, 23, 0.7)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(99, 220, 255, 0.3)',
                                padding: '20px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                width: '180px',
                                boxShadow: `0 0 ${20 * scale}px rgba(14, 165, 233, ${0.3 * scale})`,
                                animation: activeItem === pt.id ? 'pulse-ring 2s infinite' : 'none'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    color: 'white',
                                    marginBottom: '4px',
                                    border: '2px solid rgba(255,255,255,0.2)'
                                }}>
                                    {pt.member.initials}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        margin: 0,
                                        fontFamily: "'Rajdhani', sans-serif"
                                    }}>{pt.member.name}</h3>
                                    <p style={{
                                        color: '#63dcff',
                                        fontSize: '12px',
                                        margin: '4px 0 0',
                                        fontFamily: "'DM Mono', monospace",
                                        opacity: 0.8
                                    }}>{pt.member.role}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
