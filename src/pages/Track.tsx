// src/pages/Track.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Upload,
  AlertCircle,
  Wallet,
  ImageIcon,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { bookingService } from '@/services/bookingService';
import { useClientStore } from '@/stores/clientStore';
import {
  formatCurrency,
  formatDateLong,
  formatDateTime,
  formatSlotRange,
} from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';
import { isInAppBrowser, getInAppBrowserName } from '@/utils/browser';
import type { Booking, BookingSummary, PaymentMethod } from '@/types';

type SearchMode = 'reference' | 'email';
type UploadError =
  | { field: 'ref'; message: string }
  | { field: 'file'; message: string }
  | { field: 'general'; message: string }
  | null;

export function Track() {
  const settings = useClientStore((s) => s.settings);
  const loadSettings = useClientStore((s) => s.loadSettings);

  // ✅ T5/T8 — Prefer the first enabled payment method's info; fall back to legacy GCash
  const methods: PaymentMethod[] = useMemo(
    () => (settings?.payment_methods ?? []).filter((m) => m.enabled),
    [settings?.payment_methods]
  );
  const primaryMethod = methods[0];
  const displayNumber =
    primaryMethod?.config?.account_number ||
    settings?.gcash_number ||
    APP_CONFIG.gcashNumber;
  const methodName = primaryMethod?.name || 'GCash';

  const [searchMode, setSearchMode] = useState<SearchMode>('reference');
  const [reference, setReference] = useState(
    () => localStorage.getItem('pendingBookingRef') || ''
  );
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [summaries, setSummaries] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<UploadError>(null);
  const [replacingScreenshot, setReplacingScreenshot] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBooking(null);
    setSummaries([]);
    setUploadSuccess(false);
    setUploadError(null);

    const ref = reference.trim();
    const mail = email.trim();

    // ✅ T14 — Email format validation
    if (searchMode === 'email') {
      if (!mail) {
        setError('Enter your email to search.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        setError('Enter a valid email address.');
        return;
      }
    } else {
      if (!ref) {
        setError('Enter your reference code to search.');
        return;
      }
    }

    setLoading(true);
    try {
      if (searchMode === 'reference') {
        const result = await bookingService.trackBooking(ref, mail || undefined);
        setBooking(result);
      } else {
        const list = await bookingService.trackBookingSummariesByEmail(mail);
        if (list.length === 0) {
          // ✅ T7 — Better dead-end guidance
          setError(
            'No pending payments found for this email. If your booking is already confirmed, look it up with your reference code, or contact us at ' +
              (settings?.contact_email || 'the email on our homepage') +
              '.'
          );
        } else {
          setSummaries(list);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryClick = async (summary: BookingSummary) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await bookingService.trackBooking(
        summary.reference_code,
        email.trim()
      );
      setBooking(detail);
      setSummaries([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open booking');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError({ field: 'file', message: 'Please upload an image file (PNG, JPG)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError({ field: 'file', message: 'Image must be under 5MB' });
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!booking || !screenshot || !paymentRef.trim()) {
      if (!paymentRef.trim()) {
        setUploadError({ field: 'ref', message: 'Reference number is required' });
      }
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const updated = await bookingService.uploadPayment(
        booking.id,
        screenshot,
        paymentRef.trim(),
        primaryMethod?.name
      );
      setBooking(updated);
      setUploadSuccess(true);
      setScreenshot(null);
      setPaymentRef('');
      setReplacingScreenshot(false);
      localStorage.removeItem('pendingBookingRef');
    } catch (err) {
      setUploadError({
        field: 'general',
        message: err instanceof Error ? err.message : 'Failed to upload payment. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const canUploadPayment =
    booking &&
    (booking.status === 'pending_payment' || booking.status === 'payment_submitted');

  const hasPaymentScreenshot = Boolean(booking?.payment_screenshot_url);

  // ✅ T4 — Allow replacing screenshot
  const showUploadBlock =
    canUploadPayment && (!hasPaymentScreenshot || replacingScreenshot);

  const canSearch =
    searchMode === 'reference' ? reference.trim().length > 0 : email.trim().length > 0;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-14 sm:pt-28 sm:pb-16">
        {isInAppBrowser() && (
          <div className="mx-auto mb-4 flex max-w-3xl items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              You're viewing this in {getInAppBrowserName() ?? 'an in-app'} browser. If uploading
              a screenshot doesn't work, tap <strong>⋯</strong> and choose{' '}
              <strong>"Open in Browser."</strong>
            </span>
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl lg:text-4xl">
              Track Your Booking
            </h1>
            <p className="mt-1.5 text-xs text-cream-muted sm:mt-2 sm:text-sm">
              Search by reference code for full details, or by email to see bookings pending payment.
            </p>
          </div>

          {/* ✅ T1 — Search mode toggle */}
          <form
            onSubmit={handleSearch}
            className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm"
          >
            <div className="mb-4 inline-flex rounded-xl border border-forest-700/80 bg-forest-950/60 p-1">
              <button
                type="button"
                onClick={() => setSearchMode('reference')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  searchMode === 'reference'
                    ? 'bg-brand-blue-500 text-white shadow-sm'
                    : 'text-cream-muted hover:text-cream'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Reference Code
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('email')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  searchMode === 'email'
                    ? 'bg-brand-blue-500 text-white shadow-sm'
                    : 'text-cream-muted hover:text-cream'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            </div>

            {searchMode === 'reference' ? (
              <div className="space-y-3.5">
                <Input
                  label="Reference Code"
                  placeholder="e.g. PJAB12CD"
                  leftIcon={<Search className="h-4 w-4 text-cream-muted" />}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
                <Input
                  label="Email (optional)"
                  type="email"
                  placeholder="your@email.com"
                  leftIcon={<Mail className="h-4 w-4 text-cream-muted" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  hint="Add email if your booking was made with one for extra verification."
                />
              </div>
            ) : (
              <div className="space-y-3.5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  leftIcon={<Mail className="h-4 w-4 text-cream-muted" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  hint="Shows bookings that need payment action. Confirmed bookings need the reference code."
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              className="mt-4 sm:w-auto"
              isLoading={loading}
              disabled={!canSearch}
              leftIcon={<Search className="h-5 w-5" />}
            >
              Search Booking
            </Button>
            {!canSearch && (
              <p className="mt-2 text-[11px] text-cream-muted">
                Enter a {searchMode === 'reference' ? 'reference code' : 'valid email'} to enable search.
              </p>
            )}
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs text-error font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && <LoadingSpinner className="py-12" />}

          {/* Email search: summary list */}
          {!loading && summaries.length > 0 && (
            <div className="mt-6 space-y-3 sm:mt-8">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-cream sm:text-base">
                    Bookings Needing Payment Action ({summaries.length})
                  </h2>
                  <p className="text-[11px] text-cream-muted">
                    Confirmed or completed bookings won't appear here. Use your reference code to see them.
                  </p>
                </div>
                {/* ✅ T9 — Clear list but keep email */}
                <button
                  type="button"
                  onClick={() => setSummaries([])}
                  className="shrink-0 text-[11px] text-cream-muted underline hover:text-cream"
                >
                  Hide results
                </button>
              </div>

              {summaries.map((s) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSummaryClick(s)}
                  className="w-full cursor-pointer rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 text-left shadow-xl backdrop-blur-sm transition hover:border-brand-blue-400/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-extrabold tracking-wider text-brand-blue-300">
                        {s.reference_code}
                      </p>
                      <p className="mt-0.5 text-xs text-cream-muted">
                        {s.court_name} · {formatDateLong(s.date)}
                        {s.start_time && s.end_time && (
                          <> · {formatSlotRange({ start_time: s.start_time, end_time: s.end_time })}</>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-2 text-[11px] text-cream-muted">
                    Booked {formatDateTime(s.created_at)} · {formatCurrency(s.total_amount)}
                  </p>
                </motion.button>
              ))}
            </div>
          )}

          {/* Single booking detail */}
          <AnimatePresence>
            {booking && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 space-y-4 sm:mt-8 sm:space-y-6"
              >
                {/* Booking Card */}
                <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col gap-3 border-b border-forest-700/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                        Reference Code
                      </p>
                      <p className="font-mono text-xl font-extrabold tracking-wider text-brand-blue-300 sm:text-2xl">
                        {booking.reference_code}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} size="md" />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest-700 bg-forest-950/70 text-brand-blue-300">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                          Court
                        </p>
                        <p className="text-sm font-bold text-cream sm:text-base">
                          {booking.court_name}
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
                          {formatDateLong(booking.date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">
                      Time Slots
                    </p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {booking.slots.map((slot) => (
                        <div
                          key={slot.slot_id || slot.id}
                          className="flex items-center justify-between rounded-xl border border-forest-700/60 bg-forest-800/80 p-2.5 sm:p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-brand-blue-300" />
                            <span className="text-xs font-medium text-cream sm:text-sm">
                              {formatSlotRange(slot)}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-brand-blue-300 sm:text-sm">
                            {formatCurrency(slot.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-forest-700/80 pt-4">
                    <span className="text-xs text-cream-muted sm:text-sm">Total Amount</span>
                    <span className="font-display text-2xl font-extrabold text-brand-blue-300">
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                  <h3 className="mb-3.5 font-display text-base font-bold text-cream">
                    Customer Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <User className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Name:</span>
                      <span className="truncate font-medium text-cream">
                        {booking.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Email:</span>
                      <span className="truncate font-medium text-cream">
                        {booking.customer.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Phone:</span>
                      <span className="font-medium text-cream">{booking.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Booked:</span>
                      <span className="font-medium text-cream">
                        {formatDateTime(booking.created_at)}
                      </span>
                    </div>
                  </div>
                  {booking.customer.notes && (
                    <div className="mt-3 rounded-xl border border-forest-700/60 bg-forest-950/60 p-3 text-xs text-cream-muted leading-relaxed">
                      <span className="font-semibold text-cream">Notes: </span>
                      {booking.customer.notes}
                    </div>
                  )}
                </div>

                {/* Uploaded payment screenshot display — with replace option */}
                {hasPaymentScreenshot && !replacingScreenshot && (
                  <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
                        <CheckCircle2 className="h-5 w-5 text-accentGreen-300" />
                        Payment Screenshot
                      </h3>
                      {canUploadPayment && (
                        <button
                          type="button"
                          onClick={() => setReplacingScreenshot(true)}
                          className="text-[11px] font-semibold text-brand-blue-300 underline hover:text-brand-blue-200"
                        >
                          Replace
                        </button>
                      )}
                    </div>
                    <p className="mb-3.5 text-xs text-cream-muted">
                      Your payment screenshot has been submitted and is currently being verified.
                    </p>
                    <div className="rounded-xl border border-forest-700/80 bg-forest-950/80 p-3">
                      <img
                        src={booking.payment_screenshot_url || undefined}
                        alt="Payment Screenshot"
                        className="mx-auto max-h-64 rounded-lg object-contain"
                      />
                    </div>
                    {booking.payment_reference && (
                      <p className="mt-2.5 text-xs text-cream-muted">
                        Reference Number:{' '}
                        <span className="font-mono font-bold text-brand-blue-300">
                          {booking.payment_reference}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Payment block (pending / payment_submitted, and no screenshot OR replacing) */}
                {showUploadBlock && (
                  <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
                        <Wallet className="h-5 w-5 text-brand-blue-300" />
                        {replacingScreenshot ? 'Replace Screenshot' : 'Complete Payment'}
                      </h3>
                      {replacingScreenshot && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingScreenshot(false);
                            setScreenshot(null);
                            setPaymentRef('');
                            setUploadError(null);
                          }}
                          className="text-[11px] font-semibold text-cream-muted underline hover:text-cream"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {/* ✅ T8 — Method name made explicit */}
                    <p className="mb-3.5 text-xs text-cream-muted sm:text-sm">
                      Send {formatCurrency(booking.total_amount)} via{' '}
                      <strong className="text-cream">{methodName}</strong> to{' '}
                      <span className="font-bold text-brand-blue-300">{displayNumber}</span> and
                      upload your receipt below.
                    </p>

                    {uploadSuccess ? (
                      <div className="rounded-xl border border-accentGreen-500/40 bg-accentGreen-500/10 p-3.5 text-center text-xs font-semibold text-accentGreen-300 sm:text-sm">
                        Payment screenshot uploaded! Your booking is being reviewed.
                      </div>
                    ) : (
                      <>
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleFile(file);
                          }}
                          className="rounded-xl border-2 border-dashed border-forest-700/80 bg-forest-950/40 p-4 text-center transition-all hover:border-brand-blue-400/60 sm:p-6"
                        >
                          {screenshot ? (
                            <div className="space-y-2">
                              <img
                                src={screenshot}
                                alt="Screenshot"
                                className="mx-auto max-h-36 rounded-lg object-contain border border-forest-700 bg-forest-950 sm:max-h-40"
                              />
                              <button
                                type="button"
                                onClick={() => setScreenshot(null)}
                                className="text-xs text-cream-muted underline hover:text-error transition"
                              >
                                Change image
                              </button>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="mx-auto h-8 w-8 text-cream-muted/40" />
                              <p className="mt-2 text-xs text-cream-muted">
                                Drag receipt screenshot or{' '}
                                <label className="cursor-pointer font-semibold text-brand-blue-300 underline hover:text-brand-blue-200">
                                  browse
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFile(file);
                                    }}
                                  />
                                </label>
                              </p>
                            </>
                          )}
                        </div>

                        {uploadError?.field === 'file' && (
                          <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs text-error font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {uploadError.message}
                          </div>
                        )}

                        {screenshot && (
                          <>
                            <div className="mt-3.5">
                              <input
                                type="text"
                                value={paymentRef}
                                onChange={(e) => {
                                  setPaymentRef(e.target.value);
                                  if (uploadError?.field === 'ref') setUploadError(null);
                                }}
                                placeholder={`${methodName} reference number`}
                                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/60 px-4 py-2.5 text-sm text-cream placeholder-cream-muted/40 transition-all focus:border-brand-blue-400 focus:bg-forest-900/60 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
                              />
                              {/* ✅ T6 — Format hint */}
                              <p className="mt-1.5 text-[11px] text-cream-muted">
                                Usually 13 digits from your {methodName} receipt.
                              </p>
                            </div>

                            {uploadError?.field === 'ref' && (
                              <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs text-error font-medium">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {uploadError.message}
                              </div>
                            )}

                            {uploadError?.field === 'general' && (
                              <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs text-error font-medium">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {uploadError.message}
                              </div>
                            )}

                            <Button
                              className="mt-3.5"
                              fullWidth
                              isLoading={uploading}
                              disabled={!paymentRef.trim()}
                              onClick={handleUpload}
                              leftIcon={<Upload className="h-4 w-4" />}
                            >
                              {replacingScreenshot ? 'Replace Screenshot' : 'Upload Payment'}
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ✅ T10 — Broader status callouts */}
                {booking.status === 'pending_payment' && !hasPaymentScreenshot && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-xs font-semibold text-amber-200 sm:text-sm">
                    Payment pending — upload your receipt above to confirm your slot.
                  </div>
                )}
                {booking.status === 'payment_submitted' && (
                  <div className="rounded-xl border border-brand-blue-500/40 bg-brand-blue-500/10 p-4 text-center text-xs font-semibold text-brand-blue-200 sm:text-sm">
                    Payment submitted — we're reviewing it. Check back in a few minutes.
                  </div>
                )}
                {booking.status === 'confirmed' && (
                  <div className="rounded-xl border border-accentGreen-500/40 bg-accentGreen-500/10 p-4 text-center text-xs font-semibold text-accentGreen-300 sm:text-sm">
                    Your booking is confirmed! See you on the court.
                  </div>
                )}
                {booking.status === 'completed' && (
                  <div className="rounded-xl border border-brand-blue-500/40 bg-brand-blue-500/10 p-4 text-center text-xs font-semibold text-brand-blue-300 sm:text-sm">
                    Thanks for playing with us! We hope to see you again soon.
                  </div>
                )}
                {booking.status === 'cancelled' && (
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-center text-xs font-semibold text-error sm:text-sm">
                    This booking has been cancelled.
                  </div>
                )}
                {/* ✅ T11 — Rejected has contact links */}
                {booking.status === 'rejected' && (
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs text-error sm:text-sm">
                    <p className="text-center font-semibold">
                      Your payment could not be verified.
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {settings?.contact_phone && (
                        <a
                          href={`tel:${settings.contact_phone}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-error/40 bg-error/10 px-3 py-1.5 font-semibold transition hover:bg-error/20"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call us
                        </a>
                      )}
                      {settings?.contact_email && (
                        <a
                          href={`mailto:${settings.contact_email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-error/40 bg-error/10 px-3 py-1.5 font-semibold transition hover:bg-error/20"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email us
                        </a>
                      )}
                      {settings?.contact_viber && (
                        <a
                          href={`viber://chat?number=${settings.contact_viber.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-error/40 bg-error/10 px-3 py-1.5 font-semibold transition hover:bg-error/20"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Viber
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {booking.status === 'expired' && (
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-center text-xs font-semibold text-error sm:text-sm">
                    This payment window expired. Please rebook your slots.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}