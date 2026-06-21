import React from 'react';

interface CertificateProps {
    studentName?: string;
    topic: string;
    date?: string;
}

const Certificate: React.FC<CertificateProps> = ({
    studentName = "Darshan AR",
    topic,
    date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}) => {
    return (
        <div
            id="certificate-node"
            className="relative w-[850px] min-h-[600px] bg-slate-900 border-[16px] border-double border-yellow-600 p-8 shadow-2xl flex flex-col justify-between items-center text-center overflow-hidden font-serif"
            style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }}
        >
            {/* Watermark Logo / Background accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col items-center z-10 w-full flex-grow justify-center mt-2">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-5xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 uppercase" style={{ textShadow: '0 2px 10px rgba(234, 179, 8, 0.2)' }}>
                        Certificate of Mastery
                    </h1>
                </div>

                {/* Certification Statement */}
                <div className="mb-6">
                    <p className="text-gray-400 italic text-xl">This certificate is proudly presented to</p>
                </div>

                {/* Recipient Name */}
                <div className="mb-6 w-full max-w-lg border-b-2 border-yellow-600/50 pb-2">
                    <h2 className="text-6xl text-white font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                        {studentName}
                    </h2>
                </div>

                {/* Achievement */}
                <div className="px-12 mb-4">
                    <p className="text-gray-300 text-xl leading-relaxed">
                        For successfully completing the NeuroBright Adaptive Learning Roadmap, defeating the final Boss Challenge, and demonstrating exceptional understanding in the field of:
                    </p>
                    <div className="mt-8 text-3xl font-bold text-yellow-500 bg-black/40 py-3 px-8 rounded-lg inline-block border border-yellow-600/30 shadow-inner">
                        {topic}
                    </div>
                </div>
            </div>

            {/* Footer / Signatures */}
            <div className="w-full px-12 flex justify-between items-end z-10 mt-auto pb-4 pt-8">
                <div className="flex flex-col items-center">
                    <p className="text-yellow-500 text-xl mb-2">{date}</p>
                    <div className="w-40 border-t border-gray-500 pt-2 text-gray-400 text-sm italic">
                        Date Issued
                    </div>
                </div>

                {/* Organization Details */}
                <div className="flex flex-col items-center justify-center translate-y-2">
                    <p className="text-white font-bold tracking-widest text-xl mb-1">NEUROBRIGHT</p>
                    <p className="text-gray-500 text-xs tracking-wider">ADAPTIVE LEARNING PLATFORM</p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="font-signature text-yellow-500 text-4xl mb-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>NeuroBright System</div>
                    <div className="w-48 border-t border-gray-500 pt-2 text-gray-400 text-sm italic">
                        Certified By
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
