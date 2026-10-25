import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  PhilippinePeso,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminStore } from '@/stores/adminStore';
import {
  formatCurrency,
  formatDate,
  toISODate,
  getMonthMatrix,
  todayISO,
} from '@/utils/format';
import type { AdminView, Booking } from '@/types';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTimeShort(time: string): string {
  if (!time || time === '?' || time === 'N/A') return time || '?';
  const [hour, minute] = time.split(':').map(Number);
  if (Number.isNaN(hour)) return time;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return minute === 0 ? `${hour12}${ampm}` : `${hour12}:${String(minute).padStart(2, '0')}${ampm}`;
}

export function Dashboard() {
  const analytics = useAdminStore((state) => state.analytics);
  const bookings = useAdminStore((state) => state.bookings || []);
  const loadingAnalytics = useAdminStore((state) => state.loadingAnalytics);
  const loadingBookings = useAdminStore((state) => state.loadingBookings);
  const loadAnalytics = useAdminStore((state) => state.loadAnalytics);
  const loadBookings = useAdminStore((state) => state.loadBookings);

  const [view, setView] = useState<AdminView>('calendar');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISO());

  useEffect(() => {
    loadAnalytics();
    loadBookings();
  }, [loadAnalytics, loadBookings]);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const weeks = getMonthMatrix(year, month);

  // Cancelled bookings are excluded from the calendar, day counts,
  // selected-date drawer, and list view.
  const activeBookings = useMemo(
    () => bookings.filter((b) => b && b.date && b.status !== 'cancelled'),
    [bookings]
  );

  // Group active bookings by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    activeBookings.forEach((b) => {
      const existing = map.get(b.date) ?? [];
      existing.push(b);
      map.set(b.date, existing);
    });
    return map;
  }, [activeBookings]);

  const selectedDateBookings = selectedDate
    ? (bookingsByDate.get(selectedDate) ?? [])
    : [];

  const formatSlotTime = (slot: any): string => {
    if (!slot) return '?';
    const start = slot.start_time ? formatTimeShort(slot.start_time) : '?';
    const end = slot.end_time ? formatTimeShort(slot.end_time) : '?';
    return `${start}-${end}`;
  };

  const getCustomerFirstName = (booking: any): string => {
    if (!booking?.customer?.name) return 'Unknown';
    return booking.customer.name.split(' ')[0] || 'Unknown';
  };

  const getCustomerName = (booking: any): string => {
    if (!booking?.customer?.name) return 'Unknown';
    return booking.customer.name || 'Unknown';
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: analytics?.total_bookings ?? 0,
      icon: CalendarDays,
      color: 'text-brand-blue-300',
      bg: 'bg-brand-blue-500/20 border border-brand-blue-400/30',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(analytics?.total_revenue ?? 0),
      icon: PhilippinePeso,
      color: 'text-accentGreen-300',
      bg: 'bg-accentGreen-500/20 border border-accentGreen-400/30',
    },
    {
      label: 'Completed Bookings',
      value: analytics?.completed_bookings ?? 0,
      icon: CheckCircle2,
      color: 'text-sky-300',
      bg: 'bg-sky-500/20 border border-sky-400/30',
    },
    {
      label: 'Pending Payments',
      value: analytics?.pending_payments ?? 0,
      icon: Clock,
      color: 'text-amber-300',
      bg: 'bg-amber-500/20 border border-amber-400/30',
    },
  ];

  return (
    <AdminLayout>
      <div className="container-page py-6 sm:py-8 text-cream">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-cream-muted sm:text-sm">
            Overview of your court bookings and revenue
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-3.5 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-inner ${stat.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-cream sm:text-3xl tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cream-muted sm:text-xs">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue chart */}
        {analytics?.revenue_by_day && analytics.revenue_by_day.length > 0 && (
          <div className="mb-6 card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:mb-8 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-blue-300" />
              <h2 className="font-display text-base font-bold text-cream sm:text-lg">
                Revenue Trend
                <span className="ml-1.5 text-xs font-medium text-cream-muted sm:text-sm">
                  ({analytics.revenue_by_day.length} day
                  {analytics.revenue_by_day.length !== 1 ? 's' : ''})
                </span>
              </h2>
            </div>

            {/* Horizontal scroll on mobile */}
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              <div className="flex h-48 items-stretch gap-2 sm:h-56">
                {analytics.revenue_by_day.map((day) => {
                  const maxRev = Math.max(
                    ...analytics.revenue_by_day.map((d) => d.revenue),
                    1
                  );
                  const heightPct = (day.revenue / maxRev) * 100;
                  return (
                    <div
                      key={day.date}
                      className="flex min-w-[52px] flex-1 flex-col items-center gap-1.5"
                    >
                      <span className="hidden text-[10px] font-bold text-brand-blue-200 whitespace-nowrap sm:block">
                        {day.revenue > 0 ? formatCurrency(day.revenue) : '—'}
                      </span>
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-brand-blue-600 via-brand-blue-500 to-brand-blue-400 transition-all hover:from-brand-blue-500 hover:to-brand-blue-300 shadow-sm"
                          style={{ height: `${Math.max(heightPct, 3)}%` }}
                          title={formatCurrency(day.revenue)}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-cream-muted whitespace-nowrap sm:text-[10px]">
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Calendar / List View */}
        <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-base font-bold text-cream sm:text-lg">
              Bookings Calendar
            </h2>
            <div className="flex items-center gap-2">
              {view === 'calendar' && (
                <div className="mr-1 flex items-center gap-1 sm:mr-2">
                  <button
                    onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                    className="rounded-lg border border-forest-600 bg-forest-800/80 p-1.5 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[110px] text-center text-xs font-bold text-cream sm:min-w-32 sm:text-sm">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                    className="rounded-lg border border-forest-600 bg-forest-800/80 p-1.5 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex rounded-xl border border-forest-700 bg-forest-950/60 p-1">
                <button
                  onClick={() => setView('calendar')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    view === 'calendar'
                      ? 'bg-brand-blue-500 text-white shadow-glow-blue'
                      : 'text-cream-muted hover:text-cream'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    view === 'list'
                      ? 'bg-brand-blue-500 text-white shadow-glow-blue'
                      : 'text-cream-muted hover:text-cream'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {loadingAnalytics || loadingBookings ? (
            <LoadingSpinner className="py-14" />
          ) : view === 'calendar' ? (
            <div>
              {/* Calendar header row */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div
                    key={d}
                    className="py-1 text-center text-[10px] font-bold uppercase tracking-wider text-cream-muted sm:py-2 sm:text-xs"
                  >
                    <span className="hidden sm:inline">{d}</span>
                    <span className="sm:hidden">{d[0]}</span>
                  </div>
                ))}
              </div>

              {/* Calendar days grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {weeks.flat().map((day) => {
                  const iso = toISODate(day);
                  const dayBookings = bookingsByDate.get(iso) ?? [];
                  const isCurrentMonth = day.getMonth() === month;
                  const isToday = iso === todayISO();
                  const isSelected = iso === selectedDate;
                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedDate(iso)}
                      className={`min-h-[56px] rounded-xl border p-1 text-left transition sm:min-h-24 sm:p-2 ${
                        isSelected
                          ? 'border-brand-blue-400 bg-brand-blue-500/20 shadow-glow-blue'
                          : isCurrentMonth
                            ? 'border-forest-700/80 bg-forest-950/60 hover:border-brand-blue-400/50 hover:bg-forest-800/60'
                            : 'border-forest-800/50 bg-forest-950/20 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold sm:text-xs ${
                            isToday
                              ? 'flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue-500 text-white font-black'
                              : 'text-cream'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayBookings.length > 0 && (
                          <span className="rounded-full bg-brand-blue-500/30 border border-brand-blue-400/40 px-1.5 py-0.2 text-[8px] font-black text-brand-blue-200 sm:text-[9px]">
                            {dayBookings.length}
                          </span>
                        )}
                      </div>

                      {/* Desktop booking chips */}
                      <div className="mt-1 hidden space-y-1 sm:block">
                        {dayBookings.slice(0, 2).map((b) => {
                          if (!b) return null;
                          const firstName = getCustomerFirstName(b);
                          const startTime = b.slots?.[0]?.start_time
                            ? formatTimeShort(b.slots[0].start_time)
                            : '';
                          return (
                            <div
                              key={b.id || Math.random()}
                              className={`truncate rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                                b.status === 'confirmed'
                                  ? 'bg-accentGreen-500/25 text-accentGreen-300 border border-accentGreen-400/30'
                                  : b.status === 'pending_payment'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : b.status === 'cancelled'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-brand-blue-500/25 text-brand-blue-200 border border-brand-blue-400/30'
                              }`}
                            >
                              {startTime} {firstName}
                            </div>
                          );
                        })}
                        {dayBookings.length > 2 && (
                          <div className="text-[9px] font-semibold text-brand-blue-300/80 pl-0.5">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected date drawer */}
              {selectedDate && (
                <div className="mt-5 border-t border-forest-700/80 pt-4 sm:mt-6 sm:pt-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-blue-300 sm:text-sm">
                    {formatDate(selectedDate)} — {selectedDateBookings.length} booking
                    {selectedDateBookings.length !== 1 ? 's' : ''}
                  </h3>
                  {selectedDateBookings.length === 0 ? (
                    <p className="py-6 text-center text-xs font-medium text-cream-muted sm:text-sm">
                      No bookings for this date.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedDateBookings.map((b) => {
                        const customerName = getCustomerName(b);
                        const courtName = b.court_name || 'Unknown Court';
                        const totalAmount = b.total_amount || 0;
                        const slotDisplay =
                          b.slots?.map((s) => formatSlotTime(s)).join(', ') || 'No slots';
                        const startTime = b.slots?.[0]?.start_time
                          ? formatTimeShort(b.slots[0].start_time)
                          : 'N/A';

                        return (
                          <div
                            key={b.id || Math.random()}
                            className="flex flex-col gap-2 rounded-xl border border-forest-700/70 bg-forest-950/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-blue-400/30 bg-brand-blue-500/20 text-xs font-black text-brand-blue-200">
                                {startTime}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-cream">
                                  {customerName}
                                </p>
                                <p className="truncate text-xs text-cream-muted">
                                  {courtName} — {slotDisplay}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                              <span className="text-sm font-bold text-brand-blue-300">
                                {formatCurrency(totalAmount)}
                              </span>
                              <StatusBadge status={b.status} size="sm" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeBookings.length === 0 ? (
                <p className="py-8 text-center text-sm font-medium text-cream-muted">
                  No bookings registered yet.
                </p>
              ) : (
                activeBookings.map((b) => {
                  const customerName = getCustomerName(b);
                  const courtName = b.court_name || 'Unknown Court';
                  const totalAmount = b.total_amount || 0;
                  const referenceCode = b.reference_code || 'No ref';
                  const startTime = b.slots?.[0]?.start_time
                    ? formatTimeShort(b.slots[0].start_time)
                    : 'N/A';

                  return (
                    <div
                      key={b.id || Math.random()}
                      className="flex flex-col gap-2 rounded-xl border border-forest-700/70 bg-forest-950/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-blue-400/30 bg-brand-blue-500/20 text-xs font-black text-brand-blue-200">
                          {startTime}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-cream">
                            {customerName}
                          </p>
                          <p className="truncate text-xs text-cream-muted">
                            <span className="font-mono text-brand-blue-300">{referenceCode}</span> ·{' '}
                            {courtName} · {formatDate(b.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-sm font-bold text-brand-blue-300">
                          {formatCurrency(totalAmount)}
                        </span>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}