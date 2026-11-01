// src/pages/legal/Privacy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Lock,
  Eye,
  Database,
  Share2,
  RefreshCw,
  Mail,
  FileText,
  ShieldAlert,
  KeyRound,
  Clock,
  ServerCog,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function Privacy() {
  useEffect(() => {
    document.title = `Privacy Policy | ${APP_CONFIG.name}`;
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
              <Shield className="h-6 w-6 text-primary-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Privacy Policy
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
                <FileText className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Introduction</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Paddle Place ("we," "our," or "us") is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, store, and protect your personal
                information when you use our booking system and facility. It is written in
                accordance with the Philippine Data Privacy Act of 2012 (RA 10173).
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Eye className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-cream-muted">
                <div>
                  <h3 className="font-semibold text-cream">Personal Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>
                      <strong className="text-cream">Name:</strong> Full name for booking
                      identification
                    </li>
                    <li>
                      <strong className="text-cream">Email address:</strong> For booking
                      confirmations and updates
                    </li>
                    <li>
                      <strong className="text-cream">Mobile number:</strong> For urgent
                      booking-related contact
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-cream">Booking &amp; Payment Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>Dates, times, and courts you've booked</li>
                    <li>Payment reference number and screenshots for verification</li>
                    <li>Notes you provide with your booking</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-cream">Security &amp; Technical Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>
                      IP address (kept in raw form for 30 days, then converted to a one-way
                      hash for long-term security correlation)
                    </li>
                    <li>Browser user-agent string</li>
                    <li>
                      Security event logs (login attempts, password changes, rate-limit hits,
                      admin actions) — used solely to protect our customers and facility
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Database className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">How We Use Your Information</h2>
              </div>
              <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm leading-relaxed text-cream-muted">
                <li>To process reservations and communicate booking-related updates</li>
                <li>To verify your payment and confirm your reservation</li>
                <li>To maintain records for accounting and tax purposes</li>
                <li>
                  To prevent fraud, detect abuse, and enforce our{' '}
                  <Link to="/terms" className="text-primary-300 underline">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>To investigate suspected fraudulent payment submissions</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Lock className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">
                  Security &amp; Data Protection
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <div className="flex items-start gap-2.5">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <p>
                    <strong className="text-cream">Passwords</strong> are hashed with BCrypt
                    before storage. We never store or transmit plaintext passwords. Account
                    lockout is enabled: after 5 consecutive failed login attempts, the account
                    is temporarily locked for 15 minutes.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <p>
                    <strong className="text-cream">Payment data:</strong> we do not store card
                    numbers. Payments are made via GCash, bank transfer, or cash, and are
                    verified manually by our staff. Screenshots you upload are stored only to
                    verify your booking.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <ServerCog className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <p>
                    <strong className="text-cream">Rate limiting:</strong> our booking, login,
                    and tracking endpoints are rate-limited per IP to prevent abuse. Requests
                    that exceed the limit are logged.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <p>
                    <strong className="text-cream">Security event logs:</strong> we record
                    security-relevant events — login attempts (success/failure), account
                    lockouts, password reset requests, booking creation, staff management
                    actions, and rate-limit hits. Each event stores the IP address, browser
                    user-agent, and a timestamp. Raw IP addresses are automatically purged
                    after 30 days; a one-way hash of the IP is retained for abuse correlation.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                  <p>
                    <strong className="text-cream">Access control:</strong> only authorized
                    staff and administrators can access your booking and payment information.
                    Administrative actions are logged.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Share2 className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Information Sharing</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p className="font-semibold text-cream">
                  We do not sell or disclose your personal information to third parties for
                  commercial purposes.
                </p>
                <p>We may share your information only in these limited circumstances:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Data processors:</strong> we use third-party
                    services to operate the booking system — Supabase (database and file
                    storage), Brevo (transactional email), Render (backend hosting), Vercel
                    (frontend hosting), and Cloudflare (network). These providers process data
                    only on our instructions.
                  </li>
                  <li>
                    <strong className="text-cream">Legal requirements:</strong> if required by
                    law, court order, or government request
                  </li>
                  <li>
                    <strong className="text-cream">Facility operations:</strong> staff members
                    who need your information to manage your booking
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Data Retention</h2>
              </div>
              <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm leading-relaxed text-cream-muted">
                <li>
                  <strong className="text-cream">Booking records:</strong> retained
                  indefinitely for accounting, tax, and dispute-resolution purposes
                </li>
                <li>
                  <strong className="text-cream">Payment screenshots:</strong> retained with
                  the booking record
                </li>
                <li>
                  <strong className="text-cream">Raw IP addresses:</strong> purged after 30
                  days
                </li>
                <li>
                  <strong className="text-cream">Hashed IPs and security events:</strong>{' '}
                  retained for 1 year, then deleted
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Shield className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Your Rights</h2>
              </div>
              <p className="mb-2 text-sm leading-relaxed text-cream-muted">
                Under the Philippine Data Privacy Act (RA 10173), you have the right to:
              </p>
              <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm leading-relaxed text-cream-muted">
                <li>
                  <strong className="text-cream">Be informed</strong> of how your data is
                  collected and used
                </li>
                <li>
                  <strong className="text-cream">Access</strong> the personal data we hold
                  about you
                </li>
                <li>
                  <strong className="text-cream">Correct</strong> any inaccurate information
                </li>
                <li>
                  <strong className="text-cream">Object</strong> to processing in certain
                  circumstances
                </li>
                <li>
                  <strong className="text-cream">Request deletion</strong> of your personal
                  data (subject to legal retention requirements)
                </li>
                <li>
                  <strong className="text-cream">Complain</strong> to the National Privacy
                  Commission (NPC) if you believe your rights have been violated
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-cream-muted">
                To exercise any of these rights, contact us at the email below.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Changes to This Policy</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                We may update this Privacy Policy from time to time. Material changes will be
                communicated via email or a notice on our website. Your continued use of our
                services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="rounded-2xl border border-primary-400/30 bg-primary-600/20 p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-bold text-cream">Contact Us</h2>
              <p className="mb-2 text-sm leading-relaxed text-cream-muted">
                For privacy-related questions or to exercise your data rights:
              </p>
              <ul className="space-y-2 text-sm text-cream-muted">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary-300" />
                  <span>paddleplace26@gmail.com</span>
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