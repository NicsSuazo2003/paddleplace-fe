import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CalendarPlus, Search, Shield, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/utils/constants';
import { useClientStore } from '@/stores/clientStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const settings = useClientStore((state) => state.settings);
  const loadSettings = useClientStore((state) => state.loadSettings);
  const displayNumber = settings?.gcash_number || APP_CONFIG.gcashNumber;

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Open Play', path: '/open-play' },
    { label: 'Book a Court', path: '/booking' },
    { label: 'Track Booking', path: '/track' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A2629]/95 backdrop-blur-md shadow-md border-b border-[#688D87]/20'
          : 'bg-[#0C3236]/75 backdrop-blur-sm'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between md:h-20">
        {/* Brand Wordmark (Replaced Image Logo) */}
        <Link to="/" aria-label="Paddle Place Home" className="flex flex-col leading-none transition hover:opacity-90">
          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-white">
            Paddle <span className="text-[#B6DAC8]">Place</span>
          </span>
          <span className="font-sans text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#B6DAC8]/80 mt-1">
            Pickleball & Table Tennis
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive(link.path)
                  ? 'text-[#B6DAC8] bg-white/10 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons & Phone */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={`tel:${displayNumber.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 text-xs tracking-wide text-white/75 hover:text-[#B6DAC8] transition"
          >
            <Phone className="h-3.5 w-3.5 text-[#B6DAC8]" />
            <span className="font-medium">{displayNumber}</span>
          </a>
          <Button
            size="sm"
            to="/booking"
            className="bg-[#B6DAC8] text-[#0C3236] font-extrabold hover:bg-white transition-colors"
            leftIcon={<CalendarPlus className="h-4 w-4" />}
          >
            Book Now
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="rounded-lg p-2 text-white/90 hover:bg-white/10 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#688D87]/20 bg-[#0C3236] md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(link.path)
                      ? 'text-[#B6DAC8] bg-white/10'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <a
                href={`tel:${displayNumber.replace(/\s/g, '')}`}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/5 hover:text-[#B6DAC8] transition"
              >
                <Phone className="h-4 w-4 text-[#B6DAC8]" />
                Call {displayNumber}
              </a>

              <div className="mt-3 flex flex-col gap-2.5 pt-2 border-t border-white/10">
                <Button
                  size="md"
                  fullWidth
                  className="bg-[#B6DAC8] text-[#0C3236] font-bold hover:bg-white"
                  leftIcon={<CalendarPlus className="h-4 w-4" />}
                  onClick={() => navigate('/booking')}
                >
                  Book Now
                </Button>
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <Shield className="h-4 w-4 text-[#B6DAC8]" />
                  Admin Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SearchIcon() {
  return <Search className="h-4 w-4" />;
}