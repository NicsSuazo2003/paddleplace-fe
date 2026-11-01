// src/pages/ResetPassword.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiRequest, ApiError } from '@/services/api';
import { COURT_IMAGES } from '@/utils/constants';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If no token in URL, fail immediately
  useEffect(() => {
    if (!token) {
      setError(
        'This reset link is invalid. Please request a new one from the login page.'
      );
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2200);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A2629]">
      <div className="absolute inset-0">
        <img src={COURT_IMAGES.hero} alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061A1C]/95 via-[#0A2629]/90 to-[#115259]/60" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-[#B6DAC8] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#0C3236]/80 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
        >
          <div className="mb-7 text-center">
            <Link
              to="/"
              aria-label="Paddle Place Home"
              className="inline-flex flex-col items-center leading-none transition hover:opacity-90"
            >
              <span className="font-display text-3xl font-black tracking-tight text-white">
                Paddle <span className="text-[#B6DAC8]">Place</span>
              </span>
              <span className="font-sans text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#B6DAC8]/80 mt-1.5">
                Pickleball &amp; Table Tennis
              </span>
            </Link>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B6DAC8]">
              <Shield className="h-3.5 w-3.5 text-[#B6DAC8]" />
              Reset Password
            </div>
            <p className="mt-1 text-xs text-white/60">
              Choose a new password for your account.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#B6DAC8]" />
              <p className="text-sm font-semibold text-white">Password updated</p>
              <p className="text-xs text-white/60">
                Redirecting to sign in…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4 text-white/40" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={!token}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4 text-white/40" />}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={!token}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs sm:text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={loading}
                disabled={!token}
                className="mt-2 bg-[#B6DAC8] text-[#0C3236] font-bold hover:bg-white shadow-lg transition-all"
                leftIcon={<Shield className="h-5 w-5" />}
              >
                Set New Password
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}