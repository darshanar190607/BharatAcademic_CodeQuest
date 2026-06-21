import React, { useRef, useState, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Sphere, ContactShadows, Environment,
  Trail, Stars, Float, Text, Html, Sparkles, Line
} from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// --- TYPES ---
interface TeamMember {
  name: string;
  role: string;
  desc: string;
  github: string;
  leetcode: string;
  color: string;
  initials: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Darshan A.R",
    role: "Lead Engineer",
    desc: "Architected the core BCI-AI adaptation engine and scalable full-stack infrastructure.",
    github: "https://github.com/darshanar",
    leetcode: "https://leetcode.com/darshanar",
    color: "#be185d", // Pink-Red
    initials: "DA"
  },
  {
    name: "Gokulnaath.N",
    role: "AI Architect",
    desc: "Designed the Gemini-powered generative learning models and prompt engineering systems.",
    github: "#",
    leetcode: "#",
    color: "#7c3aed", // Violet
    initials: "GN"
  },
  {
    name: "Nitin.M",
    role: "XR Developer",
    desc: "Built the immersive Three.js & WebXR environments for gamified re-engagement.",
    github: "#",
    leetcode: "#",
    color: "#059669", // Emerald
    initials: "NM"
  },
  {
    name: "Varun Kumar.S.N",
    role: "BCI Researcher",
    desc: "Developed the signal processing algorithms to interpret EEG data for cognitive state detection.",
    github: "#",
    leetcode: "#",
    color: "#0ea5e9", // Sky Blue
    initials: "VK"
  },
];

// --- 3D COMPONENTS ---

