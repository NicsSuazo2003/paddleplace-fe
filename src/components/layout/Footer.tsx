import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { APP_CONFIG } from '@/utils/constants';
import { useClientStore } from '@/stores/clientStore';

export function Footer() {
  const settings = useClientStore((state) => state.settings);
  const displayNumber = settings?.gcash_number || APP_CONFIG.gcashNumber;

  return (
    <footer className="border-t border-[#688D87]/20 bg-[#0A2629] text-white">
      <div className="container-page py-10 sm:py-14">
        {/* Brand & Social Links */}
        <div className="mb-8 sm:mb-10">
          <Logo size="md" to="" />
          <p className="mt-3 max-w-sm text-xs sm:text-sm leading-relaxed text-white/65">
            {APP_CONFIG.tagline}
          </p>
          <div className="mt-4 flex gap-2.5">
            <a
              href="#"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-[#B6DAC8] hover:text-[#B6DAC8] hover:bg-white/10"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-[#B6DAC8] hover:text-[#B6DAC8] hover:bg-white/10"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-7 sm:gap-8 md:grid-cols-3">
          {/* Quick Links */}
          <div>
            <h4 className="mb-3 font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-[#B6DAC8] sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
              <li>
                <Link to="/" className="text-white/70 transition hover:text-[#B6DAC8]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-white/70 transition hover:text-[#B6DAC8]">
                  Book a Court
                </Link>
              </li>
              <li>
                <Link to="/open-play" className="text-white/70 transition hover:text-[#B6DAC8]">
                  Open Play
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-white/70 transition hover:text-[#B6DAC8]">
                  Track Booking
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-white/70 transition hover:text-[#B6DAC8]">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="mb-3 font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-[#B6DAC8] sm:mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70 sm:space-y-3 sm:text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#B6DAC8] mt-0.5" />
                <span>{displayNumber}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#B6DAC8] mt-0.5" />
                <span className="leading-relaxed">San Agustin Sur "Dawis", Tandag City, Surigao del Sur</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours & Staff Portal */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-3 font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-[#B6DAC8] sm:mb-4">
              Hours
            </h4>
            <ul className="space-y-2 text-xs text-white/70 sm:space-y-2.5 sm:text-sm">
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-[#B6DAC8]" />
                <span>Mon – Sun · 5:00 AM – 12:00 AM</span>
              </li>
            </ul>
            <Link
              to="/admin"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:border-[#B6DAC8] hover:text-[#B6DAC8] hover:bg-white/10"
            >
              <Shield className="h-3.5 w-3.5 text-[#B6DAC8]" />
              Staff Login
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2.5 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p>
            <span className="font-semibold text-[#B6DAC8]">Est. {APP_CONFIG.established}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}