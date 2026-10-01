import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
  };

type LinkButtonProps = BaseProps & {
  to: string;
};

type Props = ButtonProps | LinkButtonProps;

const variants: Record<Variant, string> = {
  // Brand teal with crisp white text and elevation shadow
  primary:
    'bg-brand-blue-500 text-white hover:bg-brand-blue-400 active:bg-brand-blue-600 shadow-glow-blue font-semibold border border-brand-blue-400/40',
  secondary:
    'border border-forest-600 bg-forest-800/80 text-cream hover:border-brand-blue-400 hover:text-brand-blue-200 active:bg-forest-700 font-medium',
  ghost:
    'text-cream-muted hover:text-cream hover:bg-forest-800/60 active:bg-forest-700/60 font-medium',
  danger:
    'bg-error/15 text-error border border-error/30 hover:bg-error hover:text-white active:bg-error/90 font-semibold',
  // ✅ FIXED: solid mint background with dark teal text
  success:
    'bg-mint-400 text-[#0E4348] border border-mint-500 hover:bg-mint-300 active:bg-mint-500 font-semibold shadow-md shadow-mint-500/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5 font-bold',
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = `inline-flex items-center justify-center select-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    if ('to' in rest && rest.to) {
      return (
        <Link to={rest.to} className={classes}>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </Link>
      );
    }

    const buttonProps = rest as ButtonProps;
    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading ?? buttonProps.disabled}
        {...buttonProps}
      >
        {isLoading ? <Spinner /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';