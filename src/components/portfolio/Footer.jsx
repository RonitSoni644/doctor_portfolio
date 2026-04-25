import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Footer({ doctor }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className="bg-[#1A2421] text-[#E8F0ED] py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-3">
              Dr. {doctor?.name || "Portfolio"}
            </h3>
            <p className="text-[#7A9E96] text-sm leading-relaxed">
              {doctor?.specialty || "Medical Specialist"}
            </p>
            <p className="text-[#7A9E96] text-sm mt-2 leading-relaxed">
              {doctor?.title || "MD, FRCS — Senior Consultant"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase mb-4 text-[#005F54]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[#7A9E96]">
              {[
                "#about",
                "#specialties",
                "#experience",
                "#publications",
                "#testimonials",
                "#contact",
              ].map((href) => (
                <li key={href}>
                  <a
                    href={href}
                    className="hover:text-white transition-colors capitalize"
                  >
                    {href.replace("#", "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase mb-4 text-[#005F54]">
              Contact
            </h4>
            <div className="space-y-2 text-sm text-red">
              {doctor?.email && <p>📧 {doctor.email}</p>}
              {doctor?.phone && <p>📞 {doctor.phone}</p>}
              {doctor?.location && <p>📍 {doctor.location}</p>}
            </div>
          </div>
        </div>
        <div className="border-t border-[#2A3A36] pt-6 flex flex-wrap justify-between items-center gap-4">
          <p className="text-xs text-[#4A6B63]">
            © {new Date().getFullYear()} Dr. {doctor?.name || "Portfolio"}. All
            rights reserved.
          </p>
          <p className="text-xs text-[#4A6B63]">
            Built with care for patient trust
          </p>
        </div>
      </div>
    </footer>
  );
}
