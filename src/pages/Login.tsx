import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { COURT_IMAGES } from '@/utils/constants';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated, initializing } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';

  useEffect(() => {
    // Wait for init() to resolve before deciding whether to redirect
    if (!initializing && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, initializing, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password');
      return;
    }
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setFormError('Invalid email or password');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A2629]">
      {/* Background Image & Tone Overlays */}
      <div className="absolute inset-0">
        <img
          src={COURT_IMAGES.hero}
          alt=""
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061A1C]/95 via-[#0A2629]/90 to-[#115259]/60" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-[#B6DAC8] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Dark Glassmorphism Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#0C3236]/80 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
        >
          {/* Brand Header */}
          <div className="mb-7 text-center">
            <Link to="/" aria-label="Paddle Place Home" className="inline-flex flex-col items-center leading-none transition hover:opacity-90">
              <span className="font-display text-3xl font-black tracking-tight text-white">
                Paddle <span className="text-[#B6DAC8]">Place</span>
              </span>
              <span className="font-sans text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#B6DAC8]/80 mt-1.5">
                Pickleball &amp; Table Tennis
              </span>
            </Link>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B6DAC8]">
              <Shield className="h-3.5 w-3.5 text-[#B6DAC8]" />
              Admin Portal
            </div>
            <p className="mt-1 text-xs text-white/60">Sign in to manage bookings &amp; courts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@paddleplace.com"
              leftIcon={<Mail className="h-4 w-4 text-white/40" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4 text-white/40" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {(formError || error) && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs sm:text-sm text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError ?? error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={loading}
              className="mt-2 bg-[#B6DAC8] text-[#0C3236] font-bold hover:bg-white shadow-lg transition-all"
              leftIcon={<Shield className="h-5 w-5" />}
            >
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}