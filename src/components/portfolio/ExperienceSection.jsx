import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function ExperienceSection({ experiences }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('experience');

  const bg = isDark ? 'bg-[#0A110F]' : 'bg-[#FDFCF8]';
  const cardBg = isDark ? 'bg-[#111C19]' : 'bg-white';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';

  const defaultExp = [
    { id: 1, type: 'experience', title: 'Senior Consultant Physician', institution: 'City General Hospital', period: '2018 – Present', description: 'Leading the internal medicine department with a team of 12 physicians.' },
    { id: 2, type: 'experience', title: 'Associate Physician', institution: 'Metro Medical Center', period: '2014 – 2018', description: 'Specialized in complex diagnostic cases and patient management.' },
    { id: 3, type: 'education', title: 'MD in Internal Medicine', institution: 'Harvard Medical School', period: '2009 – 2013', description: 'Graduated with honors. Thesis on cardiovascular risk management.' },
    { id: 4, type: 'education', title: 'MBBS', institution: 'University of Cambridge', period: '2003 – 2009', description: 'First class honors. Gold medalist in clinical rotations.' },
  ];

  const items = experiences?.length > 0 ? experiences : defaultExp;
  const filtered = items.filter(e => e.type === activeTab);

  return (
    <section id="experience" className={`py-28 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-3">Background</p>
          <h2 className={`font-serif text-4xl lg:text-5xl font-bold ${textPrimary}`}>Experience & Education</h2>
          <div className="w-12 h-1 bg-[#005F54] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-12">
          {['experience', 'education'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-[#005F54] text-white shadow-md'
                  : isDark ? 'bg-[#111C19] text-[#7A9E96] border border-[#1E3330]' : 'bg-white text-[#4A6B63] border border-[#E2E8E4]'
              }`}>
              {tab === 'experience' ? <Briefcase size={15} /> : <GraduationCap size={15} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto space-y-6 relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[#005F54]/20"></div>
          {filtered.map((item, i) => (
            <div key={item.id || i} className="flex gap-8 relative">
              <div className="flex-shrink-0 w-12 h-12 bg-[#005F54]/10 rounded-full border-2 border-[#005F54]/30 flex items-center justify-center z-10">
                {activeTab === 'experience' ? <Briefcase size={16} className="text-[#005F54]" /> : <GraduationCap size={16} className="text-[#005F54]" />}
              </div>
              <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 flex-1 shadow-sm`}>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3 className={`font-semibold text-lg ${textPrimary}`}>{item.title}</h3>
                  <span className="text-xs font-semibold text-[#005F54] bg-[#005F54]/10 px-3 py-1 rounded-full">{item.period}</span>
                </div>
                <p className="text-[#005F54] font-medium text-sm mb-2">{item.institution}</p>
                {item.description && <p className={`text-sm leading-relaxed ${textMuted}`}>{item.description}</p>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={`text-center ${textMuted} py-8`}>No {activeTab} entries yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}