import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProfileEditor from '@/components/admin/ProfileEditor';
import ItemManager from '@/components/admin/ItemManager';
import AppointmentsManager from '@/components/admin/AppointmentsManager';
import DashboardOverview from '@/components/admin/DashboardOverview';
import { Menu } from 'lucide-react';
import { notifyContentUpdated } from '@/lib/content-sync';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ensureArray } from '@/lib/utils';
import { toast } from 'sonner';

const specialtyFields = [
  { key: 'title', label: 'Specialty Title', placeholder: 'e.g. Cardiology' },
  { key: 'icon', label: 'Icon Name', placeholder: 'Heart / Brain / Stethoscope / Eye', options: ['Heart', 'Brain', 'Stethoscope', 'Eye', 'Bone', 'Activity'], type: 'select' },
  { key: 'description', label: 'Description', placeholder: 'Brief description...', type: 'textarea', fullWidth: true },
  { key: 'order', label: 'Display Order', placeholder: '1', type: 'number' },
];

const experienceFields = [
  { key: 'type', label: 'Type', options: ['experience', 'education'], type: 'select' },
  { key: 'title', label: 'Title / Degree', placeholder: 'e.g. Senior Consultant' },
  { key: 'institution', label: 'Institution', placeholder: 'e.g. Harvard Medical School' },
  { key: 'period', label: 'Period', placeholder: '2018 – Present' },
  { key: 'description', label: 'Description', placeholder: 'Brief details...', type: 'textarea', fullWidth: true },
  { key: 'order', label: 'Display Order', placeholder: '1', type: 'number' },
];

const publicationFields = [
  { key: 'title', label: 'Publication Title', placeholder: 'Research paper title', fullWidth: true },
  { key: 'journal', label: 'Journal / Conference', placeholder: 'The Lancet' },
  { key: 'year', label: 'Year', placeholder: '2024' },
  { key: 'link', label: 'Link / DOI', placeholder: 'https://...' },
  { key: 'description', label: 'Abstract / Description', placeholder: 'Brief description...', type: 'textarea', fullWidth: true },
  { key: 'order', label: 'Display Order', placeholder: '1', type: 'number' },
];

const testimonialFields = [
  { key: 'patient_name', label: 'Patient Name', placeholder: 'e.g. Sarah M.' },
  { key: 'condition', label: 'Condition / Treatment', placeholder: 'e.g. Cardiac Care' },
  { key: 'rating', label: 'Rating (1-5)', placeholder: '5', type: 'number' },
  { key: 'text', label: 'Testimonial Text', placeholder: 'Patient review...', type: 'textarea', fullWidth: true },
  { key: 'approved', label: 'Show on Site', options: ['true', 'false'], type: 'select' },
  { key: 'order', label: 'Display Order', placeholder: '1', type: 'number' },
];

const sectionLabels = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  specialties: 'Specialties',
  experiences: 'Experience',
  publications: 'Publications',
  testimonials: 'Testimonials',
  appointments: 'Appointments',
};

export default function Admin() {
  const { isAuthenticated, isLoadingAuth, login, authError } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [doctor, setDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [publications, setPublications] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      void loadAll();
    }
  }, [isAuthenticated]);

  const loadAll = async () => {
    try {
      const content = await adminApi.getContent();
      setDoctor(content.doctor || null);
      setSpecialties(ensureArray(content.specialties));
      setExperiences(ensureArray(content.experiences));
      setPublications(ensureArray(content.publications));
      setTestimonials(ensureArray(content.testimonials));
      setAppointments(ensureArray(content.appointments));
    } catch (error) {
      toast.error(error.message || 'Unable to load admin content.');
    }
  };

  const syncAfterMutation = async (action) => {
    await action();
    await loadAll();
    notifyContentUpdated();
  };

  const handleThemeChange = async (nextTheme) => {
    const profileData = { ...(doctor || {}), theme: nextTheme };

    if (doctor?.id) {
      await syncAfterMutation(() => adminApi.updateDoctorProfile(doctor.id, profileData));
      return;
    }

    await syncAfterMutation(() => adminApi.createDoctorProfile(profileData));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmittingLogin(true);

    try {
      await login(credentials);
      setCredentials({ email: '', password: '' });
      toast.success('Admin login successful.');
    } catch (error) {
      toast.error(error.message || 'Unable to sign in.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const stats = {
    pendingAppts: appointments.filter((appointment) => appointment.status === 'pending').length,
    totalAppts: appointments.length,
    specialties: specialties.length,
    experience: experiences.length,
    publications: publications.length,
    testimonials: testimonials.length,
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview stats={stats} />;
      case 'profile':
        return <ProfileEditor doctor={doctor} onUpdate={loadAll} />;
      case 'specialties':
        return (
          <ItemManager
            title="Specialties"
            items={specialties}
            fields={specialtyFields}
            onCreate={(data) => syncAfterMutation(() => adminApi.createEntity('specialties', data))}
            onUpdate={(id, data) => syncAfterMutation(() => adminApi.updateEntity('specialties', id, data))}
            onDelete={(id) => syncAfterMutation(() => adminApi.deleteEntity('specialties', id))}
          />
        );
      case 'experiences':
        return (
          <ItemManager
            title="Experience & Education"
            items={experiences}
            fields={experienceFields}
            createDefaults={{ type: 'experience' }}
            onCreate={(data) => syncAfterMutation(() => adminApi.createEntity('experiences', data))}
            onUpdate={(id, data) => syncAfterMutation(() => adminApi.updateEntity('experiences', id, data))}
            onDelete={(id) => syncAfterMutation(() => adminApi.deleteEntity('experiences', id))}
          />
        );
      case 'publications':
        return (
          <ItemManager
            title="Publications & Research"
            items={publications}
            fields={publicationFields}
            onCreate={(data) => syncAfterMutation(() => adminApi.createEntity('publications', data))}
            onUpdate={(id, data) => syncAfterMutation(() => adminApi.updateEntity('publications', id, data))}
            onDelete={(id) => syncAfterMutation(() => adminApi.deleteEntity('publications', id))}
          />
        );
      case 'testimonials':
        return (
          <ItemManager
            title="Patient Testimonials"
            items={testimonials}
            fields={testimonialFields}
            createDefaults={{ approved: 'true', rating: '5' }}
            onCreate={(data) => syncAfterMutation(() => adminApi.createEntity('testimonials', { ...data, approved: data.approved !== 'false' }))}
            onUpdate={(id, data) => syncAfterMutation(() => adminApi.updateEntity('testimonials', id, { ...data, approved: data.approved !== 'false' }))}
            onDelete={(id) => syncAfterMutation(() => adminApi.deleteEntity('testimonials', id))}
          />
        );
      case 'appointments':
        return <AppointmentsManager appointments={appointments} onUpdate={loadAll} />;
      default:
        return null;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-[#005F54]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider initialTheme="light">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#005F54]">Admin Panel</p>
            <h1 className="font-serif text-3xl font-bold text-card-foreground">Secure Login</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Sign in with your clinic admin credentials to manage your profile, content, and appointments.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#005F54]"
                  placeholder="admin@clinic.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#005F54]"
                  placeholder="Enter your password"
                />
              </div>

              {authError && <p className="text-sm text-red-500">{authError}</p>}

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full rounded-xl bg-[#005F54] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004740] disabled:opacity-50"
              >
                {isSubmittingLogin ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider initialTheme={doctor?.theme || 'dark'}>
      <div className="flex h-screen overflow-hidden bg-background">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-shrink-0">
              <AdminSidebar
                activeSection={activeSection}
                setActiveSection={(section) => {
                  setActiveSection(section);
                  setSidebarOpen(false);
                }}
                onThemeChange={handleThemeChange}
              />
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <div className="hidden md:block flex-shrink-0">
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onThemeChange={handleThemeChange}
          />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-6 py-4 md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground transition-colors hover:text-foreground">
              <Menu size={22} />
            </button>
            <span className="font-semibold text-foreground">{sectionLabels[activeSection] || activeSection}</span>
          </div>
          <div className="max-w-5xl p-6 lg:p-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
