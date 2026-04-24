import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Send, CheckCircle, ExternalLink, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';

const initialForm = {
  patient_name: '',
  email: '',
  phone: '',
  reason: '',
  preferred_date: '',
  message: '',
};

export default function ContactSection({ doctor }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasLocation = Boolean(doctor?.location?.trim());
  const encodedLocation = hasLocation ? encodeURIComponent(doctor.location.trim()) : '';
  const mapEmbedUrl = hasLocation ? `https://maps.google.com/maps?q=${encodedLocation}&z=15&output=embed` : '';
  const mapLinkUrl = hasLocation ? `https://www.google.com/maps/search/?api=1&query=${encodedLocation}` : '';

  const bg = isDark ? 'bg-[#111C19]' : 'bg-[#F4F7F5]';
  const cardBg = isDark ? 'bg-[#0A110F]' : 'bg-white';
  const textPrimary = isDark ? 'text-[#E8F0ED]' : 'text-[#1A2421]';
  const textMuted = isDark ? 'text-[#7A9E96]' : 'text-[#4A6B63]';
  const borderColor = isDark ? 'border-[#1E3330]' : 'border-[#E2E8E4]';
  const inputStyle = `w-full bg-transparent border-b-2 ${isDark ? 'border-[#1E3330] text-[#E8F0ED]' : 'border-[#E2E8E4] text-[#1A2421]'} focus:border-[#005F54] outline-none py-3 text-base transition-colors placeholder:text-[#7A9E96]`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await publicApi.createAppointment({
        ...form,
        status: 'pending',
      });
      setSubmitted(true);
      setForm(initialForm);
      toast.success('Appointment request sent successfully.');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error('Unable to send the appointment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className={`py-28 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[#005F54] mb-3">Get In Touch</p>
          <h2 className={`font-serif text-4xl lg:text-5xl font-bold ${textPrimary}`}>Book an Appointment</h2>
          <div className="w-12 h-1 bg-[#005F54] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className={`font-serif text-2xl font-bold mb-4 ${textPrimary}`}>Schedule a Consultation</h3>
              <p className={`leading-relaxed ${textMuted}`}>
                Ready to take the next step towards better health? Fill in your details and we'll get back to you within 24 hours to confirm your appointment.
              </p>
            </div>
            <div className="space-y-4">
              {doctor?.email && <div className={`flex items-center gap-3 text-sm ${textMuted}`}><span className="text-[#005F54]">📧</span> {doctor.email}</div>}
              {doctor?.phone && <div className={`flex items-center gap-3 text-sm ${textMuted}`}><span className="text-[#005F54]">📞</span> {doctor.phone}</div>}
              {doctor?.location && <div className={`flex items-center gap-3 text-sm ${textMuted}`}><span className="text-[#005F54]">📍</span> {doctor.location}</div>}
            </div>
            {hasLocation && (
              <div className={`${cardBg} border ${borderColor} rounded-2xl p-4 space-y-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-semibold mb-1 ${textPrimary}`}>Clinic Location</p>
                    <p className={`text-sm ${textMuted}`}>Find the clinic on the map before your visit.</p>
                  </div>
                  <a
                    href={mapLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#005F54]/20 px-3 py-2 text-xs font-semibold text-[#005F54] transition-colors hover:bg-[#005F54]/5"
                  >
                    <ExternalLink size={14} />
                    Open Map
                  </a>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#005F54]/10">
                  <iframe
                    title="Clinic location map"
                    src={mapEmbedUrl}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-72 w-full"
                  />
                </div>
                <a
                  href={mapLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 text-sm font-medium ${textPrimary} transition-colors hover:text-[#005F54]`}
                >
                  <MapPin size={16} className="text-[#005F54]" />
                  View directions to {doctor.location}
                </a>
              </div>
            )}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6`}>
              <p className={`font-semibold mb-2 ${textPrimary}`}>Consultation Hours</p>
              <div className={`space-y-1 text-sm ${textMuted}`}>
                <p>Monday – Friday: 9:00 AM – 6:00 PM</p>
                <p>Saturday: 10:00 AM – 2:00 PM</p>
                <p>Sunday: Emergency only</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={`${cardBg} border ${borderColor} rounded-3xl p-8 shadow-lg`}>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle size={52} className="text-[#005F54] mx-auto mb-4" />
                <h3 className={`font-serif text-2xl font-bold mb-2 ${textPrimary}`}>Request Sent!</h3>
                <p className={textMuted}>We'll confirm your appointment within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 px-6 py-2 bg-[#005F54] text-white rounded-full text-sm font-medium">
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                {[
                  { key: 'patient_name', label: 'Full Name', placeholder: 'Your full name', required: true },
                  { key: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
                  { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
                  { key: 'reason', label: 'Reason for Visit', placeholder: 'Briefly describe your concern', required: true },
                  { key: 'preferred_date', label: 'Preferred Date', placeholder: '', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label className={`block text-xs font-semibold tracking-widest uppercase mb-2 ${textMuted}`}>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={form[field.key]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className={inputStyle}
                    />
                  </div>
                ))}
                <div>
                  <label className={`block text-xs font-semibold tracking-widest uppercase mb-2 ${textMuted}`}>Additional Message</label>
                  <textarea
                    rows={3}
                    placeholder="Any additional information..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className={inputStyle + ' resize-none'}
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#005F54] text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#004740] transition-colors disabled:opacity-50">
                  {loading ? 'Submitting...' : <><Send size={16} /> Send Appointment Request</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
