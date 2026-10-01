// src/pages/OpenPlay.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  Clock,
  CalendarDays,
  UserCircle2,
  ArrowRight,
  Eye,
  Bell,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { useBookingStore } from '@/stores/bookingStore';
import { formatDateLong, formatTimeRange, formatCurrency } from '@/utils/format';
import type { OpenPlaySession, CustomerDetails } from '@/types';
import { openPlayService } from '@/services/openPlayService';
import type { PublicOpenPlayPlayer } from '@/services/openPlayService';

const SKILL_BADGE: Record<string, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  Advanced: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  'All Levels': 'bg-brand-blue-500/20 text-brand-blue-200 border border-brand-blue-400/40',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-forest-800 text-cream-muted border border-forest-600' },
  active: { label: 'Active Now', className: 'bg-accentGreen-500/20 text-accentGreen-300 border border-accentGreen-400/40' },
  full: { label: 'Full', className: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  past: { label: 'Past', className: 'bg-forest-900/60 text-cream-muted/50 border border-forest-800' },
  cancelled: { label: 'Cancelled', className: 'bg-forest-900/60 text-cream-muted/50 border border-forest-800' },
};

// ✅ O2 — Reuse the same PH phone normalization + validation as Booking.tsx
const normalizePhone = (value: string) =>
  value.replace(/[\s\-()]/g, '').replace(/^\+?63/, '0');

const joinSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is required')
    .max(80, 'Name is too long')
    .regex(/^[A-Za-zÀ-ÿ.'\-\s]+$/, "Name can only contain letters, spaces, and . ' -"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(120, 'Email is too long'),
  phone: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .transform(normalizePhone)
    .refine((v) => /^09\d{9}$/.test(v), {
      message: 'Enter a valid PH mobile number (e.g. 0917 123 4567)',
    }),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

type JoinForm = z.infer<typeof joinSchema>;

/** O9 — Imminence label for sessions starting soon */
function getImminenceLabel(session: OpenPlaySession): string | null {
  try {
    const sessionStart = new Date(`${session.date}T${session.start_time}`);
    const now = new Date();
    const diffMin = Math.round((sessionStart.getTime() - now.getTime()) / (1000 * 60));
    if (diffMin <= -60) return null;
    if (diffMin <= 0) return 'Happening now';
    if (diffMin <= 120) {
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      if (h === 0) return `Starts in ${m}m`;
      return `Starts in ${h}h${m > 0 ? ` ${m}m` : ''}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function OpenPlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessions, loadingSessions, error, loadUpcomingSessions } = useOpenPlayStore();

  // ── Join modal state ─────────────────────────────────────
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<OpenPlaySession | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  // ✅ O14 — preserve details across reopen (in-memory only)
  const [preservedDetails, setPreservedDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // ── Details modal state ──────────────────────────────────
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSession, setDetailsSession] = useState<OpenPlaySession | null>(null);
  const [detailsPlayers, setDetailsPlayers] = useState<PublicOpenPlayPlayer[]>([]);
  const [loadingDetailsPlayers, setLoadingDetailsPlayers] = useState(false);
  const [rosterUnavailable, setRosterUnavailable] = useState(false);

  // ✅ O8 — Guard auto-open so it fires once per session id
  const autoOpenedRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: preservedDetails,
  });

  const formValues = watch();

  useEffect(() => {
    loadUpcomingSessions();
  }, []);

  // Auto-open details modal if session ID is passed via state
  useEffect(() => {
    const state = location.state as { selectedSessionId?: string } | null;
    const sessionId = state?.selectedSessionId;
    if (!sessionId) return;
    if (autoOpenedRef.current === sessionId) return;
    if (sessions.length === 0) return;

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    if (
      session.status === 'full' ||
      session.status === 'past' ||
      session.status === 'cancelled'
    ) {
      return;
    }
    autoOpenedRef.current = sessionId;
    handleViewDetails(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, location.state]);

  // ── Details handlers ─────────────────────────────────────
  const handleViewDetails = async (session: OpenPlaySession) => {
    setDetailsSession(session);
    setShowDetailsModal(true);
    setRosterUnavailable(false);
    setDetailsPlayers([]);
    setLoadingDetailsPlayers(true);

    try {
      const players = await openPlayService.getSessionPlayers(session.id);
      setDetailsPlayers(players);
    } catch (err) {
      console.warn('Roster unavailable:', err);
      setRosterUnavailable(true);
    } finally {
      setLoadingDetailsPlayers(false);
    }
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setDetailsSession(null);
    setDetailsPlayers([]);
    setRosterUnavailable(false);
    autoOpenedRef.current = null;
    navigate('/open-play', { replace: true, state: {} });
  };

  // ── Join handlers ────────────────────────────────────────
  const handleJoinClick = (session: OpenPlaySession) => {
    setSelectedSession(session);
    setShowJoinModal(true);
    setJoinError(null);
    // ✅ O14 — restore preserved details (in-memory)
    reset(preservedDetails);
  };

  // ✅ O13 — Atomic modal transition, no state reset race
  const handleJoinFromDetails = () => {
    if (!detailsSession) return;
    const session = detailsSession;
    setShowDetailsModal(false);
    setDetailsSession(null);
    setDetailsPlayers([]);
    setRosterUnavailable(false);
    setSelectedSession(session);
    setJoinError(null);
    setShowJoinModal(true);
    reset(preservedDetails);
    navigate('/open-play', { replace: true, state: {} });
  };

  const handleJoinConfirm = async (data: JoinForm) => {
    if (!selectedSession) return;
    setJoining(true);
    setJoinError(null);
    // ✅ O14 — remember what they typed so reopening keeps it
    setPreservedDetails({
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes ?? '',
    });

    try {
      const booking = await openPlayService.joinSession(selectedSession.id, data);

      const store = useBookingStore.getState();
      store.reset();
      useBookingStore.setState({ currentBooking: booking });

      setShowJoinModal(false);
      setPreservedDetails({ name: '', email: '', phone: '', notes: '' });

      if (booking.status === 'confirmed' && booking.total_amount === 0) {
        navigate('/success');
      } else {
        navigate('/checkout');
      }
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const handleModalClose = () => {
    // ✅ O7 — confirm if fields have content
    const hasInput =
      formValues.name?.trim() ||
      formValues.email?.trim() ||
      formValues.phone?.trim() ||
      formValues.notes?.trim();
    if (hasInput) {
      if (!window.confirm('Discard your details?')) return;
    }
    setShowJoinModal(false);
    setSelectedSession(null);
    setJoinError(null);
    navigate('/open-play', { replace: true, state: {} });
  };

  // ✅ O5 — waitlist stub
  const handleWaitlist = (session: OpenPlaySession) => {
    // TODO: wire to backend when /open-play/waitlist endpoint exists
    window.alert(
      `We'll notify you if a spot opens in "${session.title || 'this session'}". (Coming soon)`
    );
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-16 sm:pt-28">
        <div className="mb-8 text-center sm:mb-10">
          <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-brand-blue-400/40 bg-brand-blue-500/20 px-3.5 py-1 text-xs font-bold text-brand-blue-300">
            <Users className="h-3.5 w-3.5" />
            Social Open Play
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-cream sm:text-4xl lg:text-5xl">
            Join a Social Session
          </h1>
          <p className="mx-auto mt-2.5 max-w-xl text-xs leading-relaxed text-cream-muted sm:text-sm">
            Drop into a group game, meet other players, and split the court. Pick a session
            below and reserve your spot.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-3 text-center text-xs font-semibold text-error">
            {error}
          </div>
        )}

        {loadingSessions ? (
          <LoadingSpinner className="py-20" />
        ) : sessions.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-forest-700/80 bg-forest-900/60 p-8 text-center shadow-xl backdrop-blur-sm">
            <CalendarDays className="h-10 w-10 text-cream-muted/40" />
            <div>
              <h2 className="text-sm font-bold text-cream">No sessions scheduled yet</h2>
              <p className="mt-1 text-xs text-cream-muted">
                Check back soon, or book a private court in the meantime.
              </p>
            </div>
            <Button size="md" to="/booking">
              Book a Court
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, i) => {
              const isFull = session.status === 'full';
              const status = STATUS_BADGE[session.status] ?? STATUS_BADGE.upcoming;
              // ✅ O10 — derive spots from counts, not API value
              const spotsLeft = Math.max(
                0,
                session.max_players - session.current_players
              );
              const imminence = getImminenceLabel(session);
              const isFree = session.price_per_player === 0;

              return (
                <motion.article
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl transition-all hover:border-brand-blue-400/60 hover:shadow-glow-blue flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.className}`}>
                        {imminence ?? status.label}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          SKILL_BADGE[session.skill_level] ?? SKILL_BADGE['All Levels']
                        }`}
                      >
                        {session.skill_level}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-cream">
                      {session.title || session.host_name || 'Open Play Session'}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs text-cream-muted">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-brand-blue-300" />
                        <span>{formatDateLong(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-brand-blue-300" />
                        <span>{formatTimeRange(session.start_time, session.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-brand-blue-300" />
                        <span>
                          {session.current_players}/{session.max_players} players · {spotsLeft}{' '}
                          spot{spotsLeft === 1 ? '' : 's'} left
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <UserCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue-300" />
                        <div className="flex flex-wrap gap-1">
                          {session.courts && session.courts.length > 0 ? (
                            session.courts.map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-forest-800 border border-forest-600"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span>{session.court_name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {session.description && (
                      <p className="mt-3 line-clamp-2 text-xs text-cream-muted/80 leading-relaxed">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-forest-700/80 pt-3.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-cream-muted font-semibold">
                        Per player
                      </p>
                      <p className="font-display text-lg font-extrabold text-brand-blue-300">
                        {isFree ? 'Free' : formatCurrency(session.price_per_player)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(session)}
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        View
                      </Button>
                      {isFull ? (
                        // ✅ O5 — Waitlist stub
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleWaitlist(session)}
                          leftIcon={<Bell className="h-3.5 w-3.5" />}
                        >
                          Notify Me
                        </Button>
                      ) : (
                        // ✅ O6 — Free sessions use green
                        <Button
                          size="sm"
                          className={
                            isFree
                              ? 'bg-accentGreen-500 text-charcoal hover:bg-accentGreen-400'
                              : undefined
                          }
                          onClick={() => handleJoinClick(session)}
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          {isFree ? 'Join Free' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────── Details Modal ─────────────────────── */}
      <Modal
        isOpen={showDetailsModal}
        onClose={handleDetailsClose}
        title="Session Details"
        size="md"
      >
        {detailsSession && (
          <div className="space-y-4">
            <div>
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    (STATUS_BADGE[detailsSession.status] ?? STATUS_BADGE.upcoming).className
                  }`}
                >
                  {(STATUS_BADGE[detailsSession.status] ?? STATUS_BADGE.upcoming).label}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    SKILL_BADGE[detailsSession.skill_level] ?? SKILL_BADGE['All Levels']
                  }`}
                >
                  {detailsSession.skill_level}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-cream">
                {detailsSession.title || detailsSession.host_name || 'Open Play Session'}
              </h3>
            </div>

            <div className="space-y-2 rounded-xl border border-forest-700/80 bg-forest-950/70 p-3.5 text-xs text-cream-muted">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-brand-blue-300" />
                <span>{formatDateLong(detailsSession.date)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-brand-blue-300" />
                <span>{formatTimeRange(detailsSession.start_time, detailsSession.end_time)}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <UserCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-300" />
                <div className="flex flex-wrap gap-1.5">
                  {detailsSession.courts && detailsSession.courts.length > 0 ? (
                    detailsSession.courts.map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] px-2 py-0.5 rounded bg-forest-800 border border-forest-600"
                      >
                        {c.name}
                      </span>
                    ))
                  ) : (
                    <span>{detailsSession.court_name}</span>
                  )}
                </div>
              </div>
            </div>

            {detailsSession.description && (
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">
                  About this session
                </p>
                <p className="whitespace-pre-wrap text-xs text-cream-muted leading-relaxed">
                  {detailsSession.description}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">
                Players ({detailsSession.current_players}/{detailsSession.max_players})
              </p>

              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-forest-800 border border-forest-700/80">
                <div
                  className="h-full bg-brand-blue-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (detailsSession.current_players / detailsSession.max_players) * 100
                    )}%`,
                  }}
                />
              </div>

              {loadingDetailsPlayers ? (
                <div className="py-3">
                  <LoadingSpinner className="py-2" />
                </div>
              ) : rosterUnavailable ? (
                // ✅ O11 — Distinct copy for privacy vs empty
                <p className="text-xs text-cream-muted">
                  Player list is private. {detailsSession.current_players} player
                  {detailsSession.current_players === 1 ? '' : 's'} joined ·{' '}
                  {Math.max(0, detailsSession.max_players - detailsSession.current_players)} spot
                  {Math.max(0, detailsSession.max_players - detailsSession.current_players) === 1
                    ? ''
                    : 's'}{' '}
                  left.
                </p>
              ) : detailsPlayers.length === 0 ? (
                <p className="text-xs text-cream-muted">
                  Be the first to join — no one's on the list yet!
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {detailsPlayers.map((player) => (
                    <span
                      key={player.booking_id}
                      className="rounded-lg border border-forest-600 bg-forest-800/90 px-2.5 py-1 text-[11px] font-medium text-cream"
                    >
                      {player.display_name}
                    </span>
                  ))}
                  {Math.max(0, detailsSession.max_players - detailsSession.current_players) > 0 && (
                    <span className="rounded-lg border border-dashed border-forest-600 px-2.5 py-1 text-[11px] text-cream-muted">
                      +
                      {Math.max(
                        0,
                        detailsSession.max_players - detailsSession.current_players
                      )}{' '}
                      spot
                      {Math.max(
                        0,
                        detailsSession.max_players - detailsSession.current_players
                      ) === 1
                        ? ''
                        : 's'}{' '}
                      open
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-brand-blue-500/40 bg-brand-blue-500/15 p-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                  Price per player
                </p>
                <p className="font-display text-xl font-extrabold text-brand-blue-300">
                  {detailsSession.price_per_player === 0
                    ? 'Free'
                    : formatCurrency(detailsSession.price_per_player)}
                </p>
              </div>
              <Button
                size="md"
                disabled={detailsSession.status === 'full'}
                onClick={handleJoinFromDetails}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {detailsSession.status === 'full' ? 'Full' : 'Join This Session'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────── Join Modal ─────────────────────── */}
      <Modal
        isOpen={showJoinModal}
        onClose={handleModalClose}
        title="Join Open Play Session"
        size="md"
      >
        {selectedSession && (
          <form onSubmit={handleSubmit(handleJoinConfirm)} className="space-y-4">
            <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-3.5">
              <p className="text-sm font-bold text-cream">
                {selectedSession.title || selectedSession.host_name || 'Open Play Session'}
              </p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {selectedSession.courts && selectedSession.courts.length > 0 ? (
                  selectedSession.courts.map((c) => (
                    <span
                      key={c.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-forest-800 border border-forest-600 text-cream-muted"
                    >
                      {c.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-cream-muted">{selectedSession.court_name}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-cream-muted">
                {formatDateLong(selectedSession.date)} ·{' '}
                {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
              </p>
              <p className="mt-1 text-xs font-semibold text-brand-blue-300">
                {selectedSession.current_players}/{selectedSession.max_players} players ·{' '}
                {selectedSession.price_per_player === 0
                  ? 'Free'
                  : `${formatCurrency(selectedSession.price_per_player)} / player`}
              </p>
            </div>

            {/* ✅ O3 — explicit outcome message */}
            <div className="rounded-xl border border-brand-blue-500/30 bg-brand-blue-500/10 p-3 text-xs text-cream-muted">
              {selectedSession.price_per_player === 0 ? (
                <>You'll be added to the roster immediately — no payment needed.</>
              ) : (
                <>
                  You'll be taken to checkout to pay{' '}
                  <strong className="text-brand-blue-200">
                    {formatCurrency(selectedSession.price_per_player)}
                  </strong>{' '}
                  and confirm your spot.
                </>
              )}
            </div>

            <Input
              id="name"
              label="Full Name"
              required
              placeholder="Enter your full name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="email"
              label="Email Address"
              required
              type="email"
              placeholder="you@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="phone"
              label="Phone Number"
              required
              type="tel"
              inputMode="numeric"
              placeholder="0917 123 4567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              id="notes"
              label="Notes (optional)"
              placeholder="Any special requests or paddle rental?"
              error={errors.notes?.message}
              {...register('notes')}
            />

            {joinError && (
              <div className="rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs font-medium text-error">
                {joinError}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:gap-3">
              <Button type="submit" fullWidth isLoading={joining}>
                {selectedSession.price_per_player === 0 ? 'Confirm & Join' : 'Confirm & Pay'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                className="sm:w-auto"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}