import React from 'react';
import { Stethoscope, Briefcase, BookOpen, Star, Calendar, TrendingUp } from 'lucide-react';

export default function DashboardOverview({ stats }) {
  const cards = [
    { icon: Calendar, label: 'Pending Appointments', value: stats.pendingAppts, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { icon: Calendar, label: 'Total Appointments', value: stats.totalAppts, color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: Stethoscope, label: 'Specialties', value: stats.specialties, color: 'text-[#005F54]', bg: 'bg-[#005F54]/10' },
    { icon: Briefcase, label: 'Experience Entries', value: stats.experience, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: BookOpen, label: 'Publications', value: stats.publications, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: Star, label: 'Testimonials', value: stats.testimonials, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];

  return (
    <div>
      <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">Dashboard</h2>
      <p className="mb-8 text-sm text-muted-foreground">Overview of your portfolio content</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{value ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={18} className="text-[#005F54]" />
          <h3 className="font-semibold text-card-foreground">Quick Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-[#005F54] mt-0.5">→</span> Keep your profile photo and bio up to date for a strong first impression.</li>
          <li className="flex items-start gap-2"><span className="text-[#005F54] mt-0.5">→</span> Add your latest publications to showcase your research authority.</li>
          <li className="flex items-start gap-2"><span className="text-[#005F54] mt-0.5">→</span> Confirm or decline pending appointments promptly to maintain patient trust.</li>
          <li className="flex items-start gap-2"><span className="text-[#005F54] mt-0.5">→</span> Approve patient testimonials that reflect your care and expertise.</li>
        </ul>
      </div>
    </div>
  );
}
