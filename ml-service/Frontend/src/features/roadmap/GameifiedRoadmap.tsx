import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

type Level = { id: number; name: string; x: number; y: number; };
type BossQuestion = { question: string; answers: string[]; correct: number; };

type GameifiedRoadmapProps = {
    levels: Level[];
    bossQuestions: BossQuestion[];
    onExit: () => void;
    characterUrl: string;
    characterName: string;
    topic: string;
};

const VictoryScreen: React.FC<{ onRestart: () => void, topic: string }> = ({ onRestart, topic }) => {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900 p-4">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/50 z-0"></div>
            <div className="absolute top-10 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="text-center z-10 bg-gray-800/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-gray-700 max-w-2xl mx-4">
                <div className="text-8xl mb-6 animate-float">🏆</div>
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Victory!
                </h1>
                <p className="text-2xl mb-2 text-gray-200">
                    You've mastered the basics of:
                </p>
                <p className="text-3xl font-semibold mb-8 text-white">{topic}</p>
                <button
                    onClick={onRestart}
                    className="px-8 py-4 text-xl font-bold text-white rounded-xl shadow-lg transform transition hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                    Start New Journey
                </button>
            </div>
        </div>
    );
};

const BossBattle: React.FC<{ questions: BossQuestion[], onVictory: () => void, onDefeat: () => void }> = ({ questions, onVictory, onDefeat }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [bossHealth, setBossHealth] = useState(100);
    const [isShaking, setIsShaking] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    useEffect(() => {
        if (timeLeft > 0 && selectedAnswer === null) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && selectedAnswer === null) {
            onDefeat();
        }
    }, [timeLeft, selectedAnswer, onDefeat]);

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        const isCorrect = index === questions[currentQuestion].correct;

        if (isCorrect) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);

            const damage = 100 / questions.length;
            const newHealth = bossHealth - damage;
            setBossHealth(Math.max(0, newHealth));

            if (newHealth <= 0) {
                setTimeout(onVictory, 1500);
            } else {
                setTimeout(() => {
                    setCurrentQuestion(currentQuestion + 1);
                    setTimeLeft(15);
                    setSelectedAnswer(null);
                }, 1500);
            }
        } else {
            setTimeout(onDefeat, 1500);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <img src="https://storage.googleapis.com/aai-web-samples/app-challenge/boss-monster.png" alt="Boss Monster" className={`w-48 h-48 mx-auto mb-4 ${isShaking ? 'animate-shake' : ''}`} />
                    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg text-gray-200">Boss Health</span>
                            <span className="font-bold text-lg bg-red-600 text-white px-3 py-1 rounded">
                                {Math.round(bossHealth)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-6 overflow-hidden border border-gray-700">
                            <div
                                className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-500 rounded-full"
                                style={{ width: `${bossHealth}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-100">
                            Question {currentQuestion + 1} of {questions.length}
                        </h2>
                        <div className="text-3xl font-bold animate-pulse-glow px-4 py-2 rounded-lg bg-gray-900 border border-gray-700">
                            ⏱️ {timeLeft}s
                        </div>
                    </div>

                    <p className="text-xl mb-6 font-semibold text-gray-200">
                        {questions[currentQuestion].question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {questions[currentQuestion].answers.map((option, index) => {
                            const isCorrect = index === questions[currentQuestion].correct;
                            const isSelected = selectedAnswer === index;
                            let bgColor = 'bg-gray-700 hover:bg-gray-600';
                            let textColor = 'text-gray-200';

                            if (isSelected) {
                                bgColor = isCorrect ? 'bg-blue-600' : 'bg-red-600';
                                textColor = 'text-white';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`p-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 ${bgColor} ${textColor} text-left disabled:cursor-not-allowed`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GameifiedRoadmap: React.FC<GameifiedRoadmapProps> = ({ levels, bossQuestions, onExit, topic }) => {
    const [currentLevel, setCurrentLevel] = useState(1);
    const [completedLevels, setCompletedLevels] = useState<number[]>([]);
    const [showBossBattle, setShowBossBattle] = useState(false);
    const [showVictory, setShowVictory] = useState(false);

    // State for the details modal
    const [modalLevel, setModalLevel] = useState<Level | null>(null);
    const [modalContent, setModalContent] = useState<string[] | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [contentCache, setContentCache] = useState<Record<number, string[]>>({});

    // State for animations
    const [characterPos, setCharacterPos] = useState<{ x: number; y: number } | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isTransitioningToBoss, setIsTransitioningToBoss] = useState(false);


    const ai = new GoogleGenerativeAI(
        import.meta.env.VITE_API_KEY
    );

    useEffect(() => {
        const initialLevel = levels.find(l => l.id === currentLevel);
        if (initialLevel) {
            setCharacterPos({ x: initialLevel.x, y: initialLevel.y });
        }
    }, [levels, currentLevel]);


    const handleLevelClick = async (level: Level) => {
        if (isAnimating) return;
        setModalLevel(level);
        if (contentCache[level.id]) {
            setModalContent(contentCache[level.id]);
            return;
        }

        setIsModalLoading(true);
        setModalContent(null);
        try {
            const prompt = `A student is learning about "${topic}". For the module titled "${level.name}", list the key concepts they need to learn. Provide a JSON object with a key "concepts" which is an array of 5-7 short, clear learning objectives.`;
            const model = ai.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            concepts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ['concepts']
                    }
                }
            });

            const response = await model.generateContent(prompt);
            const result = JSON.parse(response.response.text());
            const concepts = result.concepts;
            setContentCache(prev => ({ ...prev, [level.id]: concepts }));
            setModalContent(concepts);
        } catch (e) {
            console.error("Failed to generate level details:", e);
            setModalContent(["Could not load details for this level. Please try again."]);
        } finally {
            setIsModalLoading(false);
        }
    };

    const completeLevel = (levelId: number) => {
        if (isAnimating || levelId !== currentLevel) return;

        setIsAnimating(true);
        setCompletedLevels(prev => [...prev, levelId]);

        const nextLevel = levels.find(l => l.id === levelId + 1);
        const isFinalLevel = levelId === levels.length;

        if (nextLevel) {
            setCharacterPos({ x: nextLevel.x, y: nextLevel.y });
        } else if (isFinalLevel) {
            const finalPos = { x: levels[levels.length - 1].x, y: 120 }; // Move down off screen
            setCharacterPos(finalPos);
        }

        setTimeout(() => {
            if (isFinalLevel) {
                setIsTransitioningToBoss(true);
                setTimeout(() => {
                    setShowBossBattle(true);
                    setIsTransitioningToBoss(false);
                }, 2500);
            } else {
                setCurrentLevel(levelId + 1);
                setIsAnimating(false);
            }
        }, 1200);
    };

    const handleVictory = () => {
        setShowBossBattle(false);
        setShowVictory(true);
    };

    const handleDefeat = () => {
        alert("You were defeated! Try the quiz again to master this topic.");
        setShowBossBattle(false);
    };

    if (showVictory) {
        return <VictoryScreen onRestart={onExit} topic={topic} />;
    }

    if (showBossBattle) {
        return <BossBattle questions={bossQuestions} onVictory={handleVictory} onDefeat={handleDefeat} />;
    }

    return (
        <>
            <style>{`
            @keyframes character-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); } 50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); } }
            @keyframes shake { 0%, 100% { transform: translateX(0) rotate(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); } 20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); } }
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
            
            /* New animation styles */
            .path-line { stroke: #4b5563; stroke-width: 4; stroke-dasharray: 10, 5; transition: stroke 1s ease-in-out 0.2s; }
            .path-line.completed { stroke: #22c55e; stroke-dasharray: none; }

            .level-node.completed .checkmark-pop { display: inline-block; animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
            @keyframes pop-in { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

            .boss-transition-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.9); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ef4444; animation: fade-in-overlay 0.5s ease-out; }
            .boss-warning-text { font-size: 6rem; font-weight: bold; text-transform: uppercase; animation: flash-warning 1s infinite; }
            .roadmap-container.boss-approaching { animation: zoom-out-fade 2.5s forwards ease-in-out; }

            @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
            @keyframes flash-warning { 0%, 100% { opacity: 1; text-shadow: 0 0 20px #ef4444; } 50% { opacity: 0.6; text-shadow: none; } }
            @keyframes zoom-out-fade { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }

        `}</style>
            <div className="min-h-screen bg-gray-900 p-4 sm:p-8 font-sans">
                {modalLevel && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity" onClick={() => setModalLevel(null)}>
                        <div className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-left" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">{modalLevel.name}</h2>
                                <button onClick={() => setModalLevel(null)} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                            </div>
                            {isModalLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                <ul className="space-y-3 list-disc list-inside text-gray-300">
                                    {modalContent?.map((item, index) => <li key={index} className="text-lg">{item}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
                {isTransitioningToBoss && (
                    <div className="boss-transition-overlay">
                        <h2 className="boss-warning-text">Warning</h2>
                        <p className="text-2xl mt-4 text-white">Final Boss Approaching!</p>
                    </div>
                )}
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white drop-shadow-lg">
                        Learning Journey: <span className="text-orange-400">{topic}</span>
                    </h1>
                    <div className={`relative h-[600px] bg-black/20 backdrop-blur-sm border border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-4 roadmap-container ${isTransitioningToBoss ? 'boss-approaching' : ''}`}>
                        {characterPos && (
                            <div
                                className="absolute text-5xl transition-all duration-1000 ease-in-out z-10"
                                style={{
                                    left: `${characterPos.x}%`,
                                    top: `${characterPos.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div style={{ animation: 'character-idle 2s ease-in-out infinite' }}>🚶</div>
                            </div>
                        )}
                        {levels.map((level, index) => {
                            const isCompleted = completedLevels.includes(level.id);
                            const isActive = currentLevel === level.id;
                            const isLocked = level.id > currentLevel;

                            return (
                                <React.Fragment key={level.id}>
                                    {index < levels.length - 1 && (
                                        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                                            <line
                                                x1={`${level.x}%`} y1={`${level.y}%`}
                                                x2={`${levels[index + 1].x}%`} y2={`${levels[index + 1].y}%`}
                                                className={`path-line ${completedLevels.includes(level.id) ? 'completed' : ''}`}
                                            />
                                        </svg>
                                    )}
                                    <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${level.x}%`, top: `${level.y}%` }}>
                                        <button onClick={() => handleLevelClick(level)} disabled={isAnimating} className={`relative transition-all duration-300 ${isActive ? 'animate-pulse-glow' : 'hover:scale-110'}`}>
                                            <div className={`level-node w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-xl transition-all font-bold ${isCompleted ? 'completed bg-green-600 text-white' : isActive ? 'active bg-amber-400 text-gray-900' : 'bg-gray-700 text-gray-400'}`}>
                                                {isCompleted ? <span className="checkmark-pop">✓</span> : isLocked ? '🔒' : level.id}
                                            </div>
                                        </button>
                                        <div className="mt-4 text-center w-48 -ml-8">
                                            <p className="font-bold text-lg mb-2 text-gray-200">{level.name}</p>
                                            {isActive && !isCompleted && (
                                                <button onClick={() => completeLevel(level.id)} disabled={isAnimating} className="px-6 py-2 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed">Complete</button>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <button onClick={onExit} className="fixed top-4 right-4 z-50 bg-white/30 backdrop-blur-md text-gray-800 font-bold px-4 py-2 rounded-lg hover:bg-white/50 transition">Exit Journey</button>
                </div>
            </div>
        </>
    );
};

export default GameifiedRoadmap;