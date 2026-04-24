import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { notifyContentUpdated } from '@/lib/content-sync';
import { adminApi } from '@/lib/api';

export default function ProfileEditor({ doctor, onUpdate }) {
  const [form, setForm] = useState({
    name: '', title: '', specialty: '', tagline: '', bio: '',
    email: '', phone: '', location: '', years_experience: '', patients_treated: '', awards: '', photo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) setForm(prev => ({ ...prev, ...doctor }));
  }, [doctor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (doctor?.id) {
        await adminApi.updateDoctorProfile(doctor.id, form);
      } else {
        await adminApi.createDoctorProfile(form);
      }
      toast.success('Profile saved!');
      notifyContentUpdated();
      await onUpdate();
    } catch (error) {
      toast.error(error.message || 'Unable to save the profile right now.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await adminApi.uploadFile(file);
      setForm(p => ({ ...p, photo_url: file_url }));
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error(error.message || 'Unable to upload the photo right now.');
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-card-foreground transition-colors placeholder:text-muted-foreground focus:border-[#005F54] focus:outline-none";
  const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground";

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Dr. Jane Smith' },
    { key: 'title', label: 'Professional Title', placeholder: 'MD, FRCS — Senior Consultant' },
    { key: 'specialty', label: 'Primary Specialty', placeholder: 'Cardiology' },
    { key: 'tagline', label: 'Tagline / Motto', placeholder: 'Restoring vitality through precision...' },
    { key: 'email', label: 'Email', placeholder: 'doctor@clinic.com' },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
    { key: 'location', label: 'Location', placeholder: 'New York, NY' },
    { key: 'years_experience', label: 'Years Experience', placeholder: '15', type: 'number' },
    { key: 'patients_treated', label: 'Patients Treated', placeholder: '5000', type: 'number' },
    { key: 'awards', label: 'Awards & Honors Count', placeholder: '20', type: 'number' },
    { key: 'theme', label: 'Site Theme', options: ['light', 'dark'], type: 'select' },
  ];

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">Edit Profile</h2>

      {/* Photo upload */}
      <div className="mb-8 flex items-center gap-6">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card">
          {form.photo_url ? <img src={form.photo_url} alt="Doctor" className="w-full h-full object-cover" /> : <span className="text-3xl">👨‍⚕️</span>}
        </div>
        <div>
          <p className={labelClass}>Profile Photo</p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#005F54] text-white rounded-xl text-sm font-medium hover:bg-[#004740] transition-colors">
            <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {fields.map(f => (
          <div key={f.key} className={f.key === 'tagline' ? 'md:col-span-2' : ''}>
            <label className={labelClass}>{f.label}</label>
            {f.type === 'select' ? (
              <select
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select...</option>
                {f.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={inputClass}
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2">
          <label className={labelClass}>Bio / About</label>
          <textarea
            rows={5}
            placeholder="Write your professional biography..."
            value={form.bio || ''}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className={inputClass + ' resize-none'}
          />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#005F54] text-white rounded-xl font-semibold hover:bg-[#004740] transition-colors disabled:opacity-50">
        <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
