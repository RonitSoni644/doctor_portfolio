import React from 'react';
import { MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function HeroSection({ doctor }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? 'bg-[#0A110F]' : 'bg-[#FDFCF8]';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';
  const statBg = isDark ? 'bg-[#111C19]' : 'bg-white';

  return (
    <section id="hero" className={`min-h-screen ${bg} flex items-center pt-20`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-2 gap-16 items-center py-20">
        
        {/* Left Content */}
        <div className="space-y-8">
          <div>
            <p className={`text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-4`}>
              {doctor?.specialty || 'Medical Specialist'}
            </p>
            <h1 className={`font-serif text-5xl lg:text-7xl font-bold leading-tight ${textPrimary}`}>
              Dr. {doctor?.name || 'Your Name'}
            </h1>
            <p className={`text-xl mt-3 font-medium ${textMuted}`}>
              {doctor?.title || 'MD, FRCS — Senior Consultant'}
            </p>
          </div>

          <p className={`text-lg leading-relaxed max-w-lg ${textMuted}`}>
            {doctor?.tagline || 'Dedicated to restoring vitality through precision medicine and compassionate care. Over a decade of excellence in patient outcomes.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#contact"
              className="px-8 py-4 bg-[#005F54] text-white font-semibold rounded-full hover:bg-[#004740] transition-all shadow-lg hover:shadow-xl">
              Book Appointment
            </a>
            <a href="#about"
              className={`px-8 py-4 font-semibold rounded-full border-2 transition-all ${isDark ? 'border-[#1E3330] text-[#E8F0ED] hover:bg-[#1E3330]' : 'border-[#E2E8E4] text-[#1A2421] hover:bg-[#E2E8E4]'}`}>
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-4 pt-4`}>
            {[
              { value: doctor?.years_experience || '15+', label: 'Years Experience' },
              { value: doctor?.patients_treated ? `${doctor.patients_treated}+` : '5000+', label: 'Patients Treated' },
              { value: doctor?.awards || '20+', label: 'Awards & Honors' },
            ].map((stat, i) => (
              <div key={i} className={`${statBg} border ${borderColor} rounded-2xl p-4 text-center shadow-sm`}>
                <p className="text-2xl font-bold text-[#005F54]">{stat.value}</p>
                <p className={`text-xs mt-1 ${textMuted}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Contact chips */}
          <div className="flex flex-wrap gap-3">
            {doctor?.location && (
              <span className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <MapPin size={14} className="text-[#005F54]" /> {doctor.location}
              </span>
            )}
            {doctor?.phone && (
              <span className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <Phone size={14} className="text-[#005F54]" /> {doctor.phone}
              </span>
            )}
            {doctor?.email && (
              <span className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <Mail size={14} className="text-[#005F54]" /> {doctor.email}
              </span>
            )}
          </div>
        </div>

        {/* Right: Photo */}
        <div className="relative flex justify-center">
          <div className="relative w-80 h-96 lg:w-[420px] lg:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#005F54]/20 to-[#005F54]/5 rounded-3xl transform rotate-3"></div>
            {doctor?.photo_url ? (
              <img
                src={doctor.photo_url}
                alt={doctor.name}
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            ) : (
              <div className={`relative z-10 w-full h-full rounded-3xl shadow-2xl flex items-center justify-center ${isDark ? 'bg-[#111C19]' : 'bg-[#E8F0ED]'}`}>
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#005F54]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl text-[#005F54]">👨‍⚕️</span>
                  </div>
                  <p className={`text-sm ${textMuted}`}>Doctor's Photo</p>
                </div>
              </div>
            )}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#005F54]/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#005F54]/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      <a href="#about" className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce ${textMuted}`}>
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
