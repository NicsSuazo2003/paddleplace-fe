// src/pages/legal/Terms.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Mail,
  Facebook,
  MapPin,
  AlertTriangle,
  CalendarCheck,
  Ban,
  ShieldAlert,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function Terms() {
  useEffect(() => {
    document.title = `Terms & Conditions | ${APP_CONFIG.name}`;
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
              <FileText className="h-6 w-6 text-primary-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Terms & Conditions
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
              <p className="text-sm leading-relaxed text-cream-muted">
                Please read these Terms & Conditions carefully before booking a court or using the
                facilities of Paddle Place. These terms govern your use of our facilities and online
                booking services.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">1. Acceptance of Terms</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                By using our facilities or booking platform, you agree to comply with these Terms &
                Conditions. If you do not agree to these terms, please do not proceed with your
                reservation.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">2. Court Bookings</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                All court reservations are subject to availability. A booking is confirmed only upon
                receipt of a confirmation email. Paddle Place reserves the right to cancel or
                reschedule bookings due to facility maintenance, safety concerns, or force majeure
                events.
              </p>
            </section>

            <section className="rounded-2xl border border-rose-900/50 bg-rose-950/25 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Ban className="h-5 w-5 shrink-0 text-rose-400" />
                <h2 className="text-lg font-bold text-rose-400">3. No Cancellation Policy</h2>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <p className="font-bold text-rose-400">ALL BOOKINGS ARE FINAL.</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-cream-muted">
                    Confirmed bookings are non-cancellable and non-refundable. If you cannot attend,
                    you may arrange for someone else to take your slot and settle payment directly
                    with them.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Users className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">4. Walk-in Policy</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Walk-ins are welcome, subject to court availability. Advance online booking is
                recommended, especially during peak hours, to secure your preferred time slot.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">5. Player Conduct</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                All players must treat staff, fellow players, and the facility with respect. Paddle
                Place reserves the right to remove anyone displaying disruptive, unsafe, or
                inappropriate behavior without a refund.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">6. Facility Rules</h2>
              </div>
              <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm leading-relaxed text-cream-muted">
                <li>Players must wear non-marking athletic shoes at all times.</li>
                <li>Food and beverages are not allowed on the court surface.</li>
                <li>
                  All players must observe proper court etiquette and respect their reserved playing
                  time.
                </li>
                <li>
                  The use of loudspeakers and excessive shouting are prohibited, especially after
                  10:00 PM, to maintain a peaceful environment for nearby residents.
                </li>
                <li>
                  Pets are not allowed in the court playing area or courtside but are permitted in
                  the designated waiting area.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">7. Equipment & Property</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                By making a booking, the booking party agrees to be financially responsible for any
                damage to the facility or rental equipment caused by negligence, misuse, or willful
                misconduct by themselves or any individual included in the booking. Repair or
                replacement costs will be assessed by facility management and must be paid in full by
                the booking party.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">8. Medical Fitness</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                All participants acknowledge their responsibility to ensure they are physically fit
                to play, recognize their health limitations, and obtain medical clearance when
                necessary.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">
                  9. Liability Waiver, Release & Indemnity
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Pickleball is a physical sport that carries inherent risks of injury. By making a
                reservation or using our facilities, the booking party and all participants
                acknowledge these risks and agree, to the extent permitted by law, to release and
                hold harmless Paddle Place, its owners, and employees from claims or liabilities
                arising from personal injury, property damage, or death related to the use of the
                facility.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Users className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">10. Minors (Under 18)</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Minors must be accompanied by a parent or legal guardian throughout their visit. The
                parent or legal guardian is responsible for the minor's safety, conduct, and
                compliance with these Terms & Conditions while using the facility. The parent or
                legal guardian must ensure that the minor follows all facility rules.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <FileText className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">11. Privacy</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Personal information collected during booking, such as your name, email address, and
                phone number, is used only to process reservations and communicate booking-related
                updates. We do not sell or disclose your personal information to third parties for
                commercial purposes. See our Privacy Policy for full details.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">12. Changes to Terms</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Paddle Place reserves the right to modify or update these Terms and Conditions at any
                time. Continued use of our facilities or booking platform constitutes acceptance of
                the revised terms.
              </p>
            </section>

            <section className="rounded-2xl border border-primary-400/30 bg-primary-600/20 p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-bold text-cream">Questions?</h2>
              <p className="text-sm leading-relaxed text-cream-muted">
                If you have any questions about these Terms & Conditions, please contact us:
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