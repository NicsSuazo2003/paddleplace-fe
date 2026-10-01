import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  Clock,
  Upload,
  AlertCircle,
  CheckCircle2,
  Copy,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Smartphone,
  QrCode,
  Banknote,
  CreditCard,
  Building2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useBookingStore } from '@/stores/bookingStore';
import { useClientStore } from '@/stores/clientStore';
import { bookingService } from '@/services/bookingService';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
  formatCountdown,
} from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';
import { isInAppBrowser, getInAppBrowserName } from '@/utils/browser';
import type { PaymentMethod } from '@/types';

const ICON_MAP: Record<string, any> = {
  Smartphone,
  QrCode,
  Banknote,
  CreditCard,
  Wallet,
  Building2,
};

export function Checkout() {
  const navigate = useNavigate();
  const { currentBooking, reset } = useBookingStore();
  const settings = useClientStore((state) => state.settings);
  const loadSettings = useClientStore((state) => state.loadSettings);
  const paymentMethods = settings?.payment_methods ?? [];

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!currentBooking?.payment_expires_at) {
      return APP_CONFIG.paymentTimerSeconds;
    }
    const expiresAt = new Date(currentBooking.payment_expires_at).getTime();
    const secondsLeft = Math.floor((expiresAt - Date.now()) / 1000);
    return Math.max(0, secondsLeft);
  });

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedGcash, setCopiedGcash] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!currentBooking) {
      navigate('/booking');
    }
  }, [currentBooking, navigate]);

  useEffect(() => {
    if (currentBooking?.status === 'expired') {
      navigate('/booking');
    }
  }, [currentBooking?.status, navigate]);

  useEffect(() => {
    if (!currentBooking?.payment_expires_at) {
      if (timeLeft <= 0) return;
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }

    const tick = () => {
      const expiresAt = new Date(currentBooking.payment_expires_at!).getTime();
      const secondsLeft = Math.floor((expiresAt - Date.now()) / 1000);
      setTimeLeft(Math.max(0, secondsLeft));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [currentBooking?.payment_expires_at]);

  const enabledMethods = paymentMethods.filter((m: PaymentMethod) => m.enabled);

  useEffect(() => {
    if (enabledMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(enabledMethods[0]);
    }
  }, [enabledMethods, selectedMethod]);

  if (!currentBooking) {
    return null;
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (uploading) return;
    if (!paymentRef.trim()) {
      setUploadError('Reference number is required');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      await bookingService.uploadPayment(
        currentBooking.id,
        screenshot,
        paymentRef.trim(),
        selectedMethod?.name      // ✅ NEW — save the method
      );
      navigate('/success');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyGcash = () => {
    const number = selectedMethod?.config?.account_number;
    if (!number) return;
    navigator.clipboard.writeText(number.replace(/\s/g, ''));
    setCopiedGcash(true);
    setTimeout(() => setCopiedGcash(false), 2000);
  };

  const copyReference = () => {
    navigator.clipboard.writeText(currentBooking.reference_code);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const isExpired = timeLeft <= 0;

  const displayNumber = selectedMethod?.config?.account_number || '';
  const displayAccountName =
    selectedMethod?.config?.account_name ||
    (selectedMethod?.type === 'gcash'
      ? settings?.gcash_account_name || APP_CONFIG.gcashAccountName
      : '');
  const methodName = selectedMethod?.name || 'GCash';
  const methodIcon = selectedMethod?.icon || 'Smartphone';
  const IconComponent = ICON_MAP[methodIcon] || Smartphone;

  const hasMultipleMethods = enabledMethods.length > 1;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-32 sm:pb-12">
        <Link
          to="/booking"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cream-muted transition hover:text-brand-blue-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Booking
        </Link>

        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">Checkout</h1>
          <p className="text-xs text-cream-muted sm:text-sm">
            Complete your payment to verify and secure your court slot
          </p>
        </div>

        <div className="grid gap-5 md:gap-6 lg:grid-cols-5">
          {/* Left column */}
          <div className="space-y-4 lg:col-span-3">
            {isInAppBrowser() && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  You're viewing this in {getInAppBrowserName() ?? 'an in-app'} browser. Tap{' '}
                  <strong>⋯</strong> (top right) and choose <strong>"Open in Browser"</strong> for
                  easier banking and receipt upload.
                </span>
              </div>
            )}

            {/* Payment Timer */}
            <div
              className={`card rounded-2xl border bg-forest-900/80 p-4 shadow-xl backdrop-blur-sm ${
                isExpired ? 'border-error/80' : 'border-forest-700/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isExpired ? 'bg-error/20 text-error' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-cream">
                      {isExpired ? 'Payment Window Expired' : 'Complete Payment In'}
                    </p>
                    <p className="text-[10px] text-cream-muted">Hold reservation duration: 15 mins</p>
                  </div>
                </div>
                <div
                  className={`font-display text-2xl font-extrabold tabular-nums sm:text-3xl ${
                    isExpired
                      ? 'text-error'
                      : timeLeft < 120
                        ? 'text-amber-400 animate-pulse'
                        : 'text-brand-blue-300'
                  }`}
                >
                  {formatCountdown(Math.max(timeLeft, 0))}
                </div>
              </div>
            </div>

            {/* ✅ FIX 1 — Payment Method Selector moved UP, before all details */}
            {hasMultipleMethods && (
              <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 shadow-xl backdrop-blur-sm">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                  Step 1 — Choose your payment method
                </p>
                <div className="flex flex-wrap gap-2">
                  {enabledMethods.map((method: PaymentMethod) => {
                    const Icon = ICON_MAP[method.icon] || Smartphone;
                    const isSelected = selectedMethod?.id === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method)}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? 'border-brand-blue-400 bg-brand-blue-500 text-white shadow-glow-blue'
                            : 'border-forest-700/90 bg-forest-950/60 text-cream-muted hover:border-brand-blue-400/50 hover:text-cream'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {method.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✅ FIX 2 — Confirmation banner */}
            {selectedMethod && (
              <div className="flex items-center gap-2 rounded-xl border border-brand-blue-500/40 bg-brand-blue-500/10 p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-blue-300" />
                <span className="text-cream-muted">
                  You selected:{' '}
                  <strong className="text-cream">{methodName}</strong> — make sure this matches
                  your app before sending money.
                </span>
              </div>
            )}

            {/* Dynamic Payment Instructions */}
            {selectedMethod && (
              <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-3.5">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                  <IconComponent className="h-4 w-4" />
                  Step 2 — {methodName} Payment Details
                </h2>

                {/* Instructions */}
                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-3.5 text-xs text-cream-muted space-y-2.5">
                  <p className="font-semibold text-cream text-[13px]">
                    How to pay with {methodName}
                  </p>

                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>
                      Open your <strong className="text-cream">{methodName}</strong> app on your
                      phone.
                    </li>
                    <li>
                      Tap <strong className="text-cream">Send Money</strong> or{' '}
                      <strong className="text-cream">Transfer</strong>.
                    </li>
                    <li>
                      Enter the account number shown below
                      {displayAccountName ? (
                        <>
                          {' '}under <strong className="text-cream">{displayAccountName}</strong>
                        </>
                      ) : null}
                      .
                    </li>
                    <li>
                      Send the <strong className="text-cream">exact amount</strong> shown in the
                      highlighted box — partial payments won't be accepted.
                    </li>
                    <li>
                      Copy the <strong className="text-cream">reference number</strong> from your
                      receipt.
                    </li>
                    <li>
                      Paste it into the <strong className="text-cream">Reference Number</strong>{' '}
                      field below. Optionally attach a screenshot.
                    </li>
                    <li>
                      Tap <strong className="text-cream">Submit Payment Verification</strong>.
                      Your booking will be confirmed shortly.
                    </li>
                  </ol>

                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-brand-blue-500/30 bg-brand-blue-500/10 p-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-blue-300" />
                    <p className="text-[11px] text-cream-muted leading-relaxed">
                     <strong className="text-brand-blue-200">Transparency notice:</strong>{' '}
Paddle Place uses <strong className="text-cream">{methodName}</strong> as one
of our official payment methods. The account details shown below are
verified and belong to our business. If anything looks different, please
contact us before sending any money.
                    </p>
                  </div>
                </div>

                {displayNumber && (
                  <div className="flex items-center justify-between rounded-xl border border-forest-700/80 bg-forest-950/70 p-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                        Send to account
                      </p>
                      <p className="font-display text-base font-bold text-cream tracking-wide">
                        {displayNumber}
                      </p>
                      {displayAccountName && (
                        <p className="text-xs font-medium text-brand-blue-200">
                          {displayAccountName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={copyGcash}
                      className="rounded-lg border border-forest-600 bg-forest-800 p-2 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300 active:scale-95"
                      title="Copy Account Number"
                    >
                      {copiedGcash ? (
                        <CheckCircle2 className="h-4 w-4 text-accentGreen-300" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {!displayNumber && displayAccountName && (
                  <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                      Account Name
                    </p>
                    <p className="font-display text-base font-bold text-cream">
                      {displayAccountName}
                    </p>
                  </div>
                )}

                {selectedMethod.config?.qr_image_url && (
                  <div className="flex justify-center pt-1 pb-1">
                    <div className="rounded-2xl border border-forest-700/80 bg-forest-950/90 p-4 text-center shadow-lg">
                      <img
                        src={selectedMethod.config.qr_image_url}
                        alt={`${methodName} QR Code`}
                        className="h-36 w-36 object-contain mx-auto rounded-lg"
                      />
                      <p className="mt-2 text-[11px] font-medium text-cream-muted">
                        Scan with your banking or e-wallet app
                      </p>
                    </div>
                  </div>
                )}

                {/* ✅ Amount box — moved here, above the ref input */}
                <div className="flex items-center justify-between rounded-xl border border-brand-blue-500/40 bg-brand-blue-500/15 px-4 py-3">
                  <span className="text-xs font-medium text-cream-muted">
                    Exact Amount to Send
                  </span>
                  <span className="font-display text-xl font-extrabold text-brand-blue-300">
                    {formatCurrency(currentBooking.total_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-forest-700/80 bg-forest-950/70 px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cream-muted">Booking Ref:</span>
                    <span className="font-mono text-sm font-bold text-brand-blue-300">
                      {currentBooking.reference_code}
                    </span>
                  </div>
                  <button
                    onClick={copyReference}
                    className="rounded-lg border border-forest-600 bg-forest-800 p-1.5 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300 active:scale-95"
                    title="Copy Reference"
                  >
                    {copiedRef ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-accentGreen-300" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-brand-blue-500/30 bg-brand-blue-500/10 p-3 text-xs text-cream-muted leading-relaxed">
                  <strong className="font-semibold text-brand-blue-200">
                    Keep your reference code safe.
                  </strong>{' '}
                  If this tab reloads or closes, retrieve your progress anytime at{' '}
                  <Link
                    to="/track"
                    className="font-semibold text-brand-blue-300 underline hover:text-brand-blue-200"
                  >
                    Track My Booking
                  </Link>
                  .
                </div>

                {selectedMethod.config?.instructions && (
                  <details className="group rounded-xl border border-forest-800 bg-forest-950/50 p-3 text-xs text-cream-muted">
                    <summary className="cursor-pointer list-none font-semibold text-cream flex items-center justify-between">
                      <span>Additional instructions from {methodName}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-cream-muted transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                      {selectedMethod.config.instructions}
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* Reference Number Input */}
            <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                Step 3 — Payment Reference Number <span className="text-error">*</span>
              </h2>

              <div className="mt-2">
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. 1002 9384 1928"
                  className="w-full rounded-xl border border-forest-700/80 bg-forest-950/60 px-4 py-2.5 text-sm text-cream placeholder-cream-muted/40 transition-all focus:border-brand-blue-400 focus:bg-forest-900/60 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
                />
                <p className="mt-1.5 text-[11px] text-cream-muted">
                  Paste the reference number from your {methodName} receipt
                </p>
              </div>

              {uploadError && uploadError.includes('Reference number') && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs text-error font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {uploadError}
                </div>
              )}
            </div>

            {/* Screenshot Upload */}
            <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
              <h2 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                <Upload className="h-3.5 w-3.5" />
                Step 4 — Upload Receipt Screenshot (Optional)
              </h2>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                  dragOver
                    ? 'border-brand-blue-400 bg-brand-blue-500/10'
                    : screenshot
                      ? 'border-accentGreen-500/60 bg-accentGreen-500/10'
                      : 'border-forest-700 hover:border-brand-blue-400/50 hover:bg-forest-950/40'
                }`}
              >
                {screenshot ? (
                  <div className="flex items-center gap-3.5">
                    <img
                      src={screenshot}
                      alt="Payment screenshot"
                      className="h-16 w-16 rounded-lg object-contain border border-forest-700 bg-forest-950"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-bold text-accentGreen-300">Receipt Attached ✓</p>
                      <button
                        onClick={() => setScreenshot(null)}
                        className="mt-1 text-[11px] text-cream-muted underline hover:text-error transition"
                      >
                        Remove file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <ImageIcon className="h-8 w-8 text-cream-muted/40" />
                    <p className="mt-1 text-xs text-cream-muted">Drag receipt here or browse</p>
                    <label className="mt-2.5 inline-block cursor-pointer">
                      <span className="rounded-xl border border-brand-blue-400/40 bg-brand-blue-500/20 px-3.5 py-1.5 text-xs font-semibold text-brand-blue-300 transition hover:bg-brand-blue-500 hover:text-white">
                        Browse Files
                      </span>
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
                  </div>
                )}
              </div>

              {uploadError && !uploadError.includes('Reference number') && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs text-error font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {uploadError}
                </div>
              )}

              <Button
                size="lg"
                fullWidth
                className="mt-4 hidden sm:flex"
                isLoading={uploading}
                disabled={!paymentRef.trim() || isExpired}
                onClick={handleUpload}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Submit Payment Verification
              </Button>

              {isExpired && (
                <p className="mt-2.5 hidden text-center text-xs font-semibold text-error sm:block">
                  Time expired. Return to court selection to restart booking.
                </p>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 card rounded-2xl border border-forest-700/80 bg-forest-900/90 p-4 sm:p-5 shadow-xl">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between lg:hidden"
              >
                <h2 className="font-display text-base font-bold text-cream">Order Summary</h2>
                <div className="flex items-center gap-2 text-cream-muted">
                  <span className="text-sm font-bold text-brand-blue-300">
                    {formatCurrency(currentBooking.total_amount)}
                  </span>
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              <h2 className="hidden font-display text-base font-bold text-cream lg:block">
                Order Summary
              </h2>

              <div className={`mt-3.5 space-y-3 ${showDetails ? 'block' : 'hidden lg:block'}`}>
                <div className="rounded-xl border border-forest-700/60 bg-forest-950/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cream-muted">Court</span>
                    <span className="font-semibold text-cream">{currentBooking.court_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cream-muted">Date</span>
                    <span className="font-semibold text-cream">
                      {formatDateLong(currentBooking.date)}
                    </span>
                  </div>
                  {selectedMethod && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream-muted">Payment</span>
                      <span className="font-semibold text-brand-blue-300">{methodName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                    Time Slots
                  </p>
                  {currentBooking.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg bg-forest-800/70 px-3 py-2 text-xs"
                    >
                      <span className="text-cream">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-forest-700/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cream-muted">Total Due</span>
                    <span className="font-display text-2xl font-extrabold text-brand-blue-300">
                      {formatCurrency(currentBooking.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-forest-800 bg-forest-950/40 p-3 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream-muted mb-1">
                    Booker
                  </p>
                  <p className="font-semibold text-cream">{currentBooking.customer.name}</p>
                  <p className="text-cream-muted text-[11px]">{currentBooking.customer.email}</p>
                </div>

                <button
                  onClick={() => {
                    reset();
                    navigate('/booking');
                  }}
                  className="mt-2 w-full text-center text-[11px] text-cream-muted underline transition hover:text-error"
                >
                  Cancel booking & release slots
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIX 4 — Sticky mobile bar shows the selected method */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-500 bg-charcoal/95 p-3.5 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-cream-muted">
              {isExpired ? 'Payment window expired' : `via ${methodName}`}
            </p>
            <p className="text-sm font-bold text-brand-blue-300">
              {formatCurrency(currentBooking.total_amount)}
            </p>
          </div>
          <Button
            size="md"
            isLoading={uploading}
            disabled={!paymentRef.trim() || isExpired}
            onClick={handleUpload}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            className="shrink-0"
          >
            Submit
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}