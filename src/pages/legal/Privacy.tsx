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
  Facebook,
  FileText,
  Users,
  Server,
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
                information when you use our booking system and facility. This policy complies with
                the Philippine Data Privacy Act of 2012 (RA 10173).
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
                  <h3 className="font-semibold text-cream">Booking & Payment Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>Dates, times, and courts you've booked</li>
                    <li>Payment reference number and screenshots for verification</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-cream">Technical Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>
                      <strong className="text-cream">IP address:</strong> Logged for security and
                      fraud prevention under our legitimate interest as data controller (Data
                      Privacy Act §12(f)) — retained 30 days raw, then hashed and retained for
                      audit correlation
                    </li>
                    <li>
                      <strong className="text-cream">User agent:</strong> Browser identification
                      for security event correlation
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
                <li>To prevent fraud, abuse, and unauthorized access</li>
                <li>To comply with legal obligations</li>
              </ul>
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
                <p>We may only share your information in these limited circumstances:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Data processors:</strong> Third-party service
                    providers who process data on our behalf (see below)
                  </li>
                  <li>
                    <strong className="text-cream">Legal requirements:</strong> If required by law,
                    court order, or government request — including reporting suspected fraud to
                    law enforcement (e.g. PNP-ACG) with the IP address and associated booking data
                  </li>
                  <li>
                    <strong className="text-cream">Facility operations:</strong> Staff members who
                    need your information to manage your booking
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Server className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">Data Processors</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                We use the following third-party service providers to operate our booking system.
                These providers process your data only as necessary to deliver their service to us,
                under contractual obligations to protect it:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-sm text-cream-muted">
                <li>
                  <strong className="text-cream">Supabase</strong> — database and file storage
                  (booking records, payment screenshots)
                </li>
                <li>
                  <strong className="text-cream">Render</strong> — application hosting (backend)
                </li>
                <li>
                  <strong className="text-cream">Vercel</strong> — frontend hosting
                </li>
                <li>
                  <strong className="text-cream">Brevo</strong> — transactional email delivery
                  (booking confirmations, password resets)
                </li>
                <li>
                  <strong className="text-cream">Cloudflare</strong> — CDN, DDoS protection, and
                  request routing
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Lock className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">How We Store & Protect Your Data</h2>
              </div>
              <ul className="list-inside list-disc space-y-2 pl-2 text-sm leading-relaxed text-cream-muted">
                <li>
                  <strong className="text-cream">Encryption in transit:</strong> All traffic uses
                  HTTPS/TLS. Our servers send HSTS headers to enforce HTTPS.
                </li>
                <li>
                  <strong className="text-cream">Password security:</strong> Passwords are hashed
                  with BCrypt (work factor 11). We never store passwords in plaintext.
                </li>
                <li>
                  <strong className="text-cream">Account lockout:</strong> 5 failed login attempts
                  trigger a 15-minute account lockout.
                </li>
                <li>
                  <strong className="text-cream">Rate limiting:</strong> Login, booking, tracking,
                  and upload endpoints are rate-limited to prevent brute-force and abuse.
                </li>
                <li>
                  <strong className="text-cream">Access control:</strong> Only authorized staff and
                  administrators can access booking and payment information, and only for their own
                  tenant.
                </li>
                <li>
                  <strong className="text-cream">Security event logging:</strong> Login failures,
                  password resets, tenant access, rate-limit hits, and other security-relevant
                  events are logged for audit and abuse prevention. Logs include IP address (30-day
                  raw retention, permanent hashed retention), user agent, and event metadata.
                </li>
                <li>
                  <strong className="text-cream">No card data:</strong> We do not collect or store
                  credit card numbers. Payments are made via GCash or bank transfer and verified
                  manually by our staff from the reference number and screenshot you provide.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Users className="h-5 w-5 shrink-0 text-primary-300" />
                <h2 className="text-lg font-bold text-cream">
                  Your Rights Under the Data Privacy Act
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the following
                rights:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-sm text-cream-muted">
                <li>
                  <strong className="text-cream">Right to be informed</strong> — know what data we
                  collect and why
                </li>
                <li>
                  <strong className="text-cream">Right to object</strong> — object to processing of
                  your data
                </li>
                <li>
                  <strong className="text-cream">Right to access</strong> — obtain a copy of your
                  personal data
                </li>
                <li>
                  <strong className="text-cream">Right to rectification</strong> — correct
                  inaccurate data
                </li>
                <li>
                  <strong className="text-cream">Right to erasure or blocking</strong> — request
                  deletion where legally permissible
                </li>
                <li>
                  <strong className="text-cream">Right to damages</strong> — claim compensation for
                  damages caused by unlawful processing
                </li>
                <li>
                  <strong className="text-cream">Right to file a complaint</strong> — with the
                  National Privacy Commission (NPC)
                </li>
                <li>
                  <strong className="text-cream">Right to data portability</strong> — receive your
                  data in a machine-readable format
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
              <ul className="space-y-2 text-sm text-cream-muted">
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