import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Bell, LogOut, Menu, X } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Logo } from './Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'HSC', path: '/category/hsc' },
    { name: 'SSC', path: '/category/ssc' },
    { name: 'Admission', path: '/category/admission' },
  ];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo className={isScrolled ? 'text-black' : 'text-white'} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative text-sm font-medium transition-colors',
                isScrolled ? 'text-gray-700 hover:text-black' : 'text-white/80 hover:text-white',
                location.pathname === item.path && (isScrolled ? 'text-black' : 'text-white')
              )}
            >
              {item.name}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeIndicator"
                  className={cn(
                    'absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px]',
                    isScrolled ? 'border-b-black' : 'border-b-white'
                  )}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden lg:flex items-center bg-gray-100/20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
              <Search className={cn('w-4 h-4 mr-2', isScrolled ? 'text-gray-500' : 'text-white/60')} />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'bg-transparent border-none outline-none text-sm w-40 transition-all focus:w-60',
                  isScrolled ? 'text-black placeholder:text-gray-400' : 'text-white placeholder:text-white/40'
                )}
              />
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100/10 transition-colors">
                <Bell className={cn('w-5 h-5', isScrolled ? 'text-gray-700' : 'text-white')} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Link>
              <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white transition-all">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" />
              </Link>
              <button
                onClick={handleLogout}
                className={cn('p-2 rounded-full hover:bg-gray-100/10 transition-colors', isScrolled ? 'text-gray-700' : 'text-white')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-semibold transition-all',
                isScrolled ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-100'
              )}
            >
              Sign In
            </button>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn('w-6 h-6', isScrolled ? 'text-black' : 'text-white')} />
            ) : (
              <Menu className={cn('w-6 h-6', isScrolled ? 'text-black' : 'text-white')} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl p-6 md:hidden flex flex-col gap-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'text-lg font-medium py-2 border-b border-gray-100',
                  location.pathname === item.path ? 'text-black' : 'text-gray-500'
                )}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 mt-2">
                <Search className="w-5 h-5 mr-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="bg-transparent border-none outline-none text-base w-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
