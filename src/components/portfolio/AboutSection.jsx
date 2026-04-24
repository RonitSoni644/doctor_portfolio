import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Award, Heart, BookOpen } from 'lucide-react';

export default function AboutSection({ doctor }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? 'bg-[#111C19]' : 'bg-white';
  const sectionBg = isDark ? 'bg-[#0A110F]' : 'bg-[#FDFCF8]';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';

  const values = [
    { icon: Heart, title: 'Patient-First Philosophy', desc: 'Every decision is guided by the best interest of the patient.' },
    { icon: Award, title: 'Clinical Excellence', desc: 'Committed to the highest standards of medical practice.' },
    { icon: BookOpen, title: 'Continuous Learning', desc: 'Staying at the forefront of medical research and innovation.' },
  ];

  return (
    <section id="about" className={`py-28 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-3">About</p>
            <h2 className={`font-serif text-4xl lg:text-5xl font-bold leading-tight mb-6 ${textPrimary}`}>
              A Commitment to<br />Healing Excellence
            </h2>
            <div className={`w-12 h-1 bg-[#005F54] mb-8 rounded-full`}></div>
            <p className={`text-lg leading-relaxed ${textMuted}`}>
              {doctor?.bio || `With over a decade of dedicated practice in medicine, Dr. ${doctor?.name || 'the doctor'} has built a reputation for combining cutting-edge clinical expertise with genuine compassion. Trained at world-renowned institutions, the approach to patient care prioritizes individualized treatment plans and evidence-based outcomes.\n\nBeyond the clinic, there is a deep commitment to advancing medical education and contributing to research that shapes the future of healthcare.`}
            </p>
          </div>

          <div className="space-y-6">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className={`${bg} border ${borderColor} rounded-2xl p-6 flex gap-5 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="w-12 h-12 bg-[#005F54]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-[#005F54]" />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg mb-1 ${textPrimary}`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${textMuted}`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}