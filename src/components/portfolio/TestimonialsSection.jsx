import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection({ testimonials }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? 'bg-[#0A110F]' : 'bg-[#FDFCF8]';
  const cardBg = isDark ? 'bg-[#111C19]' : 'bg-white';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';

  const defaults = [
    { id: 1, patient_name: 'Sarah M.', rating: 5, condition: 'Cardiac Care', text: 'Dr. transformed my life. After years of undiagnosed symptoms, the careful diagnosis and treatment plan gave me my health back. Truly exceptional care.' },
    { id: 2, patient_name: 'James R.', rating: 5, condition: 'Diabetes Management', text: 'The level of attention and personalized care I received was unlike any other medical experience. I feel genuinely heard and supported.' },
    { id: 3, patient_name: 'Priya K.', rating: 5, condition: 'General Medicine', text: 'An exceptional physician who combines brilliant medical knowledge with genuine compassion. I would recommend without hesitation.' },
  ];

  const items = (testimonials?.length > 0 ? testimonials : defaults).filter(t => t.approved !== false);

  return (
    <section id="testimonials" className={`py-28 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-3">Patient Stories</p>
          <h2 className={`font-serif text-4xl lg:text-5xl font-bold ${textPrimary}`}>What Patients Say</h2>
          <div className="w-12 h-1 bg-[#005F54] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={t.id || i} className={`${cardBg} border ${borderColor} rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col`}>
              <Quote size={28} className="text-[#005F54]/30 mb-4" />
              <p className={`text-base leading-relaxed flex-1 mb-6 ${textMuted}`}>"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${textPrimary}`}>{t.patient_name}</p>
                  {t.condition && <p className="text-xs text-[#005F54]">{t.condition}</p>}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}