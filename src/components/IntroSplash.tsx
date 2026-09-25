import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'pp_intro_shown';

const BRAND_TEAL = '#115259';
const BRAND_LIGHT = '#F8FAF9';

interface IntroSplashProps {
  onComplete?: () => void;
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  const [phase, setPhase] = useState<'intro' | 'ready' | 'smashing' | 'exited'>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) ? 'exited' : 'intro'
  );

  useEffect(() => {
    if (phase === 'exited') {
      onComplete?.();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'true');

    const readyTimer = setTimeout(() => setPhase('ready'), 2000);

    // Auto-proceed if unattended after 5.5s
    const autoSmashTimer = setTimeout(() => {
      setPhase((curr) => (curr === 'ready' || curr === 'intro' ? 'smashing' : curr));
    }, 5500);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(autoSmashTimer);
    };
  }, [phase, onComplete]);

  const handleInteraction = () => {
    if (phase === 'smashing' || phase === 'exited') return;
    setPhase('smashing');
  };

  const isSmashing = phase === 'smashing';

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {phase !== 'exited' && (
        <motion.div
          onClick={handleInteraction}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[#F8FAF9] select-none overflow-hidden"
          role="button"
          aria-label="Click to enter"
        >
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700;900&family=Montserrat:wght@800;900&display=swap');`}
          </style>

          {/* Screen Camera Shake on Smash */}
          <motion.div
            className="w-full flex flex-col items-center justify-center px-4"
            animate={
              isSmashing
                ? {
                    x: [0, -16, 16, -8, 8, -3, 0],
                    y: [0, 12, -12, 6, -6, 2, 0],
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
          >
            <svg
              viewBox="0 0 860 440"
              className="w-[min(92vw,640px)] overflow-visible drop-shadow-[0_12px_28px_rgba(17,82,89,0.08)]"
            >
              <defs>
                <filter id="ballGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Chunky Wordmark: PADDLE */}
              <motion.g
                initial={{ opacity: 0, y: -25 }}
                animate={
                  isSmashing
                    ? { opacity: 0, scale: 0.95 }
                    : { opacity: 1, y: 0 }
                }
                transition={
                  isSmashing
                    ? { duration: 0.2 }
                    : { delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <text
                  x="430"
                  y="160"
                  textAnchor="middle"
                  fill={BRAND_TEAL}
                  style={{
                    fontFamily: "'Fredoka', 'Montserrat', system-ui, sans-serif",
                    fontWeight: 900,
                    fontSize: '155px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  PADDLE
                </text>
              </motion.g>

              {/* 2. Chunky Wordmark: PLACE */}
              <motion.g
                initial={{ opacity: 0, y: 25 }}
                animate={
                  isSmashing
                    ? { opacity: 0, scale: 0.95 }
                    : { opacity: 1, y: 0 }
                }
                transition={
                  isSmashing
                    ? { duration: 0.2 }
                    : { delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <text
                  x="430"
                  y="300"
                  textAnchor="middle"
                  fill={BRAND_TEAL}
                  style={{
                    fontFamily: "'Fredoka', 'Montserrat', system-ui, sans-serif",
                    fontWeight: 900,
                    fontSize: '155px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  PLACE
                </text>
              </motion.g>

              {/* 3. Ball inside 'C' (Rotates & Launches on Click) */}
              {!isSmashing ? (
                <motion.g
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.65,
                    duration: 0.7,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  style={{ originX: '556px', originY: '252px' }}
                >
                  <circle cx="556" cy="252" r="24" fill={BRAND_TEAL} />

                  <path
                    d="M 542 240 C 552 246, 552 258, 542 264"
                    fill="none"
                    stroke={BRAND_LIGHT}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 570 240 C 560 246, 560 258, 570 264"
                    fill="none"
                    stroke={BRAND_LIGHT}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </motion.g>
              ) : (
                /* Screen-Filling Smash toward User */
                <motion.g
                  initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
                  animate={{
                    x: [-20, -126],
                    y: [10, -52],
                    scale: [1, 3.5, 52],
                    rotate: [0, 90, 360],
                  }}
                  transition={{
                    duration: 0.95,
                    times: [0, 0.45, 1],
                    ease: [0.16, 0.85, 0.3, 1],
                  }}
                  style={{ originX: '556px', originY: '252px' }}
                  filter="url(#ballGlow)"
                  onAnimationComplete={() => {
                    setPhase('exited');
                    onComplete?.();
                  }}
                >
                  <circle cx="556" cy="252" r="24" fill={BRAND_TEAL} />
                  <path
                    d="M 542 240 C 552 246, 552 258, 542 264"
                    fill="none"
                    stroke={BRAND_LIGHT}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 570 240 C 560 246, 560 258, 570 264"
                    fill="none"
                    stroke={BRAND_LIGHT}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </motion.g>
              )}

              {/* 4. Subtitle Banner: PICKLEBALL & TABLE TENNIS COURT */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={isSmashing ? { opacity: 0 } : { opacity: 1 }}
                transition={{
                  delay: isSmashing ? 0 : 0.8,
                  duration: isSmashing ? 0.2 : 0.5,
                }}
              >
                <line x1="30" y1="365" x2="80" y2="365" stroke={BRAND_TEAL} strokeWidth="5" strokeLinecap="round" />

                <text
                  x="430"
                  y="372"
                  textAnchor="middle"
                  fill={BRAND_TEAL}
                  style={{
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                    fontWeight: 900,
                    fontSize: '20px',
                    letterSpacing: '0.19em',
                  }}
                >
                  PICKLEBALL &amp; TABLE TENNIS COURT
                </text>

                <line x1="780" y1="365" x2="830" y2="365" stroke={BRAND_TEAL} strokeWidth="5" strokeLinecap="round" />
              </motion.g>
            </svg>

            {/* Tap Prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={
                isSmashing
                  ? { opacity: 0 }
                  : {
                      opacity: [0.4, 0.95, 0.4],
                      scale: [1, 1.03, 1],
                    }
              }
              transition={
                isSmashing
                  ? { duration: 0.2 }
                  : { delay: 1.6, duration: 2, repeat: Infinity }
              }
              className="mt-6 flex flex-col items-center gap-1.5"
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#115259]">
                TAP ANYWHERE TO PLAY
              </span>
            </motion.div>
          </motion.div>

          {/* Full Screen Teal Smash Wipe Transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isSmashing ? { opacity: [0, 0, 0.85, 1] } : { opacity: 0 }}
            transition={{
              duration: 0.95,
              times: [0, 0.5, 0.85, 1],
              ease: 'easeIn',
            }}
            className="pointer-events-none fixed inset-0 bg-[#115259]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}