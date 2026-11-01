// src/pages/legal/RefundPolicy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ArrowLeft,
  Clock,
  Mail,
  Facebook,
  ShieldAlert,
  HelpCircle,
  Ban,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function RefundPolicy() {
  useEffect(() => {
    document.title = `Refund & Cancellation Policy | ${APP_CONFIG.name}`;
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
              <RotateCcw className="h-6 w-6 text-primary-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Refund & Cancellation Policy
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

          <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/25 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose-400" />
              <div>
                <h2 className="text-lg font-bold text-rose-400">No Cancellation Policy</h2>
                <p className="mt-2 text-sm leading-relaxed text-cream-muted">
                  <strong className="text-cream">
                    Confirmed bookings are non-cancellable and non-refundable.
                  </strong>{' '}
                  Please make sure you can attend before booking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Ban className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">If You Cannot Attend</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                If you cannot attend your confirmed booking, you may arrange for someone else to
                take your slot. You are responsible for settling payment directly with them. Our
                facility is not involved in any payment disputes between players.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <h2 className="text-lg font-bold text-cream">Facility-Initiated Cancellations</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>Paddle Place reserves the right to cancel or reschedule bookings due to:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>Facility maintenance</li>
                  <li>Safety concerns</li>
                  <li>Force majeure events</li>
                </ul>
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                  <p className="text-xs text-cream-muted">
                    If we cancel your booking for the reasons above, we will contact you directly
                    to arrange a refund or reschedule.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Need Help?</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                If you have questions about our cancellation policy, please contact us:
              </p>
              <div className="mt-3 space-y-2 text-sm text-cream-muted">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary-300" />
                  <a
                    href="mailto:paddleplace26@gmail.com"
                    className="hover:text-primary-300 transition"
                  >
                    paddleplace26@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 shrink-0 text-primary-300" />
                  <a
                    href="https://www.facebook.com/profile.php?id=61590660253911"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-300 transition"
                  >
                    Paddle Place
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}