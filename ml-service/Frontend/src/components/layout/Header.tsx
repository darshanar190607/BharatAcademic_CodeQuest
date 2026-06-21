import React from 'react';
import { NavLink as RouterNavLink, Link } from 'react-router-dom';
import { BrainCircuitIcon } from '../ui/Icons.tsx';

// Custom NavLink wrapper to keep the existing styling logic
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `relative text-gray-300 hover:text-white transition-colors duration-300 group`
    }
  >
    {({ isActive }) => (
      <>
        {children}
        <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-transform duration-300 ease-out origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
      </>
    )}
  </RouterNavLink>
);

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0d1117] border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrainCircuitIcon className="w-8 h-8 text-orange-500" />
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            NeuroBright
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/roadmap">Roadmap Creator</NavLink>
          <NavLink to="/collaboration">Collaboration</NavLink>
          <NavLink to="/dashboard">Personal Dashboard</NavLink>
        </nav>
        <div className="flex items-center">
          <button className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;