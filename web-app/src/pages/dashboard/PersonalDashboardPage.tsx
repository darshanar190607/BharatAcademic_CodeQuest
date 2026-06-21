import React, { useEffect, useState } from 'react';
import { BriefcaseIcon, BuildingIcon, EyeIcon, ChartBarIcon, SearchIcon, PlusIcon, GraduationCapIcon, StarIcon, UserCircleIcon } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; cta?: React.ReactNode; className?: string }> = ({ title, children, cta, className }) => (
    <div className={`bg-[#1c2128] border border-gray-700 rounded-lg overflow-hidden mb-4 shadow-xl shadow-black/30 w-full ${className}`}>
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
                {cta && <div>{cta}</div>}
            </div>
            {children}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1c2128] border border-gray-600 p-3 rounded-md shadow-lg shadow-black/50">
                <p className="text-gray-300 font-semibold mb-2">{`${label}`}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="font-bold text-sm">
                        {`${entry.name}: ${entry.value}s`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PersonalDashboard: React.FC = () => {
    const { user, openAuthModal } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('neurobright_sessions') || '[]');
        setSessions(history);
    }, []);

    const totalSeconds = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);

    const bciChartData = sessions.map((session, index) => {
        const d = new Date(session.date);
        return {
            name: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`,
            Topic: session.topic || `Session ${index + 1}`,
            Focused: session.bciBreakdown?.FOCUSED || 0,
            Neutral: session.bciBreakdown?.NEUTRAL || 0,
            Drowsy: session.bciBreakdown?.DROWSY || 0,
            Total: session.durationSeconds
        };
    });

    const aggregateFocused = sessions.reduce((acc, curr) => acc + (curr.bciBreakdown?.FOCUSED || 0), 0);
    const aggregateNeutral = sessions.reduce((acc, curr) => acc + (curr.bciBreakdown?.NEUTRAL || 0), 0);
    const aggregateDrowsy = sessions.reduce((acc, curr) => acc + (curr.bciBreakdown?.DROWSY || 0), 0);
    const totalRecordedBci = aggregateFocused + aggregateNeutral + aggregateDrowsy || 1; // prevent div/0
    const focusPercentage = Math.round((aggregateFocused / totalRecordedBci) * 100);

    return (
        <div className="bg-[#0d1117] min-h-screen text-white">
            <div className="container mx-auto px-4 md:px-8 py-8">
                {/* TOP HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Neural Learning Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Track your brain states, study habits, and collaboration metrics.</p>
                    </div>
                    {user ? (
                        <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-full flex gap-3 items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-semibold">{user.name} Connected</span>
                        </div>
                    ) : (
                        <button onClick={openAuthModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Sign In / Sync Cloud
                        </button>
                    )}
                </div>

                {/* KPI BANNER */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 border border-purple-500/30 p-6 rounded-xl flex items-center gap-4">
                        <div className="bg-purple-900/50 p-3 rounded-lg"><ClockIcon className="w-6 h-6 text-purple-400" /></div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Total Study Time</p>
                            <p className="text-2xl font-bold text-white">{totalMinutes} <span className="text-sm">mins</span></p>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-blue-500/30 p-6 rounded-xl flex items-center gap-4">
                        <div className="bg-blue-900/50 p-3 rounded-lg"><BrainIcon className="w-6 h-6 text-blue-400" /></div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Avg Focus Level</p>
                            <p className="text-2xl font-bold text-blue-400">{focusPercentage}%</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-green-500/30 p-6 rounded-xl flex items-center gap-4">
                        <div className="bg-green-900/50 p-3 rounded-lg"><GraduationCapIcon className="w-6 h-6 text-green-400" /></div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Concepts Learned</p>
                            <p className="text-2xl font-bold text-white">{sessions.length}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-yellow-500/30 p-6 rounded-xl flex items-center gap-4">
                        <div className="bg-yellow-900/50 p-3 rounded-lg"><StarIcon className="w-6 h-6 text-yellow-400" /></div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Earned Points</p>
                            <p className="text-2xl font-bold text-yellow-400">{(totalMinutes * 15) + (focusPercentage * 10)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN --- */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Daily Goals */}
                        <DashboardCard title="🎯 Daily Goals">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Achieve 60 mins of Study</span>
                                        <span className="text-blue-400">{Math.min(totalMinutes, 60)}/60m</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((totalMinutes/60)*100, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Maintain &gt;80% Workflow Focus</span>
                                        <span className={focusPercentage >= 80 ? "text-green-400" : "text-yellow-400"}>{focusPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${focusPercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${focusPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                    <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-sm text-gray-300 transition-colors">
                                        Edit Goals
                                    </button>
                                </div>
                            </div>
                        </DashboardCard>

                        {/* Leaderboard Mockup */}
                        <DashboardCard title="🏆 Class Leaderboard">
                            <div className="space-y-3">
                                {[
                                    { rank: 1, name: "Sophia C.", points: 12500, self: false },
                                    { rank: 2, name: "Ben Carter", points: 11800, self: false },
                                    { rank: 3, name: user?.name || "You", points: (totalMinutes * 15) + (focusPercentage * 10) || 5400, self: true },
                                    { rank: 4, name: "Liam G.", points: 4200, self: false },
                                ].map((lb) => (
                                    <div key={lb.rank} className={`flex items-center justify-between p-2 rounded-md ${lb.self ? 'bg-purple-900/40 border border-purple-500/50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold ${lb.rank === 1 ? 'text-yellow-400' : lb.rank === 2 ? 'text-gray-300' : lb.rank === 3 ? 'text-yellow-600' : 'text-gray-500'}`}>#{lb.rank}</span>
                                            <span className={`text-sm ${lb.self ? 'text-white font-bold' : 'text-gray-300'}`}>{lb.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-400">{lb.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </DashboardCard>
                    </aside>

                    {/* --- RIGHT COLUMN (MAIN CONTENT) --- */}
                    <main className="lg:col-span-2 space-y-8">
                        {/* BCI Analytics Chart */}
                        <DashboardCard title="🧠 Neural Engagement Breakdown">
                            {bciChartData.length > 0 ? (
                                <div>
                                    <p className="text-sm text-gray-400 mb-6">
                                        Tracking your time spent in different mental states across recent learning interactions. Data collected directly from your BCI headset.
                                    </p>
                                    <div className="h-80 w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={bciChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                                <XAxis dataKey="name" stroke="#718096" tick={{ fill: '#a0aec0' }} />
                                                <YAxis stroke="#718096" tick={{ fill: '#a0aec0' }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                <Bar dataKey="Focused" stackId="a" fill="#3b82f6" name="Focused (s)" radius={[0, 0, 4, 4]} />
                                                <Bar dataKey="Neutral" stackId="a" fill="#10b981" name="Neutral (s)" />
                                                <Bar dataKey="Drowsy" stackId="a" fill="#ef4444" name="Drowsy (s)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-700/50 rounded-lg">
                                    <p className="text-gray-400 mb-4">No BCI study sessions recorded yet.</p>
                                    <p className="text-sm text-gray-500">Go to the learning hub, select a module, and start studying to generate neurological tracking data.</p>
                                </div>
                            )}
                        </DashboardCard>

                        {/* Course / Collaboration History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DashboardCard title="📚 Concepts List">
                                {sessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {sessions.slice(-4).reverse().map((s, i) => (
                                            <div key={i} className="flex flex-col bg-gray-800/80 p-3 rounded border border-gray-700">
                                                <span className="font-semibold text-gray-200">{s.topic || 'Unknown Module'}</span>
                                                <span className="text-xs text-gray-500 mt-1">Duration: {s.durationSeconds}s | Focus ratio: {Math.round((s.bciBreakdown?.FOCUSED / (s.bciBreakdown?.FOCUSED + s.bciBreakdown?.NEUTRAL + s.bciBreakdown?.DROWSY)) * 100) || 0}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No learning history recorded.</p>
                                )}
                            </DashboardCard>

                            <DashboardCard title="🤝 Collaboration Room Use Cases">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-200">Study Group Alpha</p>
                                            <p className="text-xs text-gray-500">Live WebXR Session: 3 studying now</p>
                                        </div>
                                        <button className="ml-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded">Join</button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-pink-900/50 flex items-center justify-center text-pink-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-200">Mentor Consultation</p>
                                            <p className="text-xs text-gray-500">Requested 1hr ago via AI Chat</p>
                                        </div>
                                        <button className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded border border-gray-600">Pending</button>
                                    </div>
                                </div>
                            </DashboardCard>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

// Helper SVG Icons for the new layout
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BrainIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636 4.364l.707.707M6.343 6.343l-.707-.707m12.728 0l.707-.707" /></svg>;

export default PersonalDashboard;