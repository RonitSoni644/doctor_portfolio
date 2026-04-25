import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar({ doctor }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isDark = theme === 'dark';

  const navBg = scrolled
    ? isDark ? 'bg-[#0A110F]/90 backdrop-blur-md shadow-lg border-b border-[#1E3330]' : 'bg-[#FDFCF8]/90 backdrop-blur-md shadow-sm border-b border-[#E2E8E4]'
    : 'bg-transparent';

  const textColor = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const accentColor = 'text-[#005F54]';

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Specialties', href: '#specialties' },
    { label: 'Experience', href: '#experience' },
    { label: 'Publications', href: '#publications' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
          <a href="#hero" className={`font-serif text-xl font-bold tracking-tight ${textColor}`}>
            {doctor?.name ? `Dr. ${doctor.name.split(' ').slice(-1)[0]}` : 'Dr. Portfolio'}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.href} href={link.href}
                className={`text-sm font-medium tracking-wide hover:${accentColor} transition-colors ${textColor} hover:text-[#005F54]`}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-full border transition-colors ${isDark ? 'border-[#1E3330] text-[#E8F0ED] hover:bg-[#1E3330]' : 'border-[#E2E8E4] text-[#1A2421] hover:bg-[#E2E8E4]'}`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
             <Link to="/admin"
              className="hidden md:inline-flex items-center px-4 py-2 bg-[#005F54] text-white text-sm font-medium rounded-full hover:bg-[#004740] transition-colors">
              Admin Panel
            </Link> 
            <button
              className={`md:hidden p-2 ${textColor}`}
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 ${isDark ? 'bg-[#0A110F]' : 'bg-[#FDFCF8]'}`}>
          <button className={`absolute top-6 right-6 ${textColor}`} onClick={() => setMenuOpen(false)}><X size={28} /></button>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className={`text-3xl font-serif font-bold tracking-tight hover:text-[#005F54] transition-colors ${textColor}`}>
              {link.label}
            </a>
          ))}
          <Link to="/admin" onClick={() => setMenuOpen(false)}
            className="mt-4 px-8 py-3 bg-[#005F54] text-white text-lg font-medium rounded-full">
            Admin Panel
          </Link>
        </div>
      )}
    </>
  );
}