function TeamOrb({ member, position, onClick }: { member: TeamMember, position: [number, number, number], onClick: (m: TeamMember) => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
      mesh.current.rotation.z += 0.002;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Outer Glass Shell */}
        <mesh
          ref={mesh}
          onClick={(e) => { e.stopPropagation(); onClick(member); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
          scale={hovered ? 1.1 : 1}
        >
          <icosahedronGeometry args={[0.7, 0]} /> {/* Techy Low Poly Look */}
          <meshPhysicalMaterial
            color={member.color}
            thickness={2}
            roughness={0.1}
            metalness={0.1}
            transmission={0.6} // Reduced for visibility
            emissive={member.color}
            emissiveIntensity={0.5} // Added Glow
            ior={1.5}
            clearcoat={1}
            attenuationColor="#ffffff"
            attenuationDistance={1}
          />
        </mesh>

        {/* Inner Glowing Core */}
        <mesh scale={0.4}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={member.color} />
        </mesh>

        {/* Connecting Line (HUD Style) */}
        <Html position={[0.8, 0.8, 0]} transform sprite distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className={`flex items-center gap-2 transition-all duration-500 ${hovered ? 'scale-110 opacity-100' : 'opacity-70'}`}>
            <div className="w-12 h-[1px] bg-white/50" />
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono tracking-widest text-white uppercase whitespace-nowrap bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border-l-2 border-white/50">
                {member.name}
              </span>
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function ExplosionParticles({ active }: { active: boolean }) {
  const count = 400;
  const [positions, setPositions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  });

  const points = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (!active || !points.current) return;

    // Expand particles outward in a spiral or noise pattern
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Spiral expansion
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      positions[i * 3] += x * 0.02 + (Math.random() - 0.5) * 0.05;
      positions[i * 3 + 1] += y * 0.02 + (Math.random() - 0.5) * 0.05;
      positions[i * 3 + 2] += z * 0.02 + (Math.random() - 0.5) * 0.05;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    // Fade out
    if ((points.current.material as THREE.PointsMaterial).opacity > 0) {
      (points.current.material as THREE.PointsMaterial).opacity -= 0.002;
    }
  });

  if (!active) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#93c5fd" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}


function SceneContent({ smoothProgress, onMemberSelect }: { smoothProgress: any, onMemberSelect: (m: TeamMember) => void }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [exploded, setExploded] = useState(false);

  // -- SCROLL MAPPING --
  // Zig Zag: Left -> Right -> Center
  // Note: Range extended to keep pace with longer scroll
  const xMove = useTransform(smoothProgress, [0, 0.2, 0.4, 0.6, 0.85], [-4, 4, -4, 4, 0]);
  const zMove = useTransform(smoothProgress, [0, 0.85, 0.95], [0, 0, 8]); // Move CLOSER at end
  const scale = useTransform(smoothProgress, [0.85, 0.93], [1, 0.1]); // Shrink before explode

  useFrame((state) => {
    const p = smoothProgress.get();

    // Check for "Explosion" trigger
    if (p > 0.93 && !exploded) {
      setExploded(true);
    } else if (p < 0.88 && exploded) {
      setExploded(false);
    }

    if (sphereRef.current) {
      sphereRef.current.position.x = xMove.get();
      sphereRef.current.position.z = zMove.get();
      sphereRef.current.rotation.x += 0.01;
      sphereRef.current.rotation.y += 0.01;

      const s = scale.get();
      sphereRef.current.scale.set(s, s, s);
    }

    // Smoother Camera Follow
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, xMove.get() * 0.1, 0.05);
  });

  return (
    <>
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#60a5fa" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
      <directionalLight position={[-5, 5, 5]} intensity={1.5} color="#ffffff" />

      {/* MAIN SPHERE (The Protagonist) */}
      {!exploded && (
        <group>
          {/* Core Sphere */}
          <Trail width={3} length={6} color="#3b82f6" attenuation={(t) => t * t}>
            <mesh ref={sphereRef}>
              <icosahedronGeometry args={[1.2, 10]} />
              <meshStandardMaterial
                color="#2563eb"
                roughness={0.1}
                metalness={0.9}
                emissive="#1e40af"
                emissiveIntensity={0.2}
              />
            </mesh>
          </Trail>
          {/* Outer Glow Halo */}
          <mesh position={[sphereRef.current?.position.x || 0, sphereRef.current?.position.y || 0, sphereRef.current?.position.z || 0]} scale={1.4}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} side={THREE.BackSide} />
          </mesh>
        </group>
      )}

      {/* EXPLOSION EFFECT */}
      <ExplosionParticles active={exploded} />

      {/* TEAM ORBS (Appear after explosion) */}
      {exploded && (
        <group position={[0, 0, 5]}>
          <Sparkles count={150} scale={15} size={3} speed={0.2} opacity={0.4} color="#ffffff" />

          {/* Diamond Formation for clean look */}
          <TeamOrb member={TEAM[0]} position={[0, 2.2, 0]} onClick={onMemberSelect} />  {/* Top */}
          <TeamOrb member={TEAM[1]} position={[-3, 0, 0]} onClick={onMemberSelect} />   {/* Left */}
          <TeamOrb member={TEAM[2]} position={[3, 0, 0]} onClick={onMemberSelect} />    {/* Right */}
          <TeamOrb member={TEAM[3]} position={[0, -2.2, 0]} onClick={onMemberSelect} /> {/* Bottom */}


        </group>
      )}

      <Environment preset="night" />
    </>
  );
}

// --- UI COMPONENTS ---

