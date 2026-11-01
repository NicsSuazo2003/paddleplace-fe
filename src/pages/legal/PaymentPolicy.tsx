// src/pages/legal/PaymentPolicy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowLeft,
  AlertTriangle,
  ListChecks,
  XCircle,
  ShieldAlert,
  Banknote,
  Clock,
  Mail,
  Facebook,
  HelpCircle,
  Search,
  FileWarning,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function PaymentPolicy() {
  useEffect(() => {
    document.title = `Payment & Verification Policy | ${APP_CONFIG.name}`;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-16">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-cream-muted transition hover:text-primary-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary-400/30 bg-primary-600/30">
              <Wallet className="h-6 w-6 text-primary-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Payment & Verification Policy
              </h1>
              <p className="text-xs text-cream-muted sm:text-sm">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-PH', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Search className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">How Payment Verification Works</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Paddle Place uses{' '}
                  <strong className="text-cream">manual payment verification</strong>. This means a
                  real person on our staff checks your payment before confirming your booking.
                </p>
                <div className="rounded-xl border border-neutral-700 bg-neutral-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 shrink-0 text-primary-300" />
                    <h3 className="font-semibold text-cream">The verification process:</h3>
                  </div>
                  <ol className="mt-2 list-inside list-decimal space-y-1.5 pl-2">
                    <li>You send payment using one of our accepted methods</li>
                    <li>
                      You submit your payment reference number (and optionally a screenshot)
                    </li>
                    <li>Our staff checks that the amount and reference match what we received</li>
                    <li>If everything matches, your booking is confirmed via email</li>
                    <li>If there's an issue, we contact you to resolve it</li>
                  </ol>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <p>
                    <strong className="text-cream">Verification time:</strong> During business
                    hours, verification typically takes 1–4 hours. Bookings submitted outside
                    business hours will be verified the next business day.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <ListChecks className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Payment Rules</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-2.5 pl-2">
                  <li>
                    <strong className="text-cream">Exact amount:</strong> You must send the exact
                    amount shown at checkout. Partial payments are not accepted and will delay or
                    cancel your booking.
                  </li>
                  <li>
                    <strong className="text-cream">Payment window:</strong> Your slots are held for{' '}
                    {Math.round(APP_CONFIG.paymentTimerSeconds / 60)} minutes. Payment must be
                    submitted within this window.
                  </li>
                  <li>
                    <strong className="text-cream">One payment per booking:</strong> Send one
                    payment for the full amount. Do not split payments across multiple transactions.
                  </li>
                  <li>
                    <strong className="text-cream">Reference number required:</strong> You must
                    submit the reference number from your payment receipt. Your booking code is NOT
                    the same as your payment reference number.
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <FileWarning className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Common Payment Issues</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-cream-muted">
                <div className="rounded-xl border border-neutral-700 bg-neutral-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 shrink-0 text-amber-400" />
                    <h3 className="font-semibold text-cream">Reference number doesn't match</h3>
                  </div>
                  <p className="mt-1.5">
                    If the reference number you submitted doesn't match any payment we received, we
                    will contact you within 24 hours. Your booking will be held for 24 hours while
                    we resolve the issue.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-700 bg-neutral-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    <h3 className="font-semibold text-cream">Wrong amount sent</h3>
                  </div>
                  <p className="mt-1.5">
                    If you sent the wrong amount, contact us immediately. We may be able to:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                    <li>Apply the payment and request the balance, or</li>
                    <li>Refund the incorrect amount and ask you to rebook</li>
                  </ul>
                  <p className="mt-1.5 text-xs">
                    In most cases, you'll need to rebook with the correct amount.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-700 bg-neutral-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                    <h3 className="font-semibold text-cream">
                      Payment sent after timer expired
                    </h3>
                  </div>
                  <p className="mt-1.5">
                    If you sent payment after your hold expired, your booking may already be
                    cancelled. Contact us with your reference number. If the slot is still
                    available, we may be able to confirm your booking. If not, we'll issue a refund
                    within 3–5 business days.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-900/50 bg-rose-950/25 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                    <h3 className="font-semibold text-cream">Fake or manipulated screenshots</h3>
                  </div>
                  <p className="mt-1.5 text-rose-400">
                    <strong>Fraudulent payment submissions are taken seriously.</strong>
                  </p>
                  <p className="mt-1.5">
                    If we determine that a payment screenshot or reference number has been
                    manipulated or is fake:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                    <li>Your booking will be immediately cancelled</li>
                    <li>You will be permanently banned from booking with us</li>
                    <li>We may report the incident to authorities</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Banknote className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Accepted Payment Methods</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>We accept the following payment methods:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>GCash</li>
                  <li>Bank transfer (InstaPay/PESONet)</li>
                  <li>Cash (in-person only, for walk-in bookings)</li>
                </ul>
                <p className="mt-3 text-xs">
                  Payment details are shown at checkout. Always verify the account name and number
                  match what's shown on our website before sending money.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-primary-400/30 bg-primary-600/20 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Need Help?</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                If you have any questions about payments or verification:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-cream-muted">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary-300" />
                  <a
                    href="mailto:paddleplace26@gmail.com"
                    className="hover:text-primary-300 transition"
                  >
                    paddleplace26@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Facebook className="h-4 w-4 shrink-0 text-primary-300" />
                  <a
                    href="https://www.facebook.com/profile.php?id=61590660253911"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-300 transition"
                  >
                    Paddle Place
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}