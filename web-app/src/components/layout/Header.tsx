import React from 'react';
import { NavLink as RouterNavLink, Link } from 'react-router-dom';
import { BrainCircuitIcon } from '../ui/Icons.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

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
  const { user, openAuthModal, logout } = useAuth();

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
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-400">Welcome, </span>
                <span className="text-cyan-400 font-semibold">{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 hover:text-white hover:border-red-500 hover:bg-red-500/10 transition-all text-sm font-medium tracking-wide"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-[0_0_15px_rgba(0,238,255,0.4)] transition-all text-sm font-bold tracking-wide uppercase"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;