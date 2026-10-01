// src/pages/Success.tsx
import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  Home,
  Mail,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useBookingStore } from '@/stores/bookingStore';
import { useClientStore } from '@/stores/clientStore';
import {
  formatTimeRange,
  formatSlotRange,
  formatCurrency,
  formatDateLong,
} from '@/utils/format';

export function Success() {
  const navigate = useNavigate();
  const currentBooking = useBookingStore((s) => s.currentBooking);
  const settings = useClientStore((s) => s.settings);

  useEffect(() => {
    if (!currentBooking) {
      navigate('/');
    }
  }, [currentBooking, navigate]);

  // ✅ S2 — Dynamic label based on status/amount
  const totalLabel = useMemo(() => {
    if (!currentBooking) return 'Total';
    if (currentBooking.total_amount === 0) return 'Confirmed';
    switch (currentBooking.status) {
      case 'pending_payment':
        return 'Amount due';
      case 'payment_submitted':
        return 'Amount submitted';
      case 'confirmed':
      case 'completed':
        return 'Total paid';
      default:
        return 'Total';
    }
  }, [currentBooking]);

  // ✅ S3 — Submission timestamp reassurance
  const submittedAt = useMemo(() => {
    if (!currentBooking) return null;
    const ts =
      (currentBooking as { payment_submitted_at?: string }).payment_submitted_at ??
      currentBooking.created_at;
    if (!ts) return null;
    try {
      return new Date(ts).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [currentBooking]);

  if (!currentBooking) return null;

  const isOpenPlay = Boolean(
    (currentBooking as { open_play_session_id?: string | null }).open_play_session_id
  );
  const isFree = currentBooking.total_amount === 0;

  const supportPhone = settings?.contact_phone;
  const supportEmail = settings?.contact_email;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-14 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.2 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accentGreen-400/40 bg-accentGreen-500/20 shadow-glow-green sm:h-20 sm:w-20"
            >
              <CheckCircle2 className="h-8 w-8 text-accentGreen-300 sm:h-11 sm:w-11" />
            </motion.div>
            <h1 className="mt-4 text-2xl font-bold text-cream sm:mt-6 sm:text-4xl">
              {isFree ? "You're In!" : 'Payment Submitted!'}
            </h1>
            <p className="mt-2 text-xs text-cream-muted sm:mt-3 sm:text-base">
              {isFree
                ? 'Your spot is confirmed. See you on the court!'
                : "Your booking is now being reviewed. We'll confirm it shortly."}
            </p>
          </motion.div>

          {/* ✅ S3 — Reassurance callout */}
          {!isFree && submittedAt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-accentGreen-500/30 bg-accentGreen-500/10 p-3.5 text-xs sm:text-sm"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-accentGreen-300" />
              <span className="text-cream-muted">
                We received your submission at{' '}
                <strong className="text-cream">{submittedAt}</strong>. Review usually takes under
                30 minutes.
              </span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-6 rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:mt-8 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-forest-700/80 pb-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                  Reference Code
                </p>
                <p className="truncate font-mono text-xl font-extrabold tracking-wider text-brand-blue-300 sm:text-2xl">
                  {currentBooking.reference_code}
                </p>
              </div>
              <StatusBadge status={currentBooking.status} />
            </div>

            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest-700 bg-forest-950/70 text-brand-blue-300">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                    Court
                  </p>
                  <p className="truncate text-sm font-bold text-cream sm:text-base">
                    {currentBooking.court_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest-700 bg-forest-950/70 text-brand-blue-300">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                    Date
                  </p>
                  <p className="text-sm font-bold text-cream sm:text-base">
                    {formatDateLong(currentBooking.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest-700 bg-forest-950/70 text-brand-blue-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                    Time Slot{currentBooking.slots.length > 1 ? 's' : ''}
                  </p>
                  {/* ✅ S4 — Stacked pills instead of comma-joined string */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {currentBooking.slots.map((slot, idx) => (
                      <span
                        key={`${idx}-${slot.slot_id ?? slot.id ?? ''}`}
                        className="rounded-lg border border-forest-700/70 bg-forest-950/60 px-2.5 py-1 text-xs font-medium text-cream sm:text-sm"
                      >
                        {formatSlotRange(slot)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-forest-700/80 pt-4">
              <span className="text-xs text-cream-muted sm:text-sm">{totalLabel}</span>
              <span className="font-display text-2xl font-extrabold text-brand-blue-300 sm:text-3xl">
                {formatCurrency(currentBooking.total_amount)}
              </span>
            </div>
          </motion.div>

          {/* ✅ S5 — Strengthened "what happens next" with fallback */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 rounded-2xl border border-brand-blue-500/40 bg-brand-blue-500/10 p-4 sm:mt-6 sm:p-5"
          >
            <h3 className="text-sm font-bold text-brand-blue-200 sm:text-base">
              What happens next?
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs text-cream-muted sm:mt-3 sm:text-sm">
              {isFree ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-300" />
                    <span>Your spot is locked in — no payment required.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-300" />
                    <span>Arrive 10 minutes early and check in with the host.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-300" />
                    <span>Save your reference code to view the roster anytime.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-300" />
                    <span>
                      Our team verifies your payment — usually within{' '}
                      <strong className="text-cream">30 minutes</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-300" />
                    <span>
                      If it's taking longer, reach us at{' '}
                      {supportPhone ? (
                        <a
                          href={`tel:${supportPhone}`}
                          className="font-semibold text-brand-blue-200 underline"
                        >
                          {supportPhone}
                        </a>
                      ) : supportEmail ? (
                        <a
                          href={`mailto:${supportEmail}`}
                          className="font-semibold text-brand-blue-200 underline"
                        >
                          {supportEmail}
                        </a>
                      ) : (
                        <span className="font-semibold text-brand-blue-200">
                          the number on our homepage
                        </span>
                      )}
                      .
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-300" />
                    <span>
                      Watch your reference code change to{' '}
                      <strong className="text-cream">Confirmed</strong> on the Track page.
                    </span>
                  </li>
                </>
              )}
            </ul>
          </motion.div>

          {/* ✅ S1 — Honest save prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs sm:text-sm"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-100">
                  Save your reference code now.
                </p>
                <p className="mt-0.5 text-cream-muted">
                  We don't email confirmations yet. Copy{' '}
                  <span className="font-mono font-bold text-brand-blue-300">
                    {currentBooking.reference_code}
                  </span>{' '}
                  or bookmark this page.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(currentBooking.reference_code);
                    } catch {
                      /* no-op */
                    }
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-brand-blue-500/40 bg-brand-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-brand-blue-200 transition hover:bg-brand-blue-500/30"
                >
                  Copy code
                </button>
              </div>
            </div>
          </motion.div>

          {/* ✅ S7 — Invite friends hint for Open Play */}
          {isOpenPlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 rounded-xl border border-forest-700/80 bg-forest-900/60 p-3.5 text-xs text-cream-muted sm:text-sm"
            >
              <div className="flex items-start gap-2.5">
                <Users className="h-4 w-4 shrink-0 mt-0.5 text-brand-blue-300" />
                <span>
                  Know someone who'd want to play? Share your session link so they can join the
                  same Open Play game.
                </span>
              </div>
            </motion.div>
          )}

          {/* ✅ S6 — Primary vs secondary CTA weighting */}
          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Button
              size="lg"
              fullWidth
              to="/track"
              leftIcon={<Search className="h-5 w-5" />}
            >
              Track This Booking
            </Button>
            <Button
              size="lg"
              variant="secondary"
              fullWidth
              to="/"
              leftIcon={<Home className="h-5 w-5" />}
            >
              Back to Home
            </Button>
          </div>

          <p className="mt-5 text-center text-xs text-cream-muted sm:mt-6">
            Need help? Visit{' '}
            <Link to="/track" className="font-semibold text-brand-blue-300 underline">
              Track My Booking
            </Link>
            {supportEmail ? (
              <>
                {' '}
                or email{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-semibold text-brand-blue-300 underline"
                >
                  {supportEmail}
                </a>
              </>
            ) : null}
            .
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}