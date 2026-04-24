import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';

export default function PublicationsSection({ publications }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sectionBg = isDark ? 'bg-[#111C19]' : 'bg-[#F4F7F5]';
  const cardBg = isDark ? 'bg-[#0A110F]' : 'bg-white';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';

  const defaultPubs = [
    { id: 1, title: 'Advances in Cardiovascular Risk Stratification', journal: 'The Lancet', year: '2023', description: 'A comprehensive meta-analysis of 12,000 patients examining novel biomarkers for heart disease prediction.' },
    { id: 2, title: 'Patient-Centered Approaches in Chronic Disease Management', journal: 'NEJM', year: '2022', description: 'Randomized controlled trial demonstrating 40% improvement in outcomes with individualized care protocols.' },
    { id: 3, title: 'Early Intervention in Metabolic Syndrome', journal: 'JAMA Internal Medicine', year: '2021', description: 'Longitudinal study tracking lifestyle intervention outcomes over 5 years in 800 participants.' },
  ];

  const items = publications?.length > 0 ? publications : defaultPubs;

  return (
    <section id="publications" className={`py-28 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-3">Research</p>
          <h2 className={`font-serif text-4xl lg:text-5xl font-bold ${textPrimary}`}>Publications & Research</h2>
          <div className="w-12 h-1 bg-[#005F54] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-5 max-w-4xl mx-auto">
          {items.map((pub, i) => (
            <div key={pub.id || i}
              className={`${cardBg} border ${borderColor} rounded-2xl p-7 flex gap-5 hover:shadow-lg transition-all group`}>
              <div className="w-12 h-12 bg-[#005F54]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#005F54] transition-colors">
                <BookOpen size={20} className="text-[#005F54] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <h3 className={`font-semibold text-lg leading-tight ${textPrimary}`}>{pub.title}</h3>
                  {pub.link && (
                    <a href={pub.link} target="_blank" rel="noopener noreferrer"
                      className="text-[#005F54] hover:text-[#004740]">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <div className={`flex items-center gap-3 text-sm mb-3 ${textMuted}`}>
                  <span className="font-semibold text-[#005F54]">{pub.journal}</span>
                  {pub.year && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-current"></span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {pub.year}</span>
                    </>
                  )}
                </div>
                {pub.description && <p className={`text-sm leading-relaxed ${textMuted}`}>{pub.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}