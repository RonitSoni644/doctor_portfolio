import React from 'react';
import { Link } from 'react-router-dom';
import { User, Stethoscope, Briefcase, BookOpen, Star, Calendar, LayoutDashboard, ExternalLink, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Stethoscope, label: 'Specialties', id: 'specialties' },
  { icon: Briefcase, label: 'Experience', id: 'experiences' },
  { icon: BookOpen, label: 'Publications', id: 'publications' },
  { icon: Star, label: 'Testimonials', id: 'testimonials' },
  { icon: Calendar, label: 'Appointments', id: 'appointments' },
];

export default function AdminSidebar({ activeSection, setActiveSection, onThemeChange }) {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const isDark = theme === 'dark';

  const handleThemeToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    onThemeChange?.(nextTheme);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-card text-card-foreground">
      <div className="border-b border-border p-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#005F54] mb-1">Admin Panel</p>
        <h2 className="font-serif text-xl font-bold">Command Center</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === id
                ? 'bg-[#005F54] text-white shadow-md'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <div className="space-y-2 border-t border-border p-4">
        <button
          onClick={handleThemeToggle}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <Link to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground">
          <ExternalLink size={16} /> View Live Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
