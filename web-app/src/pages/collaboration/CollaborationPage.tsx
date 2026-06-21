
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { UsersIcon, HoloRoomIcon, MissionIcon, CopyIcon, TrophyIcon } from '../../components/ui/Icons';

// --- TYPES ---
type Participant = {
    id: number;
    name: string;
    avatar: string;
    isYou?: boolean;
    studyTime: number;
    points: number;
};

type ChatMessage = {
    sender: string;
    text: string;
    timestamp: string;
};

type Question = {
    question: string;
    answers: string[];
    correct: number;
};

type View = 'intro' | 'lobby' | 'session';


// --- MOCK DATA ---
const initialParticipants: Participant[] = [
    { id: 1, name: 'Alex Doe', avatar: 'https://i.pravatar.cc/48?u=alex', isYou: true, studyTime: 0, points: 0 },
    { id: 2, name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/48?u=1', studyTime: 0, points: 0 },
    { id: 3, name: 'Ben Carter', avatar: 'https://i.pravatar.cc/48?u=2', studyTime: 0, points: 0 },
    { id: 4, name: 'Olivia Rodriguez', avatar: 'https://i.pravatar.cc/48?u=3', studyTime: 0, points: 0 },
];

const cannedResponses = [
    "That's a great question.",
    "I was thinking the same thing.",
    "Hmm, I'm not sure about that one.",
    "Let's go with C.",
    "I think I remember this from the reading material.",
    "Good point!",
    "Totally agree.",
];


// --- UI ICONS (Specific to this page) ---
const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>);


import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';

// --- SUPPLEMENTARY 3D COMPONENTS ---
const RoomModel: React.FC<{ url: string }> = ({ url }) => {
    const { scene } = useGLTF(url);
    // Optional: Traverse scene to adjust materials/shadows if needed
    return <primitive object={scene} castShadow receiveShadow />;
};

const CollaborationRoom = () => {
    return (
        <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden border border-gray-700 relative group">
            <Canvas shadows className="w-full h-full">
                <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={1}
                    maxDistance={10}
                    maxPolarAngle={Math.PI / 2}
                />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <spotLight position={[-5, 5, -5]} intensity={0.5} penumbra={1} />

                {/* Fallback box while model loads or if missing */}
                <React.Suspense fallback={
                    <Html center>
                        <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-full whitespace-nowrap">
                            Loading 3D Environment...
                        </div>
                    </Html>
                }>
                    <RoomModel url="/src/assets/big_room.glb" />
                    <Environment preset="city" />
                </React.Suspense>
            </Canvas>

            <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-400 bg-black/60 inline-block px-3 py-1 rounded-full">
                    Drag to rotate • Scroll to zoom • Right-click to pan
                </p>
            </div>
        </div>
    );
};

