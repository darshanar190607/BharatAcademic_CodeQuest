
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const cardData = [
  {
    title: 'Adaptive Neural Paths',
    description: 'Our AI analyzes your survey results and learning patterns to generate a curriculum perfectly tailored to your strengths and weaknesses.',
    color: 'from-cyan-400 to-blue-500',
    img: 'https://picsum.photos/seed/path/500/300'
  },
  {
    title: 'BCI Engagement Monitoring',
    description: 'Using your webcam, our system simulates BCI technology to detect signs of drowsiness or distraction, dynamically adjusting content to keep you engaged.',
    color: 'from-purple-500 to-indigo-500',
    img: 'https://picsum.photos/seed/bci/500/300'
  },
  {
    title: 'Immersive Holographic Learning',
    description: 'When you lose focus, we introduce stunning 3D visualizations, AR experiences, and gamified quizzes to reignite your curiosity.',
    color: 'from-fuchsia-500 to-pink-500',
    img: 'https://picsum.photos/seed/arvr/500/300'
  },
  {
    title: 'Synced Hive Mind',
    description: 'Connect with other learners, tackle challenges together in real-time, and contribute to the collective intelligence.',
    color: 'from-emerald-400 to-teal-500',
    img: 'https://picsum.photos/seed/collab/500/300'
  },
];

const OverlappingCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = cardsRef.current.filter(Boolean);
    const totalCards = cards.length;

    // Create a pinned scroll section
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${totalCards * 100}%`,
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        // Manually animate based on progress for maximum control
        const progress = self.progress * (totalCards - 1);
        const activeIndex = Math.floor(progress);
        const fraction = progress - activeIndex;

        cards.forEach((card, index) => {
          if (!card) return;

          // Default state: stacked below
          let y = window.innerHeight;
          let scale = 0.9;
          let opacity = 0;
          let zIndex = index;

          if (index < activeIndex) {
            // Card is fully active/past: Move it slightly up and scale down
            y = 0; // Stick to top
            scale = 0.9 + (0.02 * index); // Slight stack effect
            opacity = 1 - ((activeIndex - index) * 0.2); // Fade out slightly
          } else if (index === activeIndex) {
            // Card is currently entering/active
            y = 0;
            scale = 1 - (fraction * 0.05); // Scale down slightly as next one comes
            opacity = 1;
          } else if (index === activeIndex + 1) {
            // Next card entering
            y = (1 - fraction) * window.innerHeight; // Slide up from bottom
            scale = 1;
            opacity = 1;
          }

          // Fine-tune positioning
          // If it's the very first card, it should just stay there.
          if (index === 0 && activeIndex === 0) {
            y = 0;
            scale = 1 - (fraction * 0.05);
          }

          gsap.to(card, {
            y: y,
            scale: scale,
            opacity: opacity,
            zIndex: zIndex,
            duration: 0.1, // Instant response to scrub
            overwrite: true,
            ease: "none"
          });
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent">
      <div className="absolute top-10 left-0 w-full text-center z-10 px-6 pointer-events-none">
        <h2 className="text-4xl font-extrabold text-white mb-2">How <span className="text-cyan-400">NeuroBright</span> Works</h2>
        <p className="text-lg text-gray-400">Scroll to explore the journey</p>
      </div>

      <div className="relative w-full max-w-5xl h-[60vh] mt-20">
        {cardData.map((card, index) => (
          <div
            key={index}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
            style={{
              zIndex: index,
              transform: index === 0 ? 'none' : 'translateY(100vh)' // Initial off-screen for non-first cards
            }}
          >
            <div className={`
                    w-full h-full rounded-3xl bg-[#0A0E17] border border-white/10
                    p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12 items-center
                `}>
              {/* Gradient Glow */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`}></div>

              <div className="md:w-1/2 text-left z-10">
                <div className={`inline-block px-3 py-1 mb-4 rounded-full border border-white/20 text-xs font-mono uppercase tracking-widest text-gray-400`}>
                  Step 0{index + 1}
                </div>
                <h3 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-6 leading-tight`}>
                  {card.title}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">{card.description}</p>
              </div>
              <div className="md:w-1/2 w-full h-64 md:h-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-20 mix-blend-overlay`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverlappingCards;