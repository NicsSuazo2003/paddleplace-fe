import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'nav' | 'lg' | 'xl' | '2xl';
  withText?: boolean;
  to?: string;
  variant?: 'light' | 'dark'; // 'light' for dark headers/footers, 'dark' for bright backgrounds
}

export function Logo({
  size = 'md',
  withText = true,
  to = '/',
  variant = 'light',
}: LogoProps) {
  const sizes = {
    sm: { image: 36, text: 'text-lg', subtitle: 'text-[9px]' },
    md: { image: 48, text: 'text-xl', subtitle: 'text-[10px]' },
    nav: { image: 56, text: 'text-xl sm:text-2xl', subtitle: 'text-[9px] sm:text-[10px]' },
    lg: { image: 68, text: 'text-3xl', subtitle: 'text-xs' },
    xl: { image: 84, text: 'text-4xl', subtitle: 'text-sm' },
    '2xl': { image: 120, text: 'text-5xl', subtitle: 'text-base' },
  };
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <img
        src="/images/CC.png"
        alt="Paddle Place Logo"
        width={s.image}
        height={s.image}
        className="object-contain drop-shadow-sm"
      />
      {withText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display ${s.text} font-black tracking-tight`}>
            {/* Matches brand deep teal on light backgrounds, crisp white on dark navbars/footers */}
            <span className={variant === 'light' ? 'text-white' : 'text-[#0E4348]'}>
              Paddle{' '}
            </span>
            {/* Pale Mint / Seafoam accent matching the court border */}
            <span className={variant === 'light' ? 'text-[#B6DAC8]' : 'text-[#2D534B]'}>
              Place
            </span>
          </span>
          <span
            className={`font-sans font-extrabold uppercase tracking-[0.2em] mt-1 ${s.subtitle} ${
              variant === 'light' ? 'text-[#B6DAC8]/80' : 'text-[#526E69]'
            }`}
          >
            Pickleball & Table Tennis
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} aria-label="Paddle Place Home" className="transition hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}