import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const quotes = [
      "Unraveling the mysteries of the cosmos...",
      "Brewing some fresh knowledge...",
      "Engaging the neuro-link...",
      "The universe is made of stories, not of atoms.",
      "Collating wisdom from the digital ether...",
      "Just a moment, great ideas are forming."
    ];
    let quoteIndex = 0;
    setLoadingMessage(quotes[0]);
    const interval = setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      setLoadingMessage(quotes[quoteIndex]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        /* 🌌 Body Setup */
        .loading-screen-body {
          background: radial-gradient(circle at center, #000010, #000);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 3rem;
          height: 100vh;
          overflow: hidden;
          font-family: sans-serif;
        }

        /* NEW NEURAL ORB ANIMATION */
        .neuro-loader {
            position: relative;
            width: 250px;
            height: 250px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .central-orb {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: radial-gradient(circle, #ffffff, #8be2ff 60%, #6888ff 100%);
            box-shadow: 
                0 0 20px #8be2ff, 
                0 0 40px #6888ff,
                0 0 60px #ffffff;
            animation: pulse-orb 4s ease-in-out infinite;
        }

        @keyframes pulse-orb {
            0%, 100% {
                transform: scale(0.95);
                box-shadow: 
                    0 0 20px #8be2ff, 
                    0 0 40px #6888ff,
                    0 0 60px #ffffff;
            }
            50% {
                transform: scale(1.05);
                box-shadow: 
                    0 0 30px #8be2ff, 
                    0 0 60px #6888ff,
                    0 0 90px #ffffff;
            }
        }

        .particle {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #fff;
            box-shadow: 0 0 10px #fff;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }

        .particle-1 {
            animation-name: orbit-1;
            animation-duration: 5s;
        }

        .particle-2 {
            animation-name: orbit-2;
            animation-duration: 8s;
        }
        
        .particle-3 {
            animation-name: orbit-3;
            animation-duration: 6s;
        }

        @keyframes orbit-1 {
            from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }

        @keyframes orbit-2 {
            from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
            to   { transform: rotate(-360deg) translateX(120px) rotate(360deg); }
        }
        
         @keyframes orbit-3 {
            from { transform: rotate(0deg) translateY(105px) rotate(0deg); }
            to   { transform: rotate(360deg) translateY(105px) rotate(-360deg); }
        }

        /* Text styling - Kept from original, but now centered under animation */
        .loading-text-container {
            text-align: center;
            color: white;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .loading-title {
            font-size: 3rem;
            font-weight: bold;
            letter-spacing: 0.2em;
            background: linear-gradient(90deg, #00ffff, #ff00ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 1rem;
        }
        .loading-quote {
            font-size: 1.125rem;
            color: #888;
            height: 2em; /* Reserve space to prevent layout shift */
            transition: opacity 0.5s ease-in-out;
        }
      `}</style>
      <div className="loading-screen-body">
        <div className="neuro-loader">
            <div className="central-orb"></div>
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
        </div>
        <div className="loading-text-container">
            <h1 className="loading-title">NeuroBright</h1>
            <p className="loading-quote">{loadingMessage}</p>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;