// --- MAIN PAGE & SUB-COMPONENTS ---
const CollaborationPage: React.FC = () => {
    const [view, setView] = useState<View>('intro');
    const [topic, setTopic] = useState('');
    const [sessionLink, setSessionLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const [quiz, setQuiz] = useState<Question[] | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // { questionIndex: answerIndex }
    const [otherAnswers, setOtherAnswers] = useState<Record<number, Record<number, number>>>({}); // { questionIndex: { userId: answerIndex } }
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);
    const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY as string);

    const sortedLeaderboard = useMemo(() => {
        return [...participants].sort((a, b) => b.points - a.points || b.studyTime - a.studyTime);
    }, [participants]);

    // --- EFFECTS for Simulation ---

    // Simulate study time increment
    useEffect(() => {
        if (view !== 'session') return;
        const timer = setInterval(() => {
            setParticipants(prev => prev.map(p => ({
                ...p,
                studyTime: p.studyTime + Math.floor(Math.random() * 5) + 1
            })));
        }, 5000);
        return () => clearInterval(timer);
    }, [view]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);


    // --- HANDLERS ---

    const handleStartSession = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        setError('');

        try {
            const prompt = `Create a 5-question multiple-choice quiz about "${topic}". For each question, provide 4 answer options and the index of the correct answer (0-3).`;

            const model = ai.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            quiz: {
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
                        required: ['quiz']
                    }
                }
            });

            const response = await model.generateContent(prompt);

            const result = JSON.parse(response.response.text());
            setQuiz(result.quiz);
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setOtherAnswers({});
            setParticipants(initialParticipants); // Reset participants
            setChatMessages([]);
            const uniqueId = Math.random().toString(36).substring(2, 10);
            setSessionLink(`https://neurobright.ai/nexus/${uniqueId}`);
            setView('session');
        } catch (e) {
            console.error(e);
            setError('Failed to generate a session for this topic. Please try another one.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerQuestion = (questionIndex: number, answerIndex: number) => {
        if (userAnswers[questionIndex] !== undefined) return;

        setUserAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
        const isCorrect = quiz![questionIndex].correct === answerIndex;
        if (isCorrect) {
            setParticipants(prev => prev.map(p => p.isYou ? { ...p, points: p.points + 100 } : p));
        }

        // Simulate others answering
        setTimeout(() => {
            const otherParticipants = participants.filter(p => !p.isYou);
            let currentDelay = 0;
            otherParticipants.forEach(p => {
                currentDelay += Math.random() * 1000 + 500;
                setTimeout(() => {
                    const otherAnswer = Math.floor(Math.random() * 4);
                    setOtherAnswers(prev => ({
                        ...prev,
                        [questionIndex]: {
                            ...(prev[questionIndex] || {}),
                            [p.id]: otherAnswer
                        }
                    }));
                }, currentDelay);
            });
        }, 500);

        // Reveal correct answer and move to next question
        setTimeout(() => setShowCorrectAnswer(true), 4000);
        setTimeout(() => {
            // Award points to correct AI participants
            setParticipants(prev => prev.map(p => {
                if (!p.isYou && otherAnswers[questionIndex]?.[p.id] === quiz![questionIndex].correct) {
                    return { ...p, points: p.points + 100 };
                }
                return p;
            }));

            setShowCorrectAnswer(false);
            if (currentQuestionIndex < quiz!.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // End of quiz
                setChatMessages(prev => [...prev, { sender: 'System', text: 'Quiz finished! Great job everyone.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }
        }, 6000);
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;
        setChatMessages(prev => [...prev, { sender: 'You', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

        // Simulate a reply
        setTimeout(() => {
            const otherParticipant = participants[Math.floor(Math.random() * (participants.length - 1)) + 1];
            const responseText = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
            setChatMessages(prev => [...prev, { sender: otherParticipant.name, text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }, 1500 + Math.random() * 1000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(sessionLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    // --- RENDER FUNCTIONS ---

    const renderIntro = () => <IntroContent onEnterNexus={() => setView('lobby')} />;

    const renderLobby = () => (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
                <button onClick={() => setView('intro')} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
                <h2 className="text-3xl font-bold text-white mb-4">Start a New Session</h2>
                <p className="text-gray-400 mb-8">What topic do you want to collaborate on today?</p>
                <form onSubmit={(e) => { e.preventDefault(); handleStartSession(); }}>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Quantum Physics"
                        className="w-full text-center bg-gray-800 text-white placeholder-gray-500 rounded-lg py-3 px-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Create Nexus'}
                    </button>
                </form>
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        </div>
    );

    const renderSession = () => (
        <div className="min-h-screen bg-[#0d1117] text-gray-200 p-4 animate-fade-in">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Collaboration Nexus</h1>
                    <p className="text-gray-400">Topic: <span className="font-semibold text-orange-400">{topic}</span></p>
                </div>
                <button onClick={() => setView('intro')} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition">Exit Session</button>
            </header>

            <div className="flex items-center gap-4 mb-4 bg-[#161b22] p-3 rounded-lg border border-gray-700">
                <span className="text-gray-400 font-semibold">Invite Link:</span>
                <input type="text" readOnly value={sessionLink} className="flex-grow bg-gray-800 text-gray-300 rounded px-2 py-1 border border-gray-600" />
                <button onClick={handleCopyLink} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-md transition">
                    <CopyIcon className="w-4 h-4" />
                    {linkCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-4">
                    <ParticipantsPanel participants={participants} />
                    <LeaderboardPanel leaderboard={sortedLeaderboard} />
                </div>

                {/* Center Column */}
                <div className="lg:col-span-2 space-y-4 min-h-[60vh] flex flex-col">
                    <div className="flex-grow">
                        <CollaborationRoom />
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700 mt-4 shadow-xl">
                        {quiz && <QuizArea
                            quiz={quiz}
                            currentQuestionIndex={currentQuestionIndex}
                            onAnswer={handleAnswerQuestion}
                            userAnswers={userAnswers}
                            otherAnswers={otherAnswers}
                            showCorrectAnswer={showCorrectAnswer}
                            participants={participants}
                        />}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 bg-[#161b22] p-4 rounded-lg border border-gray-700 flex flex-col min-h-[60vh]">
                    <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} chatEndRef={chatEndRef} />
                </div>
            </div>
        </div>
    );

    if (view === 'lobby') return renderLobby();
    if (view === 'session') return renderSession();
    return renderIntro();
};


// --- SUB-COMPONENTS for SESSION VIEW ---

const ParticipantsPanel: React.FC<{ participants: Participant[] }> = ({ participants }) => (
    <div className="bg-[#161b22] p-4 rounded-lg border border-gray-700">
        <h2 className="text-lg font-bold mb-3 text-white">Participants ({participants.length})</h2>
        <ul className="space-y-3">
            {participants.map(p => (
                <li key={p.id} className="flex items-center gap-3">
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full" />
                    <span className="font-semibold text-gray-300">{p.name} {p.isYou && '(You)'}</span>
                </li>
            ))}
        </ul>
    </div>
);

const LeaderboardPanel: React.FC<{ leaderboard: Participant[] }> = ({ leaderboard }) => {
    const rankColors: { [key: number]: string } = { 1: 'text-yellow-400', 2: 'text-gray-300', 3: 'text-orange-400' };
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };
    return (
        <div className="bg-[#161b22] p-4 rounded-lg border border-gray-700">
            <h2 className="text-lg font-bold mb-3 text-white">Leaderboard</h2>
            <ul className="space-y-2">
                {leaderboard.map((p, index) => (
                    <li key={p.id} className={`p-2 rounded-md flex items-center gap-3 ${p.isYou ? 'bg-blue-600/20' : ''}`}>
                        <span className={`w-6 text-center font-bold text-lg ${rankColors[index + 1] || 'text-gray-500'}`}>{index + 1}</span>
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full" />
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-gray-200">{p.name}</p>
                            <p className="text-xs text-gray-400">{formatTime(p.studyTime)}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-blue-400">{p.points} <span className="text-xs">pts</span></p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const QuizArea: React.FC<{ quiz: Question[]; currentQuestionIndex: number; onAnswer: (q: number, a: number) => void; userAnswers: Record<number, number>; otherAnswers: Record<number, Record<number, number>>; showCorrectAnswer: boolean; participants: Participant[] }> =
    ({ quiz, currentQuestionIndex, onAnswer, userAnswers, otherAnswers, showCorrectAnswer, participants }) => {
        const question = quiz[currentQuestionIndex];
        if (!question) return <div className="text-center p-8"><h2 className="text-2xl font-bold">Quiz Complete!</h2><p>Check the leaderboard for final scores.</p></div>;

        const userAnswer = userAnswers[currentQuestionIndex];
        const currentOtherAnswers = otherAnswers[currentQuestionIndex] || {};

        return (
            <div className="flex flex-col h-full">
                <p className="text-sm text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {quiz.length}</p>
                <h3 className="text-2xl font-bold mb-6 text-white">{question.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.answers.map((answer, index) => {
                        const isSelected = userAnswer === index;
                        const isCorrect = question.correct === index;
                        let buttonClass = 'bg-gray-700 hover:bg-gray-600';
                        if (showCorrectAnswer) {
                            if (isCorrect) buttonClass = 'bg-green-600';
                            else if (isSelected) buttonClass = 'bg-red-600';
                            else buttonClass = 'bg-gray-800 text-gray-500';
                        } else if (isSelected) {
                            buttonClass = 'bg-blue-600 ring-2 ring-blue-400';
                        }

                        const answeredBy = participants.filter(p => currentOtherAnswers[p.id] === index && !p.isYou);

                        return (
                            <button
                                key={index}
                                onClick={() => onAnswer(currentQuestionIndex, index)}
                                disabled={userAnswer !== undefined || showCorrectAnswer}
                                className={`p-4 rounded-lg text-left transition-all relative min-h-[6rem] ${buttonClass}`}
                            >
                                <span className="font-semibold">{answer}</span>
                                <div className="absolute -bottom-3 left-2 flex gap-1">
                                    {answeredBy.map(p => <img key={p.id} src={p.avatar} title={p.name} className="w-6 h-6 rounded-full border-2 border-gray-800" />)}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-auto pt-6 text-center text-gray-500 text-sm">
                    {userAnswer === undefined && "Select an answer."}
                    {userAnswer !== undefined && !showCorrectAnswer && "Waiting for others..."}
                    {showCorrectAnswer && "Moving to next question..."}
                </div>
            </div>
        );
    };

const ChatPanel: React.FC<{ messages: ChatMessage[]; onSendMessage: (text: string) => void; chatEndRef: React.RefObject<HTMLDivElement> }> = ({ messages, onSendMessage, chatEndRef }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.message as HTMLInputElement;
        onSendMessage(input.value);
        input.value = '';
    };

    return (
        <>
            <h2 className="text-lg font-bold mb-3 text-white flex-shrink-0">Live Chat</h2>
            <div className="flex-grow overflow-y-auto mb-3 pr-2 space-y-4">
                {messages.map((msg, index) => (
                    msg.sender === 'System' ? (
                        <div key={index} className="text-center text-xs text-gray-500 italic">{msg.text}</div>
                    ) : (
                        <div key={index} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-3 py-2 rounded-lg max-w-[80%] ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                {msg.sender !== 'You' && <p className="text-xs font-bold text-orange-300 mb-1">{msg.sender}</p>}
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                        </div>
                    )
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex-shrink-0 flex gap-2">
                <input name="message" type="text" placeholder="Type a message..." className="flex-grow bg-gray-800 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"><SendIcon className="w-5 h-5" /></button>
            </form>
        </>
    );
};


// --- INTRO CONTENT (Original Page) ---

const IntroContent: React.FC<{ onEnterNexus: () => void }> = ({ onEnterNexus }) => {
    const CollaborationCard: React.FC<{ icon: React.ReactNode, title: string, description: string, delay: number }> = ({ icon, title, description, delay }) => {
        return (
            <div className="collaboration-card group" style={{ animationDelay: `${delay}s` }}>
                <div className="card-content">
                    <div className="card-icon">{icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400">{description}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            <style>{`
            @keyframes animated-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            .animated-gradient-bg { background: linear-gradient(45deg, #1e0a3c, #0a1e3c, #0a3c32); background-size: 400% 400%; animation: animated-gradient 15s ease infinite; }
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
            .floating-shape { animation: float 6s ease-in-out infinite; }
            .floating-shape:nth-child(2) { animation-delay: -2s; animation-duration: 7s; }
            .floating-shape:nth-child(3) { animation-delay: -4s; animation-duration: 8s; }
            @keyframes card-enter { from { opacity: 0; transform: translateY(50px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .collaboration-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; padding: 2.5rem; position: relative; transform-style: preserve-3d; transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; opacity: 0; animation: card-enter 0.6s ease-out forwards; }
            .collaboration-card:before { content: ''; position: absolute; inset: -1px; border-radius: inherit; background: conic-gradient(from 180deg at 50% 50%, #00c6ff, #0072ff, #7a00ff, #ff00c6, #00c6ff); opacity: 0; transition: opacity 0.3s ease-in-out; z-index: -1; animation: spin 4s linear infinite; }
            .collaboration-card:hover:before { opacity: 1; }
            .card-content { transform: translateZ(40px); }
            .card-icon { transform: translateZ(50px); transition: transform 0.3s ease; }
            .group:hover .card-icon { transform: translateZ(50px) rotateY(360deg) scale(1.1); }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
            <div className="animated-gradient-bg text-gray-200 font-sans overflow-x-hidden">
                <section className="relative min-h-screen flex items-center justify-center text-center p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute top-10 left-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl floating-shape"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/20 rounded-2xl blur-xl floating-shape"></div>
                    <div className="relative z-10 p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">The Future of Co-Creation</h1>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">An adaptive collaboration space where humans and AI design the future, together.</p>
                    </div>
                </section>
                <section className="container mx-auto px-6 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <CollaborationCard icon={<HoloRoomIcon className="w-16 h-16 text-cyan-400 transition-colors duration-300 group-hover:text-white" />} title="Holo-Rooms" description="Shared virtual spaces for immersive design sessions and real-time data visualization." delay={0} />
                        <CollaborationCard icon={<CodeIcon className="w-16 h-16 text-blue-400 transition-colors duration-300 group-hover:text-white" />} title="AI Co-Pilots" description="Work alongside specialized AI partners who assist with coding, research, and creative ideation." delay={0.2} />
                        <CollaborationCard icon={<MissionIcon className="w-16 h-16 text-purple-400 transition-colors duration-300 group-hover:text-white" />} title="Project Nexus" description="A decentralized hub to discover, join, and manage collaborative projects with transparent goals." delay={0.4} />
                        <CollaborationCard icon={<TrophyIcon className="w-16 h-16 text-yellow-400 transition-colors duration-300 group-hover:text-white" />} title="From Collaboration to Career" description="Excel in projects and quizzes. Top performers are noticed by our developer team for potential hiring opportunities." delay={0.6} />
                    </div>
                </section>
                <section className="py-24 px-6 text-center">
                    <div>
                        <h2 className="text-4xl font-extrabold text-white">Ready to Build?</h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Join a global community of innovators, creators, and pioneers. The next breakthrough starts with you.</p>
                        <button onClick={onEnterNexus} className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-full text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                            Enter the Nexus
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
};


export default CollaborationPage;
