import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WelcomeButton, SearchBar } from '../../components/ui/Icons.tsx';
import CourseChat from '../../features/course-chat/CourseChat.tsx';
import OverlappingCards from '../../components/ui/OverlappingCards.tsx';
import BrainScene from '../../components/3d/BrainScene.tsx';
import gsap from 'gsap';

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation for text
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const navItems = [
    { label: 'Course Learning', path: '/courses' },
    { label: 'Roadmap Creator', path: '/roadmap' },
    { label: 'Collaboration', path: '/collaboration' },
    { label: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* 3D Background - Fixed Position */}
      <BrainScene />

      {/* Hero Section */}
      <section ref={heroRef} className="relative container mx-auto px-6 pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col md:flex-row items-center z-10">

        <div ref={textRef} className="md:w-3/5 text-center md:text-left">
          <div className="inline-block px-4 py-1 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm tracking-widest uppercase backdrop-blur-md">
            Next Gen Learning
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter">
            Unlock Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-glow filter drop-shadow-lg">
              Neural Potential
            </span>
          </h1>
          <p className="mt-8 text-xl text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
            Experience education evolved. NeuroBright combines <span className="text-cyan-400 font-medium">Advanced AI</span> with <span className="text-purple-400 font-medium">BCI Adaptivity</span> to construct a learning path that evolves with your mind.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center md:justify-start items-center">
            <WelcomeButton />
            <button className="px-8 py-3 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 uppercase tracking-widest text-sm font-semibold">
              Explore Features
            </button>
          </div>
        </div>

        {/* Right side is open for the 3D Brain visualization */}
        <div className="md:w-2/5 mt-12 md:mt-0 relative h-[400px]">
          {/* The brain is in the background, but this space ensures layout balance */}
        </div>
      </section>

      {/* Spacer for Brain View - "Clear View Moment" */}
      <div className="h-[70vh] w-full flex items-center justify-center pointer-events-none relative z-0">
        {/* Brain moves to center here */}
      </div>

      {/* Sub Navbar / Features Nav */}
      <section className="sticky top-[80px] z-40 my-10">
        <div className="container mx-auto px-6">
          <div className="bg-glass rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-purple-900/20">
            <div className="flex space-x-8 mb-4 md:mb-0 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {navItems.map((item, i) => (
                <Link key={i} to={item.path} className="whitespace-nowrap text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm tracking-wide uppercase">
                  {item.label}
                </Link>
              ))}
            </div>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <div id="how-it-works" className="relative z-10">

        <OverlappingCards />
      </div>

      {/* Course Chat Section */}
      <div className="relative z-10 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17] to-transparent pt-20">
        <CourseChat />
      </div>
    </div>
  );
};

export default HomePage;