const Modal = ({ member, onClose }: { member: TeamMember, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0a0f1e] border border-white/10 p-0 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Side Bar */}
        <div className="w-full md:w-1/3 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(circle at center, ${member.color}, transparent 70%)` }}
          />
          <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white relative z-10 bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {member.initials}
          </div>
          <h3 className="text-xl font-bold text-white mt-6 text-center">{member.name}</h3>
          <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mt-2 text-center">{member.role}</p>
        </div>

        {/* Content Area */}
        <div className="p-8 w-full md:w-2/3 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contribution</h4>
          <p className="text-gray-300 leading-relaxed text-sm mb-8">
            {member.desc}
          </p>

          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Connect</h4>
          <div className="flex gap-4">
            <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
              <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white">GitHub</span>
            </a>
            <a href={member.leetcode} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
              <svg className="w-5 h-5 text-yellow-600/70 group-hover:text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.173 5.79a1.372 1.372 0 0 0-.134 1.66c.264.444.733.722 1.25.74l10.384.34a1.382 1.382 0 0 0 1.417-1.332 1.38 1.38 0 0 0-1.328-1.428L8.38 5.43l3.896-3.899a1.371 1.371 0 0 0 .151-1.666A1.376 1.376 0 0 0 11.466 0zM7.052 7.7a1.376 1.376 0 0 0-.547.251L1.65 12.046a1.376 1.376 0 0 0 .153 2.257l5.352 2.682a1.377 1.377 0 0 0 1.956-.607 1.378 1.378 0 0 0-.614-1.848L4.69 12.63l3.774-3.14a1.374 1.374 0 0 0 .341-.958 1.38 1.38 0 0 0-1.753-.832zM12.924 16.48a1.371 1.371 0 0 0-.256-.025L2.284 16.115a1.382 1.382 0 0 0-1.417 1.331 1.38 1.38 0 0 0 1.329 1.428l10.381.34 5.352 2.687a1.375 1.375 0 0 0 1.9-.356 1.374 1.374 0 0 0 .044-1.74l-4.85-4.85a1.37 1.37 0 0 0-.916-.437z" /></svg>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white">LeetCode</span>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function AboutUs() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Modern Glass Cards
  const contentBoxStyle = "bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl max-w-2xl relative z-10 transition-transform hover:scale-[1.005] duration-500 overflow-hidden group";
  const glowStyle = "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"; // Subtle hover glow
  const sectionStyle = "min-h-[90vh] flex items-center px-10 md:px-32 relative z-50 py-20 pointer-events-none";

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#020617] text-white font-sans overflow-x-hidden overflow-y-scroll relative selection:bg-blue-500/30">

      {/* 3D CANVAS */}
      <div className="fixed inset-0 w-full h-screen z-0">
        <Canvas camera={{ position: [0, 2, 14], fov: 45 }} gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
          <Suspense fallback={null}>
            <SceneContent smoothProgress={smoothProgress} onMemberSelect={setSelectedMember} />
          </Suspense>
        </Canvas>
      </div>

      {/* OVERLAY CONTENT */}
      <main className="relative z-50 font-sans pointer-events-none">

        {/* Section 1: Challenge */}
        <section className={sectionStyle + " justify-start"}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={contentBoxStyle}
          >
            <div className={glowStyle} />
            <h1 className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase leading-none mb-6 relative z-10">
              The Challenge
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light relative z-10">
              Neuroadaptive EdTech aims to solve static content delivery. We harness real-time brainwave data to trigger creative, context-aware interventions.
            </p>
          </motion.div>
        </section>

        {/* Section 2: BCI */}
        <section className={sectionStyle + " justify-end text-right"}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={contentBoxStyle}
          >
            <div className={glowStyle} />
            <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300 uppercase relative z-10">
              BCI Simulation
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light relative z-10">
              Our prototype simulates Focused, Neutral, and Drowsy states, providing a realistic foundation for brain-aware educational feedback loops.
            </p>
          </motion.div>
        </section>

        {/* Section 3: Gemini */}
        <section className={sectionStyle + " justify-start"}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={contentBoxStyle}
          >
            <div className={glowStyle} />
            <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase relative z-10">
              Gemini AI Core
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light relative z-10">
              Leveraging the Google Gemini API, we dynamically generate personalized course outlines, analogies, and quizzes adapted to the user's cognitive state.
            </p>
          </motion.div>
        </section>

        {/* Section 4: VR */}
        <section className={sectionStyle + " justify-end text-right"}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={contentBoxStyle}
          >
            <div className={glowStyle} />
            <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 uppercase relative z-10">
              Immersive WebXR
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light relative z-10">
              Using Three.js and WebXR, we deliver VR mini-games designed to re-engage attention when focus drops during a learning session.
            </p>
          </motion.div>
        </section>

        {/* FINAL PHASE: Increased spacing to allow text to leave before explosion */}
        <section className="h-[200vh] relative z-20 pointer-events-none">
          {/* Empty space for transition */}
        </section>
      </main>

      {/* TEAM MODAL OVERLAY */}
      <AnimatePresence>
        {selectedMember && (
          <Modal member={selectedMember} onClose={() => setSelectedMember(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}