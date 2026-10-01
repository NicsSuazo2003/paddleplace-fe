import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Pencil,
  User,
  Mail,
  Phone,
  AlertCircle,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore, getSelectedSlotItems, getSelectedTotal } from '@/stores/bookingStore';
import { formatTimeRange, formatCurrency, formatDateLong, formatCountdown } from '@/utils/format';
import { FIXED_SLOT, APP_CONFIG } from '@/utils/constants';
import type { Court, TimeSlot, CustomerDetails } from '@/types';

// Normalize PH mobile: strip spaces/dashes/parens, convert +63/63 → 0
const normalizePhone = (value: string) =>
  value
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?63/, '0');

const customerSchema = z.object({
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

type CustomerForm = z.infer<typeof customerSchema>;

const HOLD_MINUTES = Math.max(1, Math.round(APP_CONFIG.paymentTimerSeconds / 60));

export function Booking() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ✅ Selector-based subscriptions (avoid re-render on unrelated state)
  const courts = useBookingStore((s) => s.courts);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const slots = useBookingStore((s) => s.slots);
  const selectedSlotIds = useBookingStore((s) => s.selectedSlotIds);
  const loadingCourts = useBookingStore((s) => s.loadingCourts);
  const error = useBookingStore((s) => s.error);
  const loadCourts = useBookingStore((s) => s.loadCourts);
  const setCustomer = useBookingStore((s) => s.setCustomer);
  const createBooking = useBookingStore((s) => s.createBooking);
  const removeSlot = useBookingStore((s) => s.removeSlot);
  const customer = useBookingStore((s) => s.customer);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    // ✅ Softer UX: validate on blur, then re-validate on change
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: useBookingStore.getState().customer,
  });

  const notesValue = watch('notes') ?? '';

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
  }, [courts.length, loadCourts]);

  // ✅ Only auto-scroll on small screens where summary + form aren't both visible
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  // ✅ Derived values via useMemo
  const selectedSlots = useMemo(() => {
    const state = useBookingStore.getState();
    return getSelectedSlotItems(state);
  }, [selectedSlotIds, slots]);

  const total = useMemo(() => {
    const state = useBookingStore.getState();
    return getSelectedTotal(state);
  }, [selectedSlotIds, slots]);

  const selectedCourts = useMemo<Court[]>(() => {
    const map = new Map<string, Court>();
    slots
      .filter((s) => selectedSlotIds.includes(s.id))
      .forEach((slot) => {
        const court = courts.find((c) => c.id === slot.court_id);
        if (court && !map.has(court.id)) map.set(court.id, court);
      });
    return Array.from(map.values());
  }, [slots, selectedSlotIds, courts]);

  const courtById = useMemo(() => {
    const map = new Map<string, Court>();
    courts.forEach((c) => map.set(c.id, c));
    return map;
  }, [courts]);

  const slotById = useMemo(() => {
    const map = new Map<string, TimeSlot>();
    slots.forEach((s) => map.set(s.id, s));
    return map;
  }, [slots]);

  const getCourtForSlot = (slotId: string) => {
    const ts = slotById.get(slotId);
    return ts ? courtById.get(ts.court_id) ?? null : null;
  };

  const onSubmit = async (data: CustomerForm) => {
    setSubmitting(true);
    setSubmitError(null);
    setShowErrorSummary(false);
    try {
      setCustomer(data);
      await createBooking();

      const created = useBookingStore.getState().currentBooking;
      if (created?.reference_code) {
        localStorage.setItem('pendingBookingRef', created.reference_code);
      }

      navigate('/checkout');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Scroll to first invalid field on submit failure
  const onInvalid = (formErrors: typeof errors) => {
    setShowErrorSummary(true);
    const order: (keyof CustomerForm)[] = ['name', 'phone', 'email', 'notes'];
    const first = order.find((k) => formErrors[k]);
    if (first) {
      const el = document.getElementById(first);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLInputElement | null)?.focus?.();
    }
  };

  const handleSummaryButtonClick = () => {
    setShowErrorSummary(true);
    handleSubmit(onSubmit, onInvalid)();
  };

  const errorCount = Object.keys(errors).length;

  // ✅ Stale-selection guard
  const hasStaleSelection = selectedSlotIds.length > 0 && selectedSlots.length === 0;

  if (loadingCourts && courts.length === 0) {
    return (
      <div className="min-h-screen bg-charcoal">
        <Navbar />
        <LoadingSpinner className="pt-32" />
        <Footer />
      </div>
    );
  }

  if (selectedSlots.length === 0 && !hasStaleSelection) {
    return (
      <div className="min-h-screen bg-charcoal">
        <Navbar />
        <div className="container-page flex flex-col items-center justify-center gap-4 pt-32 pb-24 text-center">
          <CalendarDays className="h-10 w-10 text-cream-muted/40" />
          <div>
            <h1 className="text-lg font-bold text-cream">No court or time selected yet</h1>
            <p className="mt-1 text-sm text-cream-muted">
              Head back to the homepage to pick a court and a time slot first.
            </p>
          </div>
          <Button size="md" to="/" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Choose Court & Time
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-36 lg:pb-16">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">Confirm & Book</h1>
          <p className="text-xs text-cream-muted sm:text-sm">
            Review your selection, then enter your details.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/20 bg-error/10 p-3 text-xs font-medium text-error">
            {error}
          </div>
        )}

        {/* ✅ Stale selection warning */}
        {hasStaleSelection && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-100">We lost track of your slot details.</p>
              <p className="mt-0.5 text-amber-200/80">
                Your slot prices and times couldn't be loaded. Please reselect your slots.
              </p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-100 underline"
              >
                Back to court selection
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ✅ Error summary banner */}
        {showErrorSummary && errorCount > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-error/40 bg-error/10 p-3 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} below.
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {errors.name?.message && <li>{errors.name.message}</li>}
                {errors.phone?.message && <li>{errors.phone.message}</li>}
                {errors.email?.message && <li>{errors.email.message}</li>}
                {errors.notes?.message && <li>{errors.notes.message}</li>}
              </ul>
            </div>
          </div>
        )}

        <div className="grid gap-5 md:gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Selection Summary */}
            <div className="card rounded-2xl border border-forest-700/70 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-blue-300" />
                  Your Selection ({selectedCourts.length} court{selectedCourts.length > 1 ? 's' : ''})
                </h2>
                {/* ✅ Promoted edit chip */}
                <Link
                  to="/#booking"
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-blue-500/40 bg-brand-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-brand-blue-300 transition hover:bg-brand-blue-500/20"
                >
                  <Pencil className="h-3 w-3" />
                  Edit selection
                </Link>
              </div>

              <p className="mb-3 text-xs font-medium text-cream-muted">
                {formatDateLong(selectedDate)}
              </p>

              {/* Court Cards */}
              <div className="space-y-2.5">
                {selectedCourts.map((court) => {
                  const courtSlots = selectedSlots.filter((s) => {
                    const ts = slotById.get(s.slot_id);
                    return ts?.court_id === court.id;
                  });
                  return (
                    <div
                      key={court.id}
                      className="flex items-center gap-3.5 rounded-xl border border-brand-blue-500/40 bg-forest-950/60 p-3.5 transition"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-forest-700 sm:h-16 sm:w-16">
                        <img
                          src={court.image}
                          alt={court.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-cream sm:text-base">
                          {court.name}
                        </h3>
                        <p className="truncate text-xs text-cream-muted">
                          {court.surface || court.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-brand-blue-300">
                          {formatCurrency(courtSlots.reduce((sum, s) => sum + s.price, 0))}
                        </p>
                        <p className="text-[10px] text-cream-muted">
                          {courtSlots.length} slot{courtSlots.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slot Row Pills — grouped by court, each removable */}
              <div className="mt-3.5 space-y-3">
                {selectedCourts.map((court) => {
                  const courtSlots = selectedSlots.filter((s) => {
                    const ts = slotById.get(s.slot_id);
                    return ts?.court_id === court.id;
                  });
                  if (courtSlots.length === 0) return null;
                  return (
                    <div key={court.id} className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                        {court.name}
                      </p>
                      {courtSlots.map((slot) => (
                        <div
                          key={slot.slot_id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-forest-700/60 bg-forest-800/80 px-3.5 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-brand-blue-300" />
                            <span className="truncate text-xs font-medium text-cream sm:text-sm">
                              {formatTimeRange(slot.start_time, slot.end_time)}
                            </span>
                            {slot.type === 'fixed_2hr' && (
                              <span className="shrink-0 rounded-full bg-brand-blue-500/30 border border-brand-blue-400/40 px-2 py-0.5 text-[9px] font-bold text-brand-blue-200">
                                {FIXED_SLOT.label}
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-xs font-bold text-brand-blue-300 sm:text-sm">
                              {formatCurrency(slot.price)}
                            </span>
                            {/* ✅ Per-slot remove */}
                            <button
                              type="button"
                              onClick={() => removeSlot(slot.slot_id)}
                              title="Remove slot"
                              className="rounded-lg border border-forest-700 bg-forest-900 p-1 text-cream-muted transition hover:border-error/60 hover:text-error"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-forest-700/80 pt-3.5">
                <span className="text-xs text-cream-muted">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                </span>
                <span className="font-display text-xl font-extrabold text-brand-blue-300">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Customer Details Form */}
            <div
              ref={formRef}
              className="card rounded-2xl border border-forest-700/70 bg-forest-900/80 p-4 scroll-mt-24 sm:p-5 shadow-xl backdrop-blur-sm"
            >
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                Your Details
              </h2>
              <form id="bookingForm" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Input
                    id="name"
                    label="Full Name"
                    placeholder="Juan Dela Cruz"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="0917 123 4567"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  inputMode="email"
                  placeholder="juan@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <div>
                  <Textarea
                    id="notes"
                    label="Notes (optional)"
                    rows={2}
                    placeholder="Any special requests or equipment rental notes..."
                    {...register('notes')}
                  />
                  {/* ✅ Char counter */}
                  <p className="mt-1 text-right text-[11px] text-cream-muted">
                    {notesValue.length} / 500
                  </p>
                </div>

                {submitError && (
                  <p className="rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs font-medium text-error">
                    {submitError}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right: Booking Summary Sidebar */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24 space-y-3">
              <div className="card rounded-2xl border border-forest-700/70 bg-forest-900/90 p-5 shadow-xl">
                <h2 className="mb-3.5 font-display text-base font-bold text-cream">
                  Booking Summary
                </h2>

                {/* ✅ Court cards with subtotals only (no duplicate slot list) */}
                <div className="mb-3.5 space-y-2">
                  {selectedCourts.map((court) => {
                    const courtSlots = selectedSlots.filter((s) => {
                      const ts = slotById.get(s.slot_id);
                      return ts?.court_id === court.id;
                    });
                    return (
                      <div
                        key={court.id}
                        className="rounded-xl border border-forest-700/60 bg-forest-950/60 p-3"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                          Court
                        </p>
                        <p className="text-sm font-bold text-cream">{court.name}</p>
                        <p className="text-[10px] text-cream-muted">{formatDateLong(selectedDate)}</p>
                        <p className="mt-1.5 text-xs font-semibold text-brand-blue-300">
                          {courtSlots.length} slot{courtSlots.length > 1 ? 's' : ''} ·{' '}
                          {formatCurrency(courtSlots.reduce((sum, s) => sum + s.price, 0))}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* ✅ Compact slot list (no per-court duplication header) */}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key="slots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1.5"
                  >
                    {selectedSlots.map((slot) => {
                      const court = getCourtForSlot(slot.slot_id);
                      return (
                        <div
                          key={slot.slot_id}
                          className="flex items-center justify-between rounded-lg bg-forest-800/80 px-3 py-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate font-medium text-cream">
                              {court?.name || 'Court'} · {formatTimeRange(slot.start_time, slot.end_time)}
                            </p>
                            {slot.type === 'fixed_2hr' && (
                              <span className="text-[9px] font-bold text-brand-blue-300">
                                {FIXED_SLOT.label}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 font-bold text-brand-blue-300">
                            {formatCurrency(slot.price)}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-4 border-t border-forest-700/80 pt-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cream-muted">
                      {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                    </span>
                    <span className="font-display text-2xl font-extrabold text-brand-blue-300">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  className="mt-4"
                  isLoading={submitting}
                  onClick={handleSummaryButtonClick}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Proceed to Checkout
                </Button>
              </div>

              <div className="rounded-xl border border-forest-700/70 bg-forest-900/60 p-3.5">
                <p className="text-xs text-cream-muted leading-relaxed">
                  <span className="font-semibold text-brand-blue-300">Note:</span> Court slots are
                  temporarily reserved once you proceed to checkout. Complete payment within{' '}
                  {HOLD_MINUTES} minutes to secure your schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Sticky Mobile Checkout Bar — hold timer + validation feedback */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-700/80 bg-forest-950/95 p-3.5 backdrop-blur-md lg:hidden">
        {showErrorSummary && errorCount > 0 && (
          <p className="mb-2 flex items-center gap-1.5 rounded-lg border border-error/40 bg-error/10 p-2 text-[11px] font-semibold text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} above.
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-cream-muted">
              {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} · held {HOLD_MINUTES} min after checkout
            </p>
            <p className="text-xl font-extrabold text-brand-blue-300">{formatCurrency(total)}</p>
          </div>
          <Button
            size="md"
            isLoading={submitting}
            onClick={handleSummaryButtonClick}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="shrink-0 px-6"
          >
            Checkout
          </Button>
        </div>
        {submitError && (
          <p className="mt-2 rounded-lg border border-error/30 bg-error/10 p-2 text-xs font-medium text-error">
            {submitError}
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}

export type { CustomerDetails };