import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarPlus,
  Wallet,
  ShieldCheck,
  Clock,
  ArrowRight,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  Users,
  UserCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore } from '@/stores/bookingStore';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { COURT_IMAGES, APP_CONFIG } from '@/utils/constants';
import {
  formatCurrency,
  todayISO,
  formatDateLong,
  toISODate,
  addDays,
} from '@/utils/format';
import type { TimeSlot, Court, OpenPlaySession } from '@/types';

const COURT_ACCENTS = [
  { header: 'text-[#115259]', dot: 'bg-[#115259]', border: 'border-[#115259]/30', bg: 'bg-[#F0F6F5]', text: 'text-[#115259]', hoverBorder: 'hover:border-[#115259]', hoverBg: 'hover:bg-[#E2EEEB]' },
  { header: 'text-[#48736B]', dot: 'bg-[#48736B]', border: 'border-[#688D87]/35', bg: 'bg-[#F2F7F5]', text: 'text-[#2D534B]', hoverBorder: 'hover:border-[#48736B]', hoverBg: 'hover:bg-[#E4EFEA]' },
  { header: 'text-[#1D635B]', dot: 'bg-[#2E7A70]', border: 'border-[#8ABBAF]/40', bg: 'bg-[#F0F8F6]', text: 'text-[#1D635B]', hoverBorder: 'hover:border-[#2E7A70]', hoverBg: 'hover:bg-[#DCEDE8]' },
  { header: 'text-[#0E4348]', dot: 'bg-[#0E4348]', border: 'border-[#0E4348]/30', bg: 'bg-[#EEF5F5]', text: 'text-[#0E4348]', hoverBorder: 'hover:border-[#0E4348]', hoverBg: 'hover:bg-[#DCECEC]' },
];

function getCourtAccent(index: number) {
  return COURT_ACCENTS[index % COURT_ACCENTS.length];
}

type CourtAccent = ReturnType<typeof getCourtAccent>;

function formatTimeShort(time: string): string {
  if (!time) return '';
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return minute === 0 ? `${hour12}${ampm}` : `${hour12}:${String(minute).padStart(2, '0')}${ampm}`;
}

function formatTimeRangeShort(start: string, end: string): string {
  return `${formatTimeShort(start)}-${formatTimeShort(end)}`;
}

function isWithinHours(session: OpenPlaySession, hours: number): boolean {
  try {
    const sessionStart = new Date(`${session.date}T${session.start_time}`);
    const now = new Date();
    const diffHours = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= -1 && diffHours <= hours;
  } catch {
    return false;
  }
}

function isWithinNextWeek(session: OpenPlaySession): boolean {
  try {
    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return sessionDate >= today && sessionDate <= weekFromNow;
  } catch {
    return false;
  }
}

const SKILL_BADGE: Record<string, string> = {
  Beginner: 'bg-[#DDEFE6] text-[#115259] border border-[#B6DAC8]',
  Intermediate: 'bg-amber-50 text-amber-800 border border-amber-200',
  Advanced: 'bg-[#115259]/10 text-[#115259] border border-[#115259]/20',
  'All Levels': 'bg-[#EEF6F4] text-[#2D534B] border border-[#688D87]/20',
};

export function Landing() {
  const navigate = useNavigate();
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const {
    courts,
    selectedDate,
    slots,
    selectedSlotIds,
    loadingCourts,
    loadingSlots,
    error,
    loadCourts,
    setDate,
    toggleSlot,
    loadAllCourtsSlots,
  } = useBookingStore();

  const {
    sessions: openPlaySessions,
    loadingSessions: loadingOpenPlay,
    loadUpcomingSessions,
  } = useOpenPlayStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
    loadUpcomingSessions();
  }, [courts.length, loadCourts, loadUpcomingSessions]);

  useEffect(() => {
    if (courts.length > 0) {
      loadAllCourtsSlots();
    }
  }, [selectedDate, courts.length, loadAllCourtsSlots]);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSession = openPlaySessions
    .filter(
      (s) =>
        s.is_active &&
        s.status !== 'cancelled' &&
        s.status !== 'past' &&
        isWithinHours(s, 48)
    )
    .sort((a, b) => {
      const aStart = new Date(`${a.date}T${a.start_time}`).getTime();
      const bStart = new Date(`${b.date}T${b.start_time}`).getTime();
      return aStart - bStart;
    })[0];

  const weekSessions = openPlaySessions
    .filter(
      (s) =>
        s.is_active &&
        s.status !== 'cancelled' &&
        s.status !== 'past' &&
        isWithinNextWeek(s)
    )
    .sort((a, b) => {
      const aStart = new Date(`${a.date}T${a.start_time}`).getTime();
      const bStart = new Date(`${b.date}T${b.start_time}`).getTime();
      return aStart - bStart;
    })
    .slice(0, 6);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getOpenPlaySessionForSlot = (
    courtId: string,
    startTime: string,
    endTime: string
  ): OpenPlaySession | undefined => {
    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);

    return openPlaySessions.find((session) => {
      const sessionCourts =
        session.courts && session.courts.length > 0
          ? session.courts.map((c) => c.id)
          : [session.court_id];

      return (
        sessionCourts.includes(courtId) &&
        session.date === selectedDate &&
        session.is_active === true &&
        timeToMinutes(session.start_time) <= slotStart &&
        timeToMinutes(session.end_time) >= slotEnd
      );
    });
  };

  const handleOpenPlayClick = (session: OpenPlaySession) => {
    navigate('/open-play', { state: { selectedSessionId: session.id } });
  };

  const getTimeIntervalsByPeriod = (slotsList: TimeSlot[]) => {
    const morningMap = new Map<string, { start_time: string; end_time: string }>();
    const afternoonMap = new Map<string, { start_time: string; end_time: string }>();
    const eveningMap = new Map<string, { start_time: string; end_time: string }>();

    slotsList.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(':')[0], 10);
      const key = `${slot.start_time}-${slot.end_time}`;
      const timeObj = { start_time: slot.start_time, end_time: slot.end_time };

      if (hour < 12) {
        morningMap.set(key, timeObj);
      } else if (hour < 17) {
        afternoonMap.set(key, timeObj);
      } else {
        eveningMap.set(key, timeObj);
      }
    });

    const sortFn = (a: { start_time: string }, b: { start_time: string }) =>
      a.start_time.localeCompare(b.start_time);

    return {
      morningTimes: Array.from(morningMap.values()).sort(sortFn),
      afternoonTimes: Array.from(afternoonMap.values()).sort(sortFn),
      eveningTimes: Array.from(eveningMap.values()).sort(sortFn),
    };
  };

  const { morningTimes, afternoonTimes, eveningTimes } = getTimeIntervalsByPeriod(slots);

  const totalSelected = slots
    .filter((s) => selectedSlotIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const getSlotForCourtAndTime = (courtId: string, startTime: string, endTime: string) => {
    return slots.find(
      (s) =>
        s.court_id === courtId &&
        s.start_time === startTime &&
        s.end_time === endTime
    );
  };

  const isSingleCourt = courts.length === 1;

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#162422]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-start pt-28 sm:min-h-screen sm:items-center sm:pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/paddle-hero.jpg"
            alt="Paddle Place Court"
            className="h-full w-full object-cover object-[75%_center] md:object-right"
          />
          {/* Subtle gradient: Softly darkens the left side for crisp text readability while leaving the illuminated court vivid */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#061A1C]/90 via-[#092629]/65 to-transparent" />
          {/* Top/bottom smooth blend into navigation bar and booking section */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#092629]/70 via-transparent to-[#F8FAF9]" />
        </div>

        <div className="container-page relative z-10 py-8 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {nextSession && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                onClick={() => navigate('/open-play')}
                className="mb-4 flex w-full items-center gap-2 rounded-full border border-[#B6DAC8]/40 bg-[#115259]/50 px-3 py-1.5 backdrop-blur-md transition hover:bg-[#115259]/70 sm:mb-5 sm:w-auto sm:px-4"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B6DAC8] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B6DAC8]"></span>
                </span>
                <Users className="h-4 w-4 shrink-0 text-[#B6DAC8]" />
                <span className="truncate text-xs font-semibold text-white sm:text-sm">
                  Open Play{' '}
                  {nextSession.status === 'active'
                    ? 'happening now'
                    : nextSession.date === todayISO()
                      ? 'today'
                      : 'soon'}{' '}
                  · {nextSession.current_players}/{nextSession.max_players} joined
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#B6DAC8]" />
              </motion.button>
            )}

            <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#B6DAC8]">
              Pickleball & Table Tennis
            </span>

            <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-sm">
              Paddle Place
            </h1>

            <p className="mt-3 text-lg font-medium text-white/85 sm:mt-4 sm:text-2xl drop-shadow-sm">
              {APP_CONFIG.tagline}
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-base">
              Book premium indoor and outdoor pickleball courts in seconds. Pay easily with GCash,
              track your reservations, and join open sessions.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Button
                size="lg"
                onClick={scrollToBooking}
                className="bg-[#B6DAC8] text-[#0E4348] font-bold hover:bg-white shadow-lg"
                leftIcon={<CalendarPlus className="h-5 w-5" />}
              >
                Book a Court
              </Button>
              <Button
                size="lg"
                variant="secondary"
                to="/track"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                leftIcon={<CalendarDays className="h-5 w-5" />}
              >
                Track My Booking
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-white/70 sm:mt-10 sm:gap-6 sm:text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#B6DAC8]" />
                <span>Purok Mangga 2 Soong, Tago, Surigao Del Sur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#B6DAC8]" />
                <span>Open 5AM - 12AM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Play Section */}
      {weekSessions.length > 0 && (
        <section className="relative border-b border-[#688D87]/20 bg-white py-10 sm:py-14">
          <div className="container-page">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
              <div>
                <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#EBF4F1] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#115259]">
                  <Users className="h-3.5 w-3.5" />
                  Open Play
                </span>
                <h2 className="font-display text-xl font-extrabold tracking-tight text-[#162422] sm:text-2xl md:text-3xl">
                  Join a Session This Week
                </h2>
                <p className="text-xs text-[#526E69] sm:text-sm">
                  Meet other players and split the court — spots fill fast
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/open-play')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="border-[#688D87]/30 text-[#115259] hover:bg-[#F2F8F6]"
              >
                See all
              </Button>
            </div>

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
              {weekSessions.map((session, i) => {
                const isFull =
                  session.status === 'full' ||
                  session.current_players >= session.max_players;
                const spotsLeft = Math.max(0, session.max_players - session.current_players);
                const isToday = session.date === todayISO();
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="w-[280px] shrink-0 sm:w-auto"
                  >
                    <div className="card flex h-full flex-col rounded-2xl border border-[#688D87]/20 bg-white p-4 shadow-sm hover:shadow-md transition">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-md bg-[#EEF6F4] px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-[#115259]">
                          {isToday
                            ? 'TODAY'
                            : formatDateLong(session.date).split(',')[0].toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            SKILL_BADGE[session.skill_level] ?? SKILL_BADGE['All Levels']
                          }`}
                        >
                          {session.skill_level}
                        </span>
                      </div>

                      <h3 className="truncate font-display text-base font-bold text-[#162422]">
                        {session.title || session.host_name || session.court_name}
                      </h3>

                      <div className="mt-2 space-y-1.5 text-xs text-[#526E69]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[#115259]" />
                          <span>{formatTimeRangeShort(session.start_time, session.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-[#115259]" />
                          <span>
                            {session.current_players}/{session.max_players} · {spotsLeft}{' '}
                            spot{spotsLeft === 1 ? '' : 's'} left
                          </span>
                        </div>
                        {session.host_name && (
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="h-3.5 w-3.5 text-[#115259]" />
                            <span className="truncate">Hosted by {session.host_name}</span>
                          </div>
                        )}
                        {session.courts && session.courts.length > 1 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {session.courts.map((c) => (
                              <span
                                key={c.id}
                                className="rounded bg-[#F0F6F5] border border-[#688D87]/25 px-1.5 py-0.5 text-[10px] font-medium text-[#48736B]"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#688D87]/15 pt-3">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#526E69]">Per player</p>
                          <p className="font-display text-base font-extrabold text-[#115259] sm:text-lg">
                            {formatCurrency(session.price_per_player)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleOpenPlayClick(session)}
                          className={isFull ? 'bg-gray-100 text-gray-400' : 'bg-[#115259] text-white hover:bg-[#0E4348]'}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          {isFull ? 'Full' : 'Join'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Booking Section */}
      <div ref={bookingSectionRef}>
        <section className="relative z-20 border-y border-[#688D87]/20 bg-[#F8FAF9] py-8 md:py-16">
          <div className="container-page max-w-7xl">
            <div className="overflow-hidden rounded-2xl border border-[#688D87]/25 bg-white shadow-xl md:rounded-3xl">

              {/* Header Banner */}
              <div className="border-b border-[#688D87]/20 bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-7">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-extrabold tracking-tight text-[#162422] sm:text-2xl md:text-3xl">
                      Book a Court
                    </h2>
                    <p className="text-xs text-[#526E69] sm:text-sm">
                      Pick a date, then tap any available time slots
                    </p>
                  </div>
                  <div className="hidden rounded-xl border border-[#688D87]/20 bg-[#F0F6F5] p-2.5 text-[#115259] sm:block md:p-3">
                    <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>
              </div>

              <div className="p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8">
                {/* STEP 1: Date Selection */}
                <div className="mb-6 md:mb-10">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#115259] text-xs font-bold text-white shadow-sm">
                      1
                    </div>
                    <h3 className="font-display text-sm font-bold text-[#162422] sm:text-base">Choose Date</h3>
                  </div>

                  <div className="relative -mx-4 overflow-hidden px-4 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                        disabled={weekOffset === 0}
                        className="hidden h-14 w-10 shrink-0 items-center justify-center rounded-xl border border-[#688D87]/25 bg-[#F8FAF9] text-[#526E69] transition hover:border-[#115259]/40 hover:text-[#115259] disabled:opacity-30 sm:flex"
                        aria-label="Previous week"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="flex flex-1 gap-2 overflow-x-auto pb-1.5 pt-2.5 sm:grid sm:grid-cols-7 sm:overflow-visible sm:py-0 no-scrollbar snap-x">
                        {weekDays.map((day) => {
                          const iso = toISODate(day);
                          const isSelected = selectedDate === iso;
                          const isToday = iso === todayISO();
                          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                          const dayNumber = day.getDate();
                          const monthName = day.toLocaleDateString('en-US', { month: 'short' });
                          const hasOpenPlay = openPlaySessions.some(
                            (s) => s.date === iso && s.is_active && s.status !== 'cancelled'
                          );

                          return (
                            <button
                              key={iso}
                              onClick={() => setDate(iso)}
                              className={`relative flex min-w-[54px] flex-1 snap-center flex-col items-center justify-center rounded-xl border py-2 transition-all ${
                                isSelected
                                  ? 'border-[#115259] bg-[#115259] text-white font-bold shadow-md shadow-[#115259]/20'
                                  : 'border-[#688D87]/25 bg-[#F8FAF9] text-[#526E69] hover:border-[#115259]/40 hover:text-[#162422]'
                              }`}
                            >
                              {isToday && (
                                <span
                                  className={`absolute -top-2 rounded-full px-1.5 py-[1px] text-[8px] font-black tracking-wider ${
                                    isSelected ? 'bg-[#B6DAC8] text-[#0E4348]' : 'bg-[#115259] text-white'
                                  }`}
                                >
                                  TODAY
                                </span>
                              )}

                              <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-white/90' : 'text-[#526E69]'}`}>
                                {dayName}
                              </span>

                              <span className={`text-base font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-[#162422]'}`}>
                                {dayNumber}
                              </span>

                              <span className={`text-[9px] uppercase font-medium ${isSelected ? 'text-white/80' : 'text-[#526E69]/80'}`}>
                                {monthName}
                              </span>

                              {hasOpenPlay && (
                                <span
                                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                    isSelected ? 'bg-[#B6DAC8]' : 'bg-[#115259]'
                                  }`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setWeekOffset((w) => w + 1)}
                        className="hidden h-14 w-10 shrink-0 items-center justify-center rounded-xl border border-[#688D87]/25 bg-[#F8FAF9] text-[#526E69] transition hover:border-[#115259]/40 hover:text-[#115259] sm:flex"
                        aria-label="Next week"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Choose Court and Time */}
                <div>
                  <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#115259] text-xs font-bold text-white shadow-sm">
                        2
                      </div>
                      <h3 className="font-display text-sm font-bold text-[#162422] sm:text-base">
                        {isSingleCourt ? 'Select Time Slots' : 'Choose Court & Time'}
                      </h3>
                    </div>

                    <span className="rounded-full border border-[#115259]/20 bg-[#F0F6F5] px-3 py-1 text-xs font-semibold text-[#115259]">
                      <span className="sm:hidden">
                        {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="hidden sm:inline">{formatDateLong(selectedDate)}</span>
                    </span>
                  </div>

                  {/* Dot Legend */}
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[#688D87]/20 pb-3 text-[11px] text-[#526E69]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full border border-[#688D87]/30 bg-[#F0F6F5]" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#B6DAC8]" />
                      <span>Open Play</span>
                    </div>
                  </div>

                  {loadingSlots || loadingCourts || loadingOpenPlay ? (
                    <LoadingSpinner className="py-12 md:py-20" />
                  ) : error ? (
                    <div className="py-8 text-center font-medium text-red-600 md:py-16">{error}</div>
                  ) : courts.length === 0 ? (
                    <div className="py-8 text-center text-sm font-medium text-[#526E69] md:py-16">
                      No courts found.
                    </div>
                  ) : (
                    /* Adaptive wrapper: centered card for 1 court, scrollable grid for multiple */
                    <div className="block">
                      <div className="max-h-[75vh] overflow-y-auto overflow-x-auto rounded-2xl border border-[#688D87]/20 bg-[#F8FAF9]/80">
                        <div
                          className={`w-full p-4 ${
                            isSingleCourt
                              ? 'max-w-md mx-auto'
                              : courts.length > 3
                                ? 'min-w-[620px]'
                                : ''
                          }`}
                        >
                          {/* Sticky Court Column Header */}
                          <div
                            className="sticky -top-4 z-30 -mx-4 -mt-4 mb-4 border-b border-[#688D87]/20 bg-white px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-[#115259] shadow-sm backdrop-blur-md"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isSingleCourt
                                ? '1fr'
                                : `repeat(${courts.length}, minmax(110px, 1fr))`,
                              gap: '0.75rem',
                            }}
                          >
                            {courts.map((court, idx) => {
                              const accent = getCourtAccent(idx);
                              return (
                                <div
                                  key={court.id}
                                  className={`flex items-center justify-center gap-2 truncate ${accent.header}`}
                                >
                                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`} />
                                  <span className="truncate font-display font-extrabold tracking-wide">{court.name}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Period Sections */}
                          <div className="space-y-6">
                            {morningTimes.length > 0 && (
                              <DesktopPeriodSection
                                title="MORNING"
                                icon={<CloudSun className="h-4 w-4 text-[#115259]" />}
                                courts={courts}
                                isSingleCourt={isSingleCourt}
                                timeIntervals={morningTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                                getOpenPlaySession={getOpenPlaySessionForSlot}
                                onOpenPlayClick={handleOpenPlayClick}
                              />
                            )}
                            {afternoonTimes.length > 0 && (
                              <DesktopPeriodSection
                                title="AFTERNOON"
                                icon={<Sun className="h-4 w-4 text-[#115259]" />}
                                courts={courts}
                                isSingleCourt={isSingleCourt}
                                timeIntervals={afternoonTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                                getOpenPlaySession={getOpenPlaySessionForSlot}
                                onOpenPlayClick={handleOpenPlayClick}
                              />
                            )}
                            {eveningTimes.length > 0 && (
                              <DesktopPeriodSection
                                title="EVENING"
                                icon={<Moon className="h-4 w-4 text-[#115259]" />}
                                courts={courts}
                                isSingleCourt={isSingleCourt}
                                timeIntervals={eveningTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                                getOpenPlaySession={getOpenPlaySessionForSlot}
                                onOpenPlayClick={handleOpenPlayClick}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop reservation bar */}
                  <div className="mt-8 hidden items-center justify-between gap-4 rounded-xl border border-[#688D87]/20 bg-[#F8FAF9] p-5 sm:flex">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#526E69]">
                        Selected Slots
                      </span>
                      <div className="text-lg font-bold text-[#162422]">
                        {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} chosen
                        {selectedSlotIds.length > 0 && (
                          <span className="ml-2 text-base font-extrabold text-[#115259]">
                            ({formatCurrency(totalSelected)})
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="md"
                      onClick={() => navigate('/booking')}
                      disabled={selectedSlotIds.length === 0}
                      className="bg-[#115259] text-white hover:bg-[#0E4348]"
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      Proceed to Reservation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Mobile Reservation Bar */}
      {selectedSlotIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#688D87]/20 bg-white/95 p-3.5 backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#526E69]">
                {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} chosen
              </p>
              <p className="text-lg font-bold text-[#115259]">{formatCurrency(totalSelected)}</p>
            </div>
            <Button
              size="md"
              onClick={() => navigate('/booking')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shrink-0 bg-[#115259] text-white hover:bg-[#0E4348]"
            >
              Proceed
            </Button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="border-b border-[#688D87]/20 bg-[#F4F8F6] py-14 sm:py-20">
        <div className="container-page">
          <div className="mb-10 text-center sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#115259]">
              Why Paddle Place
            </span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#162422] sm:text-3xl mt-1">
              Built for Players
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[
              {
                icon: CalendarPlus,
                title: 'Instant Booking',
                desc: 'Select your preferred time slots in under a minute. No phone calls, no waiting.',
              },
              {
                icon: Wallet,
                title: 'GCash Payment',
                desc: 'Pay securely with GCash. Upload your receipt and get confirmed quickly.',
              },
              {
                icon: ShieldCheck,
                title: 'Admin Verified',
                desc: 'Every booking is reviewed and confirmed by our team so your court is always guaranteed.',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-[#688D87]/20 bg-white p-5 shadow-sm sm:p-6 hover:shadow-md transition"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F2EE] text-[#115259]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-display text-base font-bold text-[#162422] sm:text-lg">{feat.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#526E69] sm:text-sm">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-page">
          <div className="mb-10 text-center sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#115259]">
              Simple Process
            </span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#162422] sm:text-3xl mt-1">
              How It Works
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-4">
            {[
              { step: '01', title: 'Select Date & Time', desc: 'Pick your preferred date and choose available time slots.' },
              { step: '02', title: 'Enter Details', desc: 'Fill in your name, contact info, and player details.' },
              { step: '03', title: 'Pay via GCash', desc: 'Send payment to our GCash number and upload your receipt screenshot.' },
              { step: '04', title: 'Get Confirmed', desc: 'We verify your booking and keep your court ready for play.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="mb-3 font-display text-4xl font-extrabold tracking-tight text-[#115259]/30 sm:mb-4 sm:text-5xl">
                  {item.step}
                </div>

                <h3 className="font-display text-base font-bold text-[#162422] sm:text-lg">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#526E69] sm:text-sm">{item.desc}</p>

                {i < 3 && (
                  <div className="mt-6 hidden h-px bg-gradient-to-r from-[#115259]/25 via-[#115259]/10 to-transparent md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-20 sm:hidden" />
      <Footer />
    </div>
  );
}

// --------------------------------------------------------
// SUB-COMPONENTS
// --------------------------------------------------------

function DesktopPeriodSection({
  title,
  icon,
  courts,
  isSingleCourt,
  timeIntervals,
  getSlotForCourtAndTime,
  selectedSlotIds,
  onToggleSlot,
  getOpenPlaySession,
  onOpenPlayClick,
}: {
  title: string;
  icon: React.ReactNode;
  courts: Court[];
  isSingleCourt: boolean;
  timeIntervals: { start_time: string; end_time: string }[];
  getSlotForCourtAndTime: (courtId: string, startTime: string, endTime: string) => TimeSlot | undefined;
  selectedSlotIds: string[];
  onToggleSlot: (slotId: string) => void;
  getOpenPlaySession?: (courtId: string, startTime: string, endTime: string) => OpenPlaySession | undefined;
  onOpenPlayClick?: (session: OpenPlaySession) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[#115259]">
          {title}
        </span>
        <div className="h-px flex-1 bg-[#688D87]/20" />
      </div>

      <div className="space-y-2.5">
        {timeIntervals.map((interval) => (
          <div
            key={`${interval.start_time}-${interval.end_time}`}
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: isSingleCourt
                ? '1fr'
                : `repeat(${courts.length}, minmax(110px, 1fr))`,
            }}
          >
            {courts.map((court, idx) => {
              const slot = getSlotForCourtAndTime(court.id, interval.start_time, interval.end_time);
              const accent = getCourtAccent(idx);
              const openPlaySession = getOpenPlaySession?.(court.id, interval.start_time, interval.end_time);

              if (!slot) {
                return (
                  <div
                    key={`${court.id}-${interval.start_time}`}
                    className="flex h-11 select-none items-center justify-center rounded-xl border border-[#688D87]/15 bg-[#F8FAF9] text-xs text-[#526E69]/40"
                  >
                    —
                  </div>
                );
              }

              if (openPlaySession) {
                return (
                  <div key={slot.id}>
                    <OpenPlayPill
                      session={openPlaySession}
                      onClick={() => onOpenPlayClick?.(openPlaySession)}
                      accent={accent}
                    />
                  </div>
                );
              }

              return (
                <div key={slot.id}>
                  <SlotPill
                    slot={slot}
                    isSelected={selectedSlotIds.includes(slot.id)}
                    onToggle={() => onToggleSlot(slot.id)}
                    accent={accent}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenPlayPill({
  session,
  onClick,
  accent: _accent,
}: {
  session: OpenPlaySession;
  onClick: () => void;
  accent: CourtAccent;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-11 w-full items-center justify-between rounded-xl border border-[#B6DAC8] bg-[#E8F5EE] px-3 font-bold transition-all hover:bg-[#D7ECE1] hover:border-[#115259]/50 shadow-sm"
      title={`Open Play: ${session.current_players}/${session.max_players} players · ${session.skill_level}`}
    >
      <span className="text-xs font-black text-[#115259]">OP</span>
      <span className="text-xs font-bold text-[#162422]">
        {session.current_players}/{session.max_players}
      </span>

      <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#688D87]/20 bg-white px-3 py-2 text-xs text-[#162422] shadow-xl group-hover:block pointer-events-none">
        <p className="font-bold text-[#115259]">Open Play Session</p>
        <p className="text-[11px] text-[#526E69]">
          {session.current_players}/{session.max_players} players · {session.skill_level}
        </p>
        {session.host_name && (
          <p className="text-[11px] text-[#526E69]">Host: {session.host_name}</p>
        )}
        <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-[#688D87]/20 bg-white" />
      </div>
    </button>
  );
}

function SlotPill({
  slot,
  isSelected,
  onToggle,
  accent,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: () => void;
  accent: CourtAccent;
}) {
  const isAvailable = slot.is_available;
  const isPending = (slot as unknown as { is_pending?: boolean }).is_pending;

  let styleClasses = `${accent.border} ${accent.bg} ${accent.text} ${accent.hoverBorder} ${accent.hoverBg} cursor-pointer`;

  if (!isAvailable) {
    styleClasses = 'border-red-200 bg-red-50 text-red-400 line-through cursor-not-allowed';
  } else if (isPending) {
    styleClasses = 'border-amber-200 bg-amber-50 text-amber-600 cursor-not-allowed';
  } else if (isSelected) {
    styleClasses = 'border-[#115259] bg-[#115259] text-white font-bold shadow-md shadow-[#115259]/20';
  }

  return (
    <button
      onClick={isAvailable && !isPending ? onToggle : undefined}
      disabled={!isAvailable || isPending}
      className={`flex h-11 w-full items-center justify-center rounded-xl border text-[11px] font-semibold tracking-tight transition-all px-1 ${styleClasses}`}
    >
      <span className="truncate">
        {formatTimeRangeShort(slot.start_time, slot.end_time)}
      </span>
    </button>
  );
}