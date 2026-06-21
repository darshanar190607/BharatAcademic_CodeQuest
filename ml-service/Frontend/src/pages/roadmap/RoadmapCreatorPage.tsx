import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import GameifiedRoadmap from '../../features/roadmap/GameifiedRoadmap.tsx';

const characters = [
    { name: 'Robot', url: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb', power: 'Precision Reminder - Never miss a study session with perfectly timed, logical reminders.' },
    { name: 'Astronaut', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', power: 'Cosmic Focus - Filters out distractions, allowing for deep, uninterrupted learning sessions.' },
    { name: 'Mococo', url: 'https://darshanar190607.github.io/GLB/mococo_abyssgard.glb', power: 'Abyssal Wisdom - Uncovers deep insights and hidden connections within complex topics.' },
    { name: 'Fox', url: 'https://modelviewer.dev/shared-assets/models/Fox.glb', power: 'Adaptive Strategy - Quickly identifies the most efficient path through a topic, adapting to your learning style.' },
    { name: 'Horse', url: 'https://modelviewer.dev/shared-assets/models/Horse.glb', power: 'Steady Pace - Maintains a consistent and reliable learning momentum, preventing burnout on long journeys.' },
    { name: 'Brain Stem', url: 'https://modelviewer.dev/shared-assets/models/BrainStem.glb', power: 'Core Knowledge - Focuses on the foundational "brain stem" of any topic, ensuring deep and lasting comprehension.' },
];

const RoadmapCreator: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const originalColorsRef = useRef(new Map<string, THREE.Color>());

    const [character, setCharacter] = useState(characters[0]);
    const [customColor, setCustomColor] = useState<string | null>(null);
    const [roadmapData, setRoadmapData] = useState<any>(null);
    const [roadmapTopic, setRoadmapTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!mountRef.current || roadmapData) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.2, 2.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        currentMount.innerHTML = ''; // Clear previous renderer
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 1.0, 0);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minPolarAngle = Math.PI / 2.5;
        controls.maxPolarAngle = Math.PI / 1.8;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.75;

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
        dirLight1.position.set(5, 5, 5);
        scene.add(dirLight1);

        const primaryMaterialNames = ['Main', 'Body', 'Primary', 'Material_MR', 'Character'];

        const applyCustomColor = (model: THREE.Group, color: string | null) => {
            model.traverse((object) => {
                if (object instanceof THREE.Mesh && object.material) {
                    const material = object.material as THREE.MeshStandardMaterial;
                    const originalColor = originalColorsRef.current.get(material.uuid);
                    if (!originalColor) return;

                    if (primaryMaterialNames.includes(material.name) || originalColorsRef.current.size < 5) {
                        material.color.set(color ? new THREE.Color(color) : originalColor);
                    }
                }
            });
        };

        if (modelRef.current) scene.remove(modelRef.current);
        originalColorsRef.current.clear();

        const loader = new GLTFLoader();
        loader.load(character.url, (gltf) => {
            const currentModel = gltf.scene;

            const box = new THREE.Box3().setFromObject(currentModel);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = box.getCenter(new THREE.Vector3());

            const targetHeight = 1.5;
            const scaleFactor = size.y > 0 ? targetHeight / size.y : 1;
            currentModel.scale.setScalar(scaleFactor);

            currentModel.position.x -= center.x * scaleFactor;
            currentModel.position.y -= box.min.y * scaleFactor;
            currentModel.position.z -= center.z * scaleFactor;

            currentModel.traverse((object) => {
                if (object instanceof THREE.Mesh && object.material) {
                    originalColorsRef.current.set(object.material.uuid, (object.material as THREE.MeshStandardMaterial).color.clone());
                }
            });

            modelRef.current = currentModel;
            scene.add(currentModel);
            applyCustomColor(currentModel, customColor);

        }, undefined, (error) => console.error('An error happened:', error));

        if (modelRef.current) {
            applyCustomColor(modelRef.current, customColor);
        }

        const animate = () => { controls.update(); renderer.render(scene, camera); };
        renderer.setAnimationLoop(animate);

        const handleResize = () => {
            if (!currentMount) return;
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.setAnimationLoop(null);
            if (currentMount && renderer.domElement) {
                if (currentMount.contains(renderer.domElement)) {
                    currentMount.removeChild(renderer.domElement);
                }
            }
            renderer.dispose();
        };
    }, [character, customColor, roadmapData]);

    const handleGenerateRoadmap = async () => {
        if (!roadmapTopic.trim()) return;
        setIsGenerating(true);
        setError('');
        try {
            const genAI = new GoogleGenerativeAI(
                import.meta.env.VITE_API_KEY
            );

            const prompt = `Given the learning topic "${roadmapTopic}", generate a creative and gamified learning roadmap. Provide exactly 5 sequential level names. Also, create a 3-question multiple-choice "final boss" quiz about the topic. For each question, provide 4 options and the index of the correct answer (0-3). Respond with ONLY a valid JSON object with two keys: "levels" (an array of 5 strings for level names) and "bossQuestions" (an array of 3 question objects).`;

            const model = genAI.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            levels: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            bossQuestions: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        question: { type: SchemaType.STRING },
                                        answers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                        correct: { type: SchemaType.NUMBER }
                                    },
                                    required: ['question', 'answers', 'correct']
                                }
                            }
                        },
                        required: ['levels', 'bossQuestions']
                    }
                }
            });

            const response = await model.generateContent(prompt);

            const result = JSON.parse(response.response.text());
            const levelNames = result.levels;

            const generatedLevels = levelNames.map((name: string, index: number) => ({
                id: index + 1,
                name: name,
                x: 10 + index * ((85 - 10) / 4),
                y: 70 - index * ((70 - 15) / 4),
            }));

            setRoadmapData({ levels: generatedLevels, bossQuestions: result.bossQuestions });
        } catch (err) {
            console.error(err);
            setError("Sorry, I couldn't generate a roadmap. Please try a different topic.");
        }
        setIsGenerating(false);
    };

    if (roadmapData) {
        return <GameifiedRoadmap
            levels={roadmapData.levels}
            bossQuestions={roadmapData.bossQuestions}
            characterUrl={character.url}
            characterName={character.name}
            topic={roadmapTopic}
            onExit={() => { setRoadmapData(null); setRoadmapTopic(''); }}
        />;
    }

    return (
        <>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            <div className="p-4 sm:p-8 lg:grid lg:grid-cols-12 gap-8 font-sans min-h-[calc(100vh-77px)] flex flex-col lg:flex-row" style={{ backgroundImage: 'linear-gradient(160deg, #0d1117 0%, #1e2c40 100%)' }}>
                {/* Left Side: Input Form */}
                <div className="lg:col-span-5 xl:col-span-4 flex items-center">
                    <div className="w-full bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl">
                        <h1 className="text-4xl font-extrabold text-white mb-2">Create Your Learning Adventure</h1>
                        <p className="text-gray-400 mb-8">Tell us what you want to learn, choose an avatar, and we'll generate a personalized, gamified roadmap for you.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-300 mb-2">1. Enter a Topic</label>
                                <input
                                    type="text"
                                    value={roadmapTopic}
                                    onChange={(e) => setRoadmapTopic(e.target.value)}
                                    placeholder="e.g., Learn Full Stack Development"
                                    className="w-full bg-gray-900/70 text-white placeholder-gray-500 rounded-lg py-3 px-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-300 mb-2">2. Choose Your Avatar</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {characters.map(char => (
                                        <button key={char.name} onClick={() => setCharacter(char)} className={`py-3 px-2 rounded-lg font-semibold transition-all duration-200 border-2 ${character.name === char.name ? 'bg-orange-600 border-orange-400 text-white' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'}`}>
                                            {char.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-300 mb-2">3. Customize Your Avatar</label>
                                <div className="flex gap-2 items-center flex-wrap">
                                    <span className="text-gray-400 text-sm mr-2">Color:</span>
                                    <button onClick={() => setCustomColor(null)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${!customColor ? 'border-white' : 'border-transparent'}`} style={{ background: 'linear-gradient(45deg, #888, #ddd)' }} title="Default"></button>
                                    <button onClick={() => setCustomColor('#ef4444')} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${customColor === '#ef4444' ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: '#ef4444' }} title="Crimson"></button>
                                    <button onClick={() => setCustomColor('#3b82f6')} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${customColor === '#3b82f6' ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: '#3b82f6' }} title="Sapphire"></button>
                                    <button onClick={() => setCustomColor('#22c55e')} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${customColor === '#22c55e' ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: '#22c55e' }} title="Emerald"></button>
                                    <button onClick={() => setCustomColor('#f59e0b')} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${customColor === '#f59e0b' ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: '#f59e0b' }} title="Gold"></button>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateRoadmap}
                                disabled={isGenerating || !roadmapTopic.trim()}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:from-red-500 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isGenerating ? 'Generating Your Journey...' : 'Start My Journey'}
                            </button>
                            {error && <p className="text-red-400 text-center">{error}</p>}
                        </div>
                    </div>
                </div>

                {/* Right Side: 3D Viewer */}
                <div className="relative lg:col-span-7 xl:col-span-8 min-h-[400px] lg:min-h-0">
                    <div ref={mountRef} className="w-full h-full rounded-2xl" />
                    <div key={character.name} className="absolute top-4 left-4 right-4 lg:right-auto lg:max-w-md p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-gray-700 animate-fade-in">
                        <h3 className="text-xl font-bold text-orange-400">{character.name}'s Power</h3>
                        <p className="mt-1 text-gray-300">{character.power}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoadmapCreator;
