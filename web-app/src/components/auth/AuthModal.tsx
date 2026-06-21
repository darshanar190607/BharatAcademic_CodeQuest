import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { X } from 'lucide-react';

const AnimatedBrainCore = () => {
    const meshRef = useRef<any>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
            <MeshDistortMaterial
                color="#0ef"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
};

const AuthModal: React.FC = () => {
    const { isAuthModalOpen, closeAuthModal, login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Entrance animation using GSAP
    useEffect(() => {
        if (isAuthModalOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { scale: 0.8, opacity: 0, rotationY: 15 },
                { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, ease: 'back.out(1.5)' }
            );
        }
    }, [isAuthModalOpen]);

    if (!isAuthModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
            const payload = isLogin ? { email, password } : { name, email, password };

            const res = await axios.post(`http://localhost:5000${endpoint}`, payload, {
                withCredentials: true // important for cookies
            });

            login(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">

                {/* Click outside to close helper */}
                <div className="absolute inset-0 z-0" onClick={closeAuthModal} />

                <div
                    ref={containerRef}
                    className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden rounded-3xl bg-[#0a0e17] border border-cyan-500/20 shadow-2xl shadow-cyan-900/20"
                >
                    {/* Close Button */}
                    <button
                        onClick={closeAuthModal}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-300 backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>

                    {/* 3D Visual Section */}
                    <div className="relative md:w-1/2 h-[250px] md:h-auto bg-gradient-to-br from-cyan-900/30 to-purple-900/30 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent z-0" />
                        <div className="relative z-10 w-full h-full min-h-[300px]">
                            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                                <ambientLight intensity={0.5} />
                                <directionalLight position={[10, 10, 5]} intensity={1} color="#0ef" />
                                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#b000ff" />
                                <AnimatedBrainCore />
                                <Environment preset="city" />
                                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                            </Canvas>
                        </div>

                        {/* Overlay Text inside 3D Side */}
                        <div className="absolute bottom-8 left-0 right-0 text-center z-20 pointer-events-none">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                NeuroBright
                            </h3>
                            <p className="text-cyan-200/60 text-sm mt-2 tracking-widest uppercase">
                                {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center">

                        <motion.div
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-3xl font-extrabold text-white mb-2">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </h2>
                            <p className="text-gray-400 mb-8 text-sm">
                                {isLogin
                                    ? 'Access your personalized neural learning paths.'
                                    : 'Join the evolution of learning powered by advanced AI and BCI.'}
                            </p>

                            {error && (
                                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {!isLogin && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
                                            placeholder="Alan Turing"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
                                        placeholder="alan@example.com"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                                        {isLogin && <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400">Forgot?</a>}
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold tracking-widest uppercase hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,238,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Processing
                                        </span>
                                    ) : (
                                        isLogin ? 'Initialize Session' : 'Create Identity'
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    {isLogin ? "Don't have an identity yet?" : "Already initialized?"}{' '}
                                    <button
                                        onClick={toggleMode}
                                        className="text-cyan-400 hover:text-cyan-300 font-semibold underline-offset-4 hover:underline transition-all"
                                    >
                                        {isLogin ? 'Sign up here' : 'Sign in here'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
