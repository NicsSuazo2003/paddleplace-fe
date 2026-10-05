import type { AmenityItem } from '@/types';

export const APP_CONFIG = {
    name: import.meta.env.VITE_APP_NAME ?? 'Paddle Place',        // ✅ Fixed: fallback changed from 'Center Court'
    demoMode: (import.meta.env.VITE_DEMO_MODE ?? 'false') === 'true',
    apiUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://pickleballbookingclientb.onrender.com',
    tagline: 'Rally. Reserve. Repeat.',
    established: '2026',
    gcashNumber: '09171234567',                                  // ⚠️ Still a placeholder — update if you know your real number
    gcashAccountName: 'Paddle Place',
    developer: 'Astravex Systems',
    paymentTimerSeconds: 15 * 60,
  };

  export const FIXED_SLOT = {
    start: '16:00',
    end: '18:00',
    label: '2hr Fixed',
    description: '4:00 PM - 6:00 PM',
    hours: 2,
  };

  // ✅ Fixed: email now matches the DB user (admin@paddleplace.ph)
  export const ADMIN_CREDENTIALS = {
    email: 'admin@paddleplace.ph',
    password: 'Admin123!',
  };

  export const BOOKING_STATUS_META: Record<
    string,
    { label: string; color: string; bg: string; border: string; dot: string }
  > = {
    pending_payment: {
      label: 'Pending Payment',
      color: 'text-warning',
      bg: 'bg-warning/15',
      border: 'border-warning/40',
      dot: 'bg-warning',
    },
    payment_submitted: {
      label: 'Payment Submitted',
      color: 'text-blue-300',
      bg: 'bg-blue-500/15',
      border: 'border-blue-500/40',
      dot: 'bg-blue-400',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'text-success',
      bg: 'bg-success/15',
      border: 'border-success/40',
      dot: 'bg-success',
    },
    completed: {
      label: 'Completed',
      color: 'text-gold-300',
      bg: 'bg-gold-500/15',
      border: 'border-gold-500/40',
      dot: 'bg-gold-400',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-error',
      bg: 'bg-error/15',
      border: 'border-error/40',
      dot: 'bg-error',
    },
    rejected: {
      label: 'Rejected',
      color: 'text-error',
      bg: 'bg-error/15',
      border: 'border-error/40',
      dot: 'bg-error',
    },
    expired: {
      label: 'Expired',
      color: 'text-cream-muted',
      bg: 'bg-forest-600/30',
      border: 'border-forest-500/50',
      dot: 'bg-forest-400',
    },
    refunded: {
      label: 'Refunded',
      color: 'text-purple-300',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/40',
      dot: 'bg-purple-400',
    },
  };

  export const COURT_IMAGES = {
    court1: 'https://images.pexels.com/photos/17299530/pexels-photo-17299530.jpeg?auto=compress&cs=tinysrgb&w=1200',
    court2: 'https://images.pexels.com/photos/32975182/pexels-photo-32975182.jpeg?auto=compress&cs=tinysrgb&w=1200',
    court3: 'https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg?auto=compress&cs=tinysrgb&w=1200',
    hero: '/images/paddle-hero.jpg',                                // ✅ Verified: matches your disk file
    gallery1: 'https://images.pexels.com/photos/17299531/pexels-photo-17299531.jpeg?auto=compress&cs=tinysrgb&w=800',
    gallery2: 'https://images.pexels.com/photos/17299528/pexels-photo-17299528.jpeg?auto=compress&cs=tinysrgb&w=800',
    gallery3: 'https://images.pexels.com/photos/19642670/pexels-photo-19642670.jpeg?auto=compress&cs=tinysrgb&w=800',
    gallery4: 'https://images.pexels.com/photos/38208389/pexels-photo-38208389.jpeg?auto=compress&cs=tinysrgb&w=800',
  };

  export const AMENITIES_LIST = [
    'Indoor',
    'Outdoor',
    'Lighted',
    'Air Conditioned',
    'Parking',
    'Showers',
    'Pro Shop',
    'Water Station',
    'Spectator Seating',
    'WiFi',
  ];

  // ✅ Fallback amenities shown when a client hasn't configured any yet
export const DEFAULT_AMENITIES: AmenityItem[] = [
  { name: 'Silica Sand Finish',    icon: 'Layers',   description: 'Consistent ball bounce & optimal joint-safe traction' },
  { name: 'Paddle Rental',         icon: 'Dumbbell', description: '₱30 / hour — quality gear available on-site' },
  { name: 'In-House Cafe',         icon: 'Coffee',   description: 'Refreshments, drinks, and snacks right beside the court' },
  { name: 'Dedicated Parking',     icon: 'Car',      description: 'Private, secure parking area for cars & motorcycles' },
  { name: 'Shaded Waiting Area',   icon: 'Armchair', description: 'Comfortable covered benches while waiting for your slot' },
  { name: 'Piso Wi-Fi & Restroom', icon: 'Wifi',     description: 'Stay connected and enjoy clean, private comfort rooms' },
];