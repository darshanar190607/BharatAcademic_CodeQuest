

import React from 'react';
import { BriefcaseIcon, BuildingIcon, EyeIcon, ChartBarIcon, SearchIcon, PlusIcon, GraduationCapIcon, StarIcon, UserCircleIcon } from '../../components/ui/Icons';

// A generic card component for the dashboard sections
const DashboardCard: React.FC<{ title: string; children: React.ReactNode; cta?: React.ReactNode }> = ({ title, children, cta }) => (
    <div className="bg-[#1c2128] border border-gray-700 rounded-lg overflow-hidden mb-4">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
                {cta && <div>{cta}</div>}
            </div>
            {children}
        </div>
    </div>
);

const EmptyState: React.FC<{ message: string; buttonText: string; }> = ({ message, buttonText }) => (
    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-600 rounded-lg">
        <p className="text-gray-400 mb-4">{message}</p>
        <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto">
            <PlusIcon className="w-5 h-5 mr-2" />
            {buttonText}
        </button>
    </div>
);


const PersonalDashboard: React.FC = () => {
    return (
        <div className="bg-[#0d1117] min-h-screen">
            <div className="container mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN --- */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-[#1c2128] border border-gray-700 rounded-lg overflow-hidden text-center">
                            <div className="h-32 bg-gray-700 relative">
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gray-800 rounded-full border-4 border-[#1c2128] flex items-center justify-center">
                                    <img src="https://i.pravatar.cc/96?u=alex" alt="User Avatar" className="rounded-full" />
                                </div>
                            </div>
                            <div className="pt-16 pb-6 px-6">
                                <h1 className="text-2xl font-bold text-white">Alex Doe</h1>
                                <p className="text-gray-400">Aspiring Lifelong Learner</p>
                                <p className="text-sm text-gray-500 mt-2">San Francisco Bay Area</p>
                            </div>
                            <div className="border-t border-gray-700 p-4 text-left">
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-semibold text-gray-300">Courses Completed</span>
                                    <span className="font-bold text-blue-400">0</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-semibold text-gray-300">Skills Mastered</span>
                                    <span className="font-bold text-blue-400">0</span>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Card */}
                        <DashboardCard title="Analytics & tools">
                            <p className="text-sm text-gray-500 mb-4">Private to you</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <EyeIcon className="w-6 h-6 text-gray-400"/>
                                    <div>
                                        <p className="font-semibold text-white">0 Profile views</p>
                                        <p className="text-xs text-gray-500">See who's viewed your profile.</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <ChartBarIcon className="w-6 h-6 text-gray-400"/>
                                    <div>
                                        <p className="font-semibold text-white">0 Post impressions</p>
                                        <p className="text-xs text-gray-500">Check out who's engaging with your posts.</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <SearchIcon className="w-6 h-6 text-gray-400"/>
                                    <div>
                                        <p className="font-semibold text-white">0 Search appearances</p>
                                        <p className="text-xs text-gray-500">See how often you appear in search results.</p>
                                    </div>
                                </li>
                            </ul>
                        </DashboardCard>
                    </aside>

                    {/* --- RIGHT COLUMN (MAIN CONTENT) --- */}
                    <main className="lg:col-span-2">
                        <DashboardCard title="Learning Activity">
                            <EmptyState
                                message="You haven't started any courses yet. Begin a new module to see your progress here."
                                buttonText="Explore Courses"
                            />
                        </DashboardCard>
                        
                        <DashboardCard title="Skills">
                             <EmptyState
                                message="No skills to show. Complete courses to add skills to your profile and showcase your expertise."
                                buttonText="Find a Course"
                            />
                        </DashboardCard>
                        
                        <DashboardCard title="Courses & Certifications">
                             <EmptyState
                                message="Your completed courses and earned certifications will appear here."
                                buttonText="Browse Course Catalog"
                            />
                        </DashboardCard>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PersonalDashboard;