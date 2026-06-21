import React, { useState } from 'react';

// --- TYPES ---
export interface VideoResult {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
}

interface YouTubeSearchProps {
    videos: VideoResult[];
    onVideoSelect: (videoId: string) => void;
    isLoading: boolean;
    error: string | null;
}

const YouTubeSearch: React.FC<YouTubeSearchProps> = ({ videos, onVideoSelect, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg overflow-hidden h-64 border border-gray-700">
                        <div className="h-40 bg-gray-700"></div>
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-700 w-3/4 rounded"></div>
                            <div className="h-3 bg-gray-700 w-1/2 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center bg-red-900/20 rounded-xl border border-red-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-300 font-medium">{error}</p>
                <p className="text-red-400/60 text-sm mt-2">Try refreshing or selecting a different topic.</p>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400 h-64 border border-dashed border-gray-700 rounded-lg">
                <p>No educational videos found for this topic.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {videos.map((video) => (
                <div
                    key={video.id}
                    onClick={() => onVideoSelect(video.id)}
                    className="group relative flex flex-col bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
                >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video overflow-hidden">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                            <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-red-glow backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-mono border border-white/10">
                            20m+
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow p-4">
                        <h3 className="text-base font-bold text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors mb-2">
                            {video.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 border-t border-gray-700/50 pt-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase">
                                    {video.channelTitle.substring(0, 2)}
                                </div>
                                <span className="font-medium hover:text-white transition-colors truncate max-w-[120px]">{video.channelTitle}</span>
                            </div>
                            <span>{new Date(video.publishedAt).getFullYear()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default YouTubeSearch;
