import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, User, Menu, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export default function Header({ onSearchClick, onProfileClick }: HeaderProps) {
  const [location] = useLocation();
  const { state, dispatch } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLanguage = state.language === 'it' ? 'en' : 'it';
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/movies', label: 'Film' },
    { path: '/tv', label: 'Serie TV' },
    { path: '/my-list', label: 'La mia lista' },
    { path: '/history', label: 'Cronologia' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-white cursor-pointer">SoaggTV</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`font-medium transition-colors ${
                  location === item.path 
                    ? 'text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
              title={state.language === 'it' ? 'Switch to English' : 'Cambia in Italiano'}
            >
              <span className="text-sm font-medium">
                {state.language.toUpperCase()}
              </span>
            </button>

            {/* Search */}
            <button
              onClick={onSearchClick}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Profile */}
            <button
              onClick={onProfileClick}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
            >
              <User size={20} />
              <span className="hidden sm:inline text-sm">
                {state.user?.name || 'Profilo'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-gray-300 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-gray-800">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`block px-3 py-2 transition-colors ${
                    location === item.path 
                      ? 'text-white bg-gray-800 rounded-md' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800 rounded-md'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
