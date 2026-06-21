
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ClockIcon, YouTubeIcon, PulseIcon } from '../../components/ui/Icons.tsx';
import { OpticsAnimation } from '../../components/ui/OpticsAnimation.tsx';
import WebXRDemo from '../webxr/WebXRDemo.tsx';
import Confetti from '../../components/ui/Confetti.tsx';

import { opticsCourse } from './optics-data.ts';
import YouTubeSearch, { VideoResult } from '../youtube-search/YouTubeSearch.tsx';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// --- ICONS ---
const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={`w-5 h-5 mr-2 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636 4.364l.707.707M6.343 6.343l-.707-.707m12.728 0l.707-.707"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18z"></path></svg>;
const RefreshIcon: React.FC = () => <svg className="w-5 h-5 text-gray-400 hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.65-4.65L20 5M20 15a9 9 0 01-14.65 4.65L4 19"></path></svg>;
const BookIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const CubeIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const ComicIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 12.5c0-6.5-4-9-4.5-9-1-.5-2 1-3 2-2 2-5 2-7 0-1-1-2.5-2.5-3.5-2-1.5 1-4.5 4-4.5 9.5s4.5 9.5 11 9.5 11-3 11-9.5z"></path></svg>;
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const GameControllerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5,9H15V4.5A1.5,1.5,0,0,0,13.5,3h-3A1.5,1.5,0,0,0,9,4.5V9H4.5A1.5,1.5,0,0,0,3,10.5v3A1.5,1.5,0,0,0,4.5,15H9v4.5A1.5,1.5,0,0,0,10.5,21h3a1.5,1.5,0,0,0,1.5-1.5V15h4.5a1.5,1.5,0,0,0,1.5-1.5v-3A1.5,1.5,0,0,0,19.5,9ZM12,18.5a1,1,0,1,1,1-1A1,1,0,0,1,12,18.5Zm2.5-5a1,1,0,1,1,1-1A1,1,0,0,1,14.5,13.5Zm0-4a1,1,0,1,1,1-1A1,1,0,0,1,14.5,9.5Z" /></svg>);
const CoffeeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 5h-2.28a3 3 0 00-5.44 0H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-2h2a2 2 0 002-2V7a2 2 0 00-2-2zm0 4h-2V7h2z" /></svg>);
const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5,2h-13A2.5,2.5,0,0,0,3,4.5V11a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V5.5A1.5,1.5,0,0,1,6.5,4h11A1.5,1.5,0,0,1,19,5.5V11a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V4.5A2.5,2.5,0,0,0,18.5,2Zm-6,11a.5.5,0,0,0-.5.5v8a.5.5,0,0,0,.5.5h.5a3.5,3.5,0,0,0,3.5-3.5V14.21A3.492,3.492,0,0,0,12.5,13Zm-1,0H11a3.492,3.492,0,0,0-3.5,1.21V18a3.5,3.5,0,0,0,3.5,3.5h.5a.5.5,0,0,0,.5-.5v-8A.5.5,0,0,0,11.5,13Z" /></svg>);

// --- MODAL & WIDGET COMPONENTS ---
const BCIInterventionModal: React.FC<{ onClose: () => void; onLaunchVRGame: () => void; onLaunchBreak: () => void; onLaunchLeaderboard: () => void; }> = ({ onClose, onLaunchVRGame, onLaunchBreak, onLaunchLeaderboard }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-gray-800 border border-yellow-500/50 rounded-2xl shadow-2xl p-8 text-center animate-fade-in-up">
                <h2 className="text-3xl font-bold text-yellow-400 mb-3">Time to Re-Engage!</h2>
                <p className="text-gray-300 mb-8">Our BCI monitor detected a drop in focus. Let's get you back on track with one of these activities.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={onLaunchVRGame} className="p-4 bg-purple-600/80 rounded-lg text-white hover:bg-purple-600 transition group">
                        <GameControllerIcon className="w-12 h-12 mx-auto mb-2 text-purple-200 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Launch VR Game</span>
                    </button>
                    <button onClick={onLaunchBreak} className="p-4 bg-green-600/80 rounded-lg text-white hover:bg-green-600 transition group">
                        <CoffeeIcon className="w-12 h-12 mx-auto mb-2 text-green-200 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Take 5-min Break</span>
                    </button>
                    <button onClick={onLaunchLeaderboard} className="p-4 bg-cyan-600/80 rounded-lg text-white hover:bg-cyan-600 transition group">
                        <TrophyIcon className="w-12 h-12 mx-auto mb-2 text-cyan-200 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">View Leaderboard</span>
                    </button>
                </div>
                <button onClick={onClose} className="mt-8 text-sm text-gray-400 hover:text-white">Dismiss</button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
const BreakTimerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const totalTime = 300; // 5 minutes
    const [timeLeft, setTimeLeft] = useState(totalTime);
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => { setTimeLeft(prev => prev - 1); }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = (timeLeft / totalTime) * 100;
    return (
        <div className="fixed inset-0 bg-gray-900/90 z-[60] flex flex-col items-center justify-center p-4 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-8">Time for a Quick Break!</h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                    <circle cx="60" cy="60" r="54" stroke="url(#timerGradient)" strokeWidth="8" fill="transparent" strokeDasharray="339.292" strokeDashoffset={339.292 - (progress / 100) * 339.292} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    <defs><linearGradient id="timerGradient"><stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                </svg>
                <div className="absolute text-white text-5xl font-mono">{timeLeft > 0 ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : "Done!"}</div>
            </div>
            <p className="text-gray-400 mt-8 text-lg">Recharge your mind. We'll be back to learning shortly.</p>
            <button onClick={onClose} className="mt-8 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">{timeLeft > 0 ? "End Break Early" : "Back to Learning"}</button>
        </div>
    );
};
const LeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const leaderboardData = [{ rank: 1, name: 'Sophia Chen', points: 12500, avatar: 'https://i.pravatar.cc/48?u=1' }, { rank: 2, name: 'Ben Carter', points: 11800, avatar: 'https://i.pravatar.cc/48?u=2' }, { rank: 3, name: 'Olivia Rodriguez', points: 11250, avatar: 'https://i.pravatar.cc/48?u=3' }, { rank: 4, name: 'Alex Doe', points: 10500, avatar: 'https://i.pravatar.cc/48?u=alex' }, { rank: 5, name: 'Liam Goldberg', points: 9800, avatar: 'https://i.pravatar.cc/48?u=5' }, { rank: 6, name: 'Mia Kim', points: 9200, avatar: 'https://i.pravatar.cc/48?u=6' }, { rank: 7, name: 'Noah Patel', points: 8500, avatar: 'https://i.pravatar.cc/48?u=7' },];
    const rankColors: { [key: number]: string } = { 1: 'text-yellow-400', 2: 'text-gray-300', 3: 'text-yellow-600' };
    return (
        <div className="fixed inset-0 bg-gray-900/90 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
            <div className="w-full max-w-2xl bg-gray-800 border border-cyan-500/30 rounded-2xl shadow-2xl p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
                <h2 className="text-3xl font-bold text-center text-white mb-6">Weekly Leaderboard</h2>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {leaderboardData.map(user => (
                        <div key={user.rank} className={`flex items-center p-3 rounded-lg transition-all ${user.name === 'Alex Doe' ? 'bg-cyan-600/30 border border-cyan-500 scale-105' : 'bg-gray-700/50'}`}>
                            <span className={`w-10 text-xl font-bold text-center ${rankColors[user.rank] || 'text-gray-400'}`}>{user.rank}</span>
                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mx-4" />
                            <span className="flex-grow font-semibold text-white text-lg">{user.name} {user.name === 'Alex Doe' && '(You)'}</span>
                            <span className="font-bold text-cyan-300 text-lg">{user.points.toLocaleString()} PTS</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};


// --- TYPES ---
type View = 'INPUT' | 'OUTLINE' | 'LEARNING_HUB';
type LearningMode = 'READING' | '3D_VISUALS' | 'COMIC' | 'VIDEO';
type OutlineItem = { id: number; title: string; points: string[]; completed: boolean; };
type QuizQuestion = { question: string; options: string[]; answer: string; };
type ProjectSuggestion = { title: string; description: string; simName: string; simLink: string; };
type BCIState = 'FOCUSED' | 'NEUTRAL' | 'DROWSY';

const CourseChat: React.FC = () => {
    const [view, setView] = useState<View>('INPUT');
    const [topic, setTopic] = useState('');
    const [outline, setOutline] = useState<OutlineItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Generating...');
    const [error, setError] = useState<string | null>(null);
    const [recommendedTime, setRecommendedTime] = useState('');
    const [studyTime, setStudyTime] = useState('');

    const [activeModule, setActiveModule] = useState<OutlineItem | null>(null);
    const [activeContentMode, setActiveContentMode] = useState<LearningMode>('READING');

    const [contentCache, setContentCache] = useState<Record<number, Partial<Record<LearningMode, any>>>>({});
    const [quizCache, setQuizCache] = useState<Record<number, QuizQuestion[]>>({});

    const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null);

    const [projectSuggestion, setProjectSuggestion] = useState<ProjectSuggestion | null>(null);
    const [isFetchingProjects, setIsFetchingProjects] = useState(false);

    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // TTS Reference
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const ai = useMemo(() => new GoogleGenerativeAI(
        import.meta.env.VITE_API_KEY
    ), []);


    // YouTube Search State
    const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    // BCI State Management
    const [bciState, setBciState] = useState<BCIState>('NEUTRAL');
    const [showIntervention, setShowIntervention] = useState(false);
    const [showVRGame, setShowVRGame] = useState(false);
    const [showBreakTimer, setShowBreakTimer] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const bciCycleIndex = useRef(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const tamilCyberSecurityText = `தகவல் தொழில்நுட்ப பாதுகாப்பானது டிஜிட்டல் தாக்குதல்களில் இருந்து அமைப்புகள், நெட்வொர்க்குகள் மற்றும் நிரல்களைப் பாதுகாக்கும் நடைமுறையாகும். இந்த சைபர் தாக்குதல்கள் பொதுவாக முக்கியமான தகவல்களை அணுகுவது, மாற்றுவது அல்லது அழிப்பது, பயனர்களிடமிருந்து பணம் பறிப்பது அல்லது சாதாரண வணிக செயல்முறைகளில் இடையூறு விளைவிப்பதை நோக்கமாகக் கொண்டுள்ளன. நமது உலகம் முன்பை விட இப்போது அதிக அளவில் ஒன்றோடொன்று இணைக்கப்பட்டுள்ளதால், இணைய பாதுகாப்பின் அடிப்படை கட்டுமான தொகுதிகளைப் புரிந்துகொள்வது இப்போது தகவல் தொழில்நுட்ப வல்லுநர்களுக்கு மட்டுமல்ல; இது ஒவ்வொருவருக்கும் ஒரு இன்றியமையாத வாழ்க்கைத் திறனாகும்.

பாதுகாப்பின் அடிப்படை: சி.ஐ.ஏ (CIA) முக்கோணம்

ஒவ்வொரு இணைய பாதுகாப்பு மூலோபாயத்தின் மையத்திலும் சி.ஐ.ஏ (CIA) முக்கோணம் என்ற ஒரு கருத்து உள்ளது. இது புலனாய்வு அமைப்பைக் குறிக்கவில்லை, மாறாக மூன்று முக்கிய கொள்கைகளைக் குறிக்கிறது: ரகசியம் (Confidentiality), ஒருமைப்பாடு (Integrity) மற்றும் கிடைக்கும் தன்மை (Availability).

1. ரகசியம்: ரகசியத் தகவல் அங்கீகரிக்கப்பட்ட நபர்களால் மட்டுமே அணுகப்படுவதை உறுதி செய்கிறது. இது ரகசியங்களை ரகசியமாக வைத்திருப்பதாகும். உதாரணமாக, உங்கள் வங்கிக் கணக்கு நிலுவை உங்களுக்குத் தெரிந்திருக்க வேண்டும் மற்றும் அங்கீகரிக்கப்பட்ட வங்கி ஊழியர்களுக்கு மட்டுமே தெரிய வேண்டும்.

2. ஒருமைப்பாடு: தரவின் வாழ்நாள் முழுவதும் அதன் நிலைத்தன்மை, துல்லியம் மற்றும் நம்பகத்தன்மையை பராமரிப்பதை உள்ளடக்குகிறது. இதன் பொருள் தரவு போக்குவரத்தில் மாற்றப்படக்கூடாது அல்லது அங்கீகரிக்கப்படாத நபர்களால் மாற்றப்படக்கூடாது. நீங்கள் பத்து டாலர்களை செலுத்தினால், பெறுபவருக்கு நூறு டாலர்கள் கோரிக்கை வராமல் இருப்பதை ஒருமைப்பாடு உறுதி செய்கிறது.

3. கிடைக்கும் தன்மை: தகவல் மற்றும் ஆதாரங்கள் தேவைப்படும்போது அங்கீகரிக்கப்பட்ட பயனர்களுக்கு அணுகக்கூடியதாக இருப்பதை உறுதி செய்கிறது.`;


    useEffect(() => {
        if (isLoading) {
            const quotes = ["Unraveling the mysteries of the cosmos...", "Brewing some fresh knowledge...", "Engaging the neuro-link...", "The universe is made of stories, not of atoms.", "Collating wisdom from the digital ether...", "Just a moment, great ideas are forming."];
            let quoteIndex = 0;
            setLoadingMessage(quotes[0]);
            const interval = setInterval(() => { quoteIndex = (quoteIndex + 1) % quotes.length; setLoadingMessage(quotes[quoteIndex]); }, 2500);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Simulate BCI state changes ONLY when in a learning module
    useEffect(() => {
        if (!activeModule) {
            setBciState('NEUTRAL'); // Reset when not learning
            bciCycleIndex.current = 0;
            return;
        };

        const stateCycle: BCIState[] = ['FOCUSED', 'NEUTRAL', 'DROWSY'];

        // Set initial state for the cycle
        setBciState(stateCycle[bciCycleIndex.current]);

        const bciSimulator = setInterval(() => {
            bciCycleIndex.current = (bciCycleIndex.current + 1) % stateCycle.length;
            const nextState = stateCycle[bciCycleIndex.current];
            setBciState(nextState);
        }, 20000); // Change state every 20 seconds

        return () => clearInterval(bciSimulator);
    }, [activeModule]);

    // Automatically trigger intervention when drowsy during a lesson
    useEffect(() => {
        if (bciState === 'DROWSY' && activeModule) {
            setShowIntervention(true);
        }
    }, [bciState, activeModule]);


    const handleGenerateOutline = async () => {
        if (!topic.trim()) return;

        if (topic.trim().toLowerCase() === 'optics') {
            setTopic(opticsCourse.courseTitle);
            setOutline(opticsCourse.outline);
            setRecommendedTime(opticsCourse.recommendedStudyTime);
            setStudyTime(opticsCourse.recommendedStudyTime);
            setContentCache(opticsCourse.content);
            setQuizCache(opticsCourse.quiz);
            setView('OUTLINE');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutline(null);

        try {
            const prompt = `Generate a detailed course outline for the topic: "${topic}". Provide about 5-7 main topics. Each topic should have a title and a few bullet points. Also provide a recommended total study time (e.g., "4 hours").`;

            const model = ai.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            courseTitle: { type: SchemaType.STRING },
                            recommendedStudyTime: { type: SchemaType.STRING },
                            outline: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        title: { type: SchemaType.STRING },
                                        points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                                    },
                                    required: ['title', 'points']
                                }
                            }
                        },
                        required: ['courseTitle', 'outline', 'recommendedStudyTime']
                    }
                }
            });

            const response = await model.generateContent(prompt);

            const jsonResponse = JSON.parse(response.response.text());
            const outlineWithState = jsonResponse.outline.map((item: any, index: number) => ({ ...item, id: index + 1, completed: false }));
            setTopic(jsonResponse.courseTitle);
            setOutline(outlineWithState);
            setRecommendedTime(jsonResponse.recommendedStudyTime);
            setStudyTime(jsonResponse.recommendedStudyTime);
            setView('OUTLINE');
        } catch (e) {
            console.error(e);
            setError("Failed to generate outline. Please try again.");
        } finally { setIsLoading(false); }
    };

    const handleFinalizePlan = async () => {
        if (!outline || !studyTime) return;
        setIsLoading(true);
        setError(null);
        try {
            const prompt = `A user wants to learn about "${topic}" in ${studyTime}. The original outline has these topics: ${JSON.stringify(outline.map(o => o.title))}. Please adjust this outline to fit the specified timeframe. If the time is short, condense it to the most critical topics. If it's long, you can keep the original. Return only the adjusted outline.`;

            const model = ai.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            outline: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        title: { type: SchemaType.STRING },
                                        points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                                    },
                                    required: ['title', 'points']
                                }
                            }
                        },
                        required: ['outline']
                    }
                }
            });

            const response = await model.generateContent(prompt);

            const jsonResponse = JSON.parse(response.response.text());
            const newOutline = jsonResponse.outline.map((item: any, index: number) => ({ ...item, id: index + 1, completed: false }));
            setOutline(newOutline);
            setView('LEARNING_HUB');
        } catch (e) {
            console.error(e);
            setError("Failed to adjust the plan. Starting with the original outline.");
            setView('LEARNING_HUB');
        } finally { setIsLoading(false); }
    };

    const handleSelectModule = (module: OutlineItem) => {
        setActiveModule(module);
        setActiveContentMode('READING');
        fetchContentForModule(module, 'READING');
    }

    const fetchContentForModule = async (module: OutlineItem, mode: LearningMode) => {
        if (contentCache[module.id]?.[mode] && mode !== 'COMIC') return;
        setIsLoading(true);
        setError(null);

        try {
            let content: any = null;
            switch (mode) {
                case 'READING': {
                    const prompt = `Explain the key concepts of the topic "${module.title}" within the broader subject of "${topic}". Write it in a clear, educational, and engaging manner. Use paragraphs and points to avoid markdown.`;
                    const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    content = response.text();
                    break;
                }
                case '3D_VISUALS':
                    // Keep existing fallback for Optics, or we can move this to backend too.
                    // For now, let's keep it simple.
                    if (topic.toLowerCase().includes('optics')) {
                        content = { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' };
                    } else if (topic.toLowerCase().includes('cyber security') || topic.toLowerCase().includes('cybersecurity')) {
                        content = { type: 'embed', url: 'https://sketchfab.com/models/2c1f108a600147339dc69e64e4a3cd2e/embed' };
                    } else {
                        // Fallback to a placeholder URL if no backend support for 3D search yet
                        content = { type: 'embed', url: 'https://sketchfab.com/models/0d686f0c62c244799056d688cf73a5a4/embed' };
                    }
                    break;
                case 'COMIC': {
                    if (topic.toLowerCase().includes('full stack') || topic.toLowerCase().includes('fullstack')) {
                        content = '/src/assets/FullStackComic.png';
                        break;
                    }
                    if (topic.toLowerCase().includes('optics')) {
                        content = '/src/assets/OpticsComics.jpeg';
                        break;
                    }
                    const prompt = `Create a simple, clear concept for a single-panel educational comic about "${module.title}". Describe the scene, characters, and any text bubbles for an image generation AI. The style should be fun and informative.`;
                    const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    content = response.text();
                    break;
                }
                case 'VIDEO': {
                    setIsLoadingVideos(true);
                    setVideoError(null);
                    setVideoResults([]);
                    setActiveVideoId(null);

                    try {
                        const langQuery = selectedLanguage !== 'English' ? ` in ${selectedLanguage}` : '';
                        const response = await fetch(`http://localhost:5000/api/videos?query=${encodeURIComponent(module.title + ' ' + topic + langQuery)}`);
                        if (!response.ok) throw new Error('Failed to fetch videos');
                        const data = await response.json();
                        setVideoResults(data.videos || []);
                        content = { type: 'grid' };
                    } catch (err: any) {
                        console.error("Error fetching YouTube videos:", err);
                        setVideoError(`Error: ${err.message || 'Unknown error'}.`);
                        content = { type: 'error' };
                    } finally {
                        setIsLoadingVideos(false);
                    }
                    break;
                }
            }
            setContentCache(prev => ({ ...prev, [module.id]: { ...prev[module.id], [mode]: content } }));
        } catch (e) {
            console.error(`Failed to load ${mode} for module ${module.id}`, e);
            setError(`Could not load content for this module.`);
        } finally { setIsLoading(false); }
    };

    const fetchProjectSuggestions = async (module: OutlineItem) => {
        setIsFetchingProjects(true);
        setProjectSuggestion(null);
        try {
            const prompt = `For a student who just finished a module on "${module.title}" as part of a course on "${topic}", provide one real-world project idea and find one link to an interactive web-based simulation. Respond with ONLY a valid JSON object with the following keys: "projectTitle", "projectDescription", "simulationName", "simulationLink". Do not include any other text or markdown formatting.`;

            const model = ai.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            projectTitle: { type: SchemaType.STRING },
                            projectDescription: { type: SchemaType.STRING },
                            simulationName: { type: SchemaType.STRING },
                            simulationLink: { type: SchemaType.STRING }
                        },
                        required: ['projectTitle', 'projectDescription', 'simulationName', 'simulationLink']
                    }
                }
            });

            const response = await model.generateContent(prompt);

            const suggestions = JSON.parse(response.response.text());
            setProjectSuggestion({
                title: suggestions.projectTitle || "Explore Further!",
                description: suggestions.projectDescription || "",
                simName: suggestions.simulationName || "Search Simulations",
                simLink: suggestions.simulationLink || "#"
            });
        } catch (e) {
            console.error("Failed to fetch project suggestions:", e);
            setProjectSuggestion({ title: "Explore Further!", description: "Try searching for projects related to this topic on your own.", simName: "No simulation found", simLink: "#" });
        } finally { setIsFetchingProjects(false); }
    };

    const handleTranslateContent = async (text: string, targetLang: string) => {
        if (!text) return text;
        setIsTranslating(true);
        try {
            const prompt = `Translate the following text to ${targetLang}: "${text}". Provide ONLY the translated text without any explanations or extra characters.`;
            const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.error(err);
            return text;
        } finally {
            setIsTranslating(false);
        }
    };

    const handleToggleTTS = (text: string) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!text) return;

        // Clean text of HTML tags if any
        const cleanText = text.replace(/<[^>]*>/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Map language to BCP47
        const langMap: Record<string, string> = {
            'English': 'en-US',
            'Tamil': 'ta-IN',
            'Hindi': 'hi-IN',
            'Spanish': 'es-ES',
            'French': 'fr-FR'
        };

        utterance.lang = langMap[selectedLanguage] || 'en-US';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const handleLanguageChange = async (newLang: string) => {
        setSelectedLanguage(newLang);
        if (activeModule && activeContentMode === 'READING') {
            const currentContent = contentCache[activeModule.id]?.['READING'];
            if (currentContent && typeof currentContent === 'string') {
                setIsLoading(true);
                setLoadingMessage(`Translating to ${newLang}, please wait...`);
                try {
                    if (newLang === 'Tamil' && activeModule.title.toLowerCase().includes('cyber security')) {
                        // Use hardcoded Tamil content for Cyber Security intro to avoid Gemini call
                        setContentCache(prev => ({
                            ...prev,
                            [activeModule.id]: { ...prev[activeModule.id], READING: tamilCyberSecurityText }
                        }));
                    } else {
                        const translated = await handleTranslateContent(currentContent, newLang);
                        setContentCache(prev => ({
                            ...prev,
                            [activeModule.id]: { ...prev[activeModule.id], READING: translated }
                        }));
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        }

        // If in Video mode, re-fetch recommendations based on new language
        if (activeModule && activeContentMode === 'VIDEO') {
            fetchContentForModule(activeModule, 'VIDEO');
        }
    };

    const handleStartQuiz = async (moduleId: number) => {
        setProjectSuggestion(null);
        if (quizCache[moduleId]) {
            setCurrentQuiz(quizCache[moduleId]);
            setQuizResult(null);
            setUserAnswers(new Array(quizCache[moduleId].length).fill(''));
            return;
        }
        setIsLoading(true);
        try {
            const prompt = `Generate a 3-question multiple-choice quiz about "${activeModule?.title}" from the course "${topic}". For each question, provide 4 options and specify the correct answer.`;

            const model = ai.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            questions: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        question: { type: SchemaType.STRING },
                                        options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                        answer: { type: SchemaType.STRING }
                                    },
                                    required: ['question', 'options', 'answer']
                                }
                            }
                        },
                        required: ['questions']
                    }
                }
            });

            const response = await model.generateContent(prompt);

            const quizData = JSON.parse(response.response.text());
            setQuizCache(prev => ({ ...prev, [moduleId]: quizData.questions }));
            setCurrentQuiz(quizData.questions);
            setQuizResult(null);
            setUserAnswers(new Array(quizData.questions.length).fill(''));
        } catch (e) {
            console.error("Failed to start quiz", e);
            setError("Could not generate the quiz.");
        } finally { setIsLoading(false); }
    };

    const handleSubmitQuiz = () => {
        if (!currentQuiz || !activeModule) return;
        let correctCount = 0;
        currentQuiz.forEach((q, index) => { if (userAnswers[index] === q.answer) correctCount++; });
        const score = Math.round((correctCount / currentQuiz.length) * 100);
        setQuizResult({ score, correct: correctCount, total: currentQuiz.length });

        if (score >= 60) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            setOutline(prevOutline => prevOutline!.map(item => item.id === activeModule.id ? { ...item, completed: true } : item));
            fetchProjectSuggestions(activeModule);
        }
    };

    // --- RENDER VIEWS ---
    const renderInputView = () => (
        <div className="w-full max-w-3xl mx-auto p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #2a4c6a 0%, #1c3349 100%)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleGenerateOutline(); }} className="space-y-6">
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to learn today?" className="w-full text-center text-xl bg-white/90 text-gray-800 placeholder-gray-500 rounded-lg py-4 px-6 border-2 border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition" />
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isLoading ? loadingMessage : <><GenerateIcon className="w-6 h-6" /> Generate Outline</>}
                </button>
            </form>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </div>
    );

    const renderOutlineView = () => (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setView('INPUT')}
                    className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="flex-grow flex justify-between items-center bg-gray-800/50 border border-gray-700 p-4 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold text-white">{topic}</h1>
                    <button onClick={handleGenerateOutline} aria-label="Regenerate outline" disabled={isLoading}><RefreshIcon /></button>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400 ml-2">Recommended Outline</h2>
                    {outline?.map(item => (
                        <div key={item.id} className="bg-white/10 p-5 rounded-lg flex gap-5 items-start">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-md">{item.id}</div>
                            <div>
                                <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                                <ul className="list-disc list-inside text-gray-400 mt-1">
                                    {item.points.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="md:col-span-1">
                    <div className="bg-gray-800/50 p-6 rounded-xl sticky top-24">
                        <h2 className="text-lg font-semibold text-gray-200 mb-4">Finalize Your Plan</h2>
                        <div className="mb-4">
                            <label className="text-sm text-gray-400">Recommended Time</label>
                            <p className="text-white font-bold text-lg">{recommendedTime}</p>
                        </div>
                        <div>
                            <label htmlFor="studyTime" className="text-sm text-gray-400 flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Your Perfect Study Time</label>
                            <input id="studyTime" type="text" value={studyTime} onChange={(e) => setStudyTime(e.target.value)} className="mt-1 w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-orange-500 focus:border-orange-500" placeholder="e.g., 2 hours" />
                        </div>
                        <button onClick={handleFinalizePlan} disabled={isLoading} className="w-full mt-6 bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105 disabled:opacity-50">
                            {isLoading ? loadingMessage : 'Generate Custom Plan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderModuleContent = () => {
        if (!activeModule || !activeContentMode) return null;
        const content = contentCache[activeModule.id]?.[activeContentMode];
        if (error && !content) return <div className="flex items-center justify-center h-full"><p className="text-red-400 text-center p-8">{error}</p></div>;
        if (!content && isLoading) return null; // Let loading overlay show
        if (!content) return <div className="flex items-center justify-center h-full text-gray-500"><p>Select a learning mode to begin.</p></div>;

        switch (activeContentMode) {
            case 'READING':
                return <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap p-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: content?.replace(/\n/g, '<br />') || '' }} />;
            case '3D_VISUALS':
                return (
                    <div className="w-full h-full min-h-[400px]">
                        {content?.type === 'gsap' ? <OpticsAnimation /> : content?.url ? (
                            <iframe
                                title="3D Model"
                                className="w-full h-full rounded-lg border-0"
                                src={content.url}
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                allowFullScreen
                            ></iframe>
                        ) : <p className="text-center text-gray-400">No 3D model available.</p>}
                    </div>
                );
            case 'COMIC':
                return <div className="w-full h-full flex justify-center items-center p-4">{content ? <img src={content} alt="AI Generated Comic" className="max-w-full max-h-full object-contain rounded-lg" /> : <p className="text-center text-gray-400">No comic available.</p>}</div>;
            case 'VIDEO':
                return (
                    <div className="w-full h-full flex flex-col">
                        {activeVideoId ? (
                            <div className="w-full h-full flex flex-col gap-4">
                                <button
                                    onClick={() => setActiveVideoId(null)}
                                    className="self-start flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Search Results
                                </button>
                                <iframe
                                    className="w-full aspect-video rounded-lg shadow-2xl border border-gray-700"
                                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <YouTubeSearch
                                videos={videoResults}
                                onVideoSelect={setActiveVideoId}
                                isLoading={isLoadingVideos}
                                error={videoError}
                            />
                        )}
                    </div>
                );
            default: return null;
        }
    };

    const renderQuiz = () => {
        if (!currentQuiz || !activeModule) return null;
        return (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-20 flex justify-center items-center p-4">
                {showConfetti && <Confetti />}
                <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-800 p-8 rounded-2xl shadow-2xl relative">
                    <button onClick={() => setCurrentQuiz(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon /></button>
                    <h2 className="text-2xl font-bold text-white mb-6">Quiz: {activeModule.title}</h2>
                    {quizResult ? (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Result: {quizResult.score >= 60 ? 'Passed!' : 'Try Again'}</h3>
                            <p className={`text-5xl font-bold my-4 ${quizResult.score >= 60 ? 'text-green-400' : 'text-red-400'}`}>{quizResult.score}%</p>
                            <p className="text-gray-300">You answered {quizResult.correct} of {quizResult.total} correctly.</p>

                            {quizResult.score >= 60 && (
                                <div className="mt-6 border-t border-gray-600 pt-6 text-left space-y-4 bg-gray-900/50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-yellow-400 text-center mb-2">Next Steps: Apply Your Knowledge!</h4>
                                    {isFetchingProjects && <div className="flex justify-center items-center gap-2 text-gray-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Generating project ideas...</span></div>}
                                    {projectSuggestion && (
                                        <div className="space-y-3">
                                            <div>
                                                <h5 className="font-bold text-white">{projectSuggestion.title}</h5>
                                                <p className="text-gray-400 text-sm">{projectSuggestion.description}</p>
                                            </div>
                                            <div>
                                                <a href={projectSuggestion.simLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">Try Simulation: {projectSuggestion.simName}</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button onClick={() => { setCurrentQuiz(null); if (quizResult.score >= 60) setActiveModule(null); }} className={`mt-6 font-bold py-3 px-6 rounded-lg ${quizResult.score >= 60 ? 'bg-green-600' : 'bg-blue-600'}`}>
                                {quizResult.score >= 60 ? 'Continue Learning' : 'Back to Module'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {currentQuiz.map((q, qIndex) => (
                                <div key={qIndex}>
                                    <p className="font-semibold text-lg text-white mb-3">{qIndex + 1}. {q.question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((option, oIndex) => (
                                            <button key={oIndex} onClick={() => setUserAnswers(ua => ua.map((a, i) => i === qIndex ? option : a))} className={`p-3 rounded-md text-left transition-all ${userAnswers[qIndex] === option ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>{option}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleSubmitQuiz} disabled={userAnswers.includes('')} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-500 mt-6">Submit</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderLearningHubOutline = () => (
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setView('OUTLINE')}
                    className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-3xl font-extrabold text-white">Course Outline: <span className="text-orange-400">{topic}</span></h1>
            </div>
            <div className="space-y-3">
                {outline?.map(item => (
                    <div key={item.id}>
                        <button onClick={() => handleSelectModule(item)} className="w-full flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/70 transition-colors text-left">
                            {item.completed ? <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" /> : <CircleIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />}
                            <span className={`flex-grow font-semibold text-lg ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{item.title}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFullPageLearningHub = () => {
        if (!activeModule) return null;

        const stateConfig = {
            FOCUSED: { color: 'text-green-400', message: 'Excellent focus!' },
            NEUTRAL: { color: 'text-blue-400', message: 'Engagement stable.' },
            DROWSY: { color: 'text-yellow-400', message: 'Attention drifting...' }
        };
        const currentConfig = stateConfig[bciState];

        return (
            <div className="fixed top-[73px] left-0 right-0 bottom-0 bg-gray-900 z-40 flex flex-col font-sans">
                {currentQuiz && renderQuiz()}
                {showIntervention && <BCIInterventionModal onClose={() => setShowIntervention(false)} onLaunchVRGame={() => { setShowIntervention(false); setShowVRGame(true); }} onLaunchBreak={() => { setShowIntervention(false); setShowBreakTimer(true); }} onLaunchLeaderboard={() => { setShowIntervention(false); setShowLeaderboard(true); }} />}
                {showBreakTimer && <BreakTimerModal onClose={() => setShowBreakTimer(false)} />}
                {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}

                <header className="flex-shrink-0 flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        {isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center"
                                title="Open Sidebar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <button onClick={() => setActiveModule(null)} className="text-gray-400 hover:text-white transition p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold text-white">{activeModule.title}</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Translation Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">Language:</span>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="English">English</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                            </select>
                        </div>

                        {/* Mic Toggle (TTS) */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-400">Speaker</span>
                            <button
                                onClick={() => {
                                    const content = contentCache[activeModule.id]?.[activeContentMode];
                                    if (typeof content === 'string') handleToggleTTS(content);
                                }}
                                className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors duration-200 focus:outline-none ${isSpeaking ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                                <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ${isSpeaking ? 'translate-x-6' : 'translate-x-1'}`}></span>
                            </button>
                        </div>
                    </div>
                </header>
                <div className="flex-grow flex min-h-0">
                    <aside className={`${isSidebarCollapsed ? 'w-0 p-0 border-0 overflow-hidden' : 'w-64 p-6 border-r border-gray-700'} flex-shrink-0 bg-gray-800/50 flex flex-col transition-all duration-300 relative`}>
                        {!isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(true)}
                                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400 transition"
                                title="Collapse Sidebar"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        )}
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Learning Modes</h3>
                        <nav className="flex flex-col space-y-1">
                            {(['READING', '3D_VISUALS', 'VIDEO', 'COMIC'] as LearningMode[]).map(mode => {
                                const isActive = activeContentMode === mode;
                                const Icon = { 'READING': BookIcon, '3D_VISUALS': CubeIcon, 'VIDEO': YouTubeIcon, 'COMIC': ComicIcon }[mode];
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => { setActiveContentMode(mode); fetchContentForModule(activeModule, mode); }}
                                        className={`flex items-center gap-3 p-3 rounded-md text-left font-medium text-sm transition-colors ${isActive ? 'bg-orange-600/20 text-orange-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{mode.replace('_', ' ')}</span>
                                    </button>
                                )
                            })}
                        </nav>

                        <div className="mt-6 border-t border-gray-700 pt-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">BCI Status</h3>
                            <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-md">
                                <PulseIcon className={`w-6 h-6 flex-shrink-0 ${currentConfig.color}`} />
                                <div>
                                    <p className={`font-semibold text-sm ${currentConfig.color}`}>{bciState}</p>
                                    <p className="text-xs text-gray-500">{currentConfig.message}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto border-t border-gray-700 pt-6">
                            <button onClick={() => handleStartQuiz(activeModule.id)} disabled={activeModule.completed} className="w-full px-4 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                <span>{activeModule.completed ? 'Quiz Passed' : 'Take Quiz'}</span>
                            </button>
                        </div>
                    </aside>
                    <main className="flex-grow p-8 overflow-y-auto relative bg-gray-900">
                        {isLoading && (
                            <div className="absolute inset-0 bg-gray-900/80 flex flex-col justify-center items-center z-10 transition-opacity duration-300">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                                <p className="mt-4 text-gray-300 w-64 text-center">{loadingMessage}</p>
                            </div>
                        )}
                        {renderModuleContent()}
                    </main>
                </div>
            </div>
        );
    }

    if (showVRGame) {
        return <WebXRDemo onExit={() => setShowVRGame(false)} />;
    }
    if (activeModule) {
        return renderFullPageLearningHub();
    }

    return (
        <section className="bg-gray-900 py-16 min-h-[80vh] flex items-center">
            <div className="container mx-auto px-6">
                {view === 'INPUT' && renderInputView()}
                {view === 'OUTLINE' && renderOutlineView()}
                {view === 'LEARNING_HUB' && renderLearningHubOutline()}
            </div>
        </section>
    );
};

export default CourseChat;
