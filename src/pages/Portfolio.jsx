import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/portfolio/Navbar';
import HeroSection from '@/components/portfolio/HeroSection';
import AboutSection from '@/components/portfolio/AboutSection';
import SpecialtiesSection from '@/components/portfolio/SpecialtiesSection';
import ExperienceSection from '@/components/portfolio/ExperienceSection';
import PublicationsSection from '@/components/portfolio/PublicationsSection';
import TestimonialsSection from '@/components/portfolio/TestimonialsSection';
import ContactSection from '@/components/portfolio/ContactSection';
import Footer from '@/components/portfolio/Footer';
import { subscribeToContentUpdates } from '@/lib/content-sync';
import { publicApi } from '@/lib/api';
import { ensureArray } from '@/lib/utils';

export default function Portfolio() {
  const CONTENT_REFRESH_INTERVAL_MS = 30000;
  const [doctor, setDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [publications, setPublications] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [theme, setTheme] = useState('light');
  const lastLoadedAtRef = useRef(0);
  const inFlightRequestRef = useRef(null);

  useEffect(() => {
    void loadData({ force: true });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToContentUpdates(() => {
      void loadData({ force: true });
    });

    const handleFocus = () => {
      void loadData();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && now - lastLoadedAtRef.current < CONTENT_REFRESH_INTERVAL_MS) {
      return inFlightRequestRef.current;
    }

    if (inFlightRequestRef.current) {
      return inFlightRequestRef.current;
    }

    const request = publicApi.getContent()
      .then((content) => {
        setDoctor(content.doctor || null);
        setTheme(content.doctor?.theme || 'light');
        setSpecialties(ensureArray(content.specialties));
        setExperiences(ensureArray(content.experiences));
        setPublications(ensureArray(content.publications));
        setTestimonials(ensureArray(content.testimonials));
        lastLoadedAtRef.current = Date.now();
        return content;
      })
      .finally(() => {
        inFlightRequestRef.current = null;
      });

    inFlightRequestRef.current = request;
    return request;
  };

  return (
    <ThemeProvider initialTheme={theme}>
      <Navbar doctor={doctor} />
      <HeroSection doctor={doctor} />
      <AboutSection doctor={doctor} />
      <SpecialtiesSection specialties={specialties} />
      <ExperienceSection experiences={experiences} />
      <PublicationsSection publications={publications} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection doctor={doctor} />
      <Footer doctor={doctor} />
    </ThemeProvider>
  );
}
