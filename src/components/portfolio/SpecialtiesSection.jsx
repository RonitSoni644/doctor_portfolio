import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Stethoscope, Brain, Heart, Eye, Bone, Activity } from 'lucide-react';

const iconMap = { Stethoscope, Brain, Heart, Eye, Bone, Activity };

export default function SpecialtiesSection({ specialties }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? 'bg-[#111C19]' : 'bg-white';
  const sectionBg = isDark ? 'bg-[#0A110F]' : 'bg-[#F4F7F5]';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';

  const defaultSpecialties = [
    { id: 1, title: 'Cardiology', description: 'Comprehensive heart care including diagnostics, interventional procedures, and long-term management.', icon: 'Heart' },
    { id: 2, title: 'Internal Medicine', description: 'Holistic approach to adult health — prevention, diagnosis, and treatment of complex conditions.', icon: 'Stethoscope' },
    { id: 3, title: 'Neurology', description: 'Expert diagnosis and treatment of neurological disorders using the latest techniques.', icon: 'Brain' },
  ];

  const items = specialties?.length > 0 ? specialties : defaultSpecialties;

  return (
    <section id="specialties" className={`py-28 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-3">Expertise</p>
          <h2 className={`font-serif text-4xl lg:text-5xl font-bold ${textPrimary}`}>Areas of Specialization</h2>
          <div className="w-12 h-1 bg-[#005F54] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((spec, i) => {
            const IconComponent = iconMap[spec.icon] || Stethoscope;
            return (
              <div key={spec.id || i}
                className={`${bg} border ${borderColor} rounded-3xl p-8 hover:shadow-xl transition-all hover:-translate-y-1 group`}>
                <div className="w-14 h-14 bg-[#005F54]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#005F54] transition-colors">
                  <IconComponent size={26} className="text-[#005F54] group-hover:text-white transition-colors" />
                </div>
                <h3 className={`font-serif text-xl font-bold mb-3 ${textPrimary}`}>{spec.title}</h3>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{spec.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}