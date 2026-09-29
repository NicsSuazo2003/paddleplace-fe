// src/pages/admin/Bookings.tsx
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { StaffCreateBookingModal } from './StaffCreateBookingModal';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
  formatDateTime,
  formatSlotsSummary,
} from '@/utils/format';
import type { Booking, BookingStatus } from '@/types';

const statusOptions: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'payment_submitted', label: 'Payment Submitted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'refunded', label: 'Refunded' },
];

export function Bookings() {
  const { user } = useAuthStore();
  const bookings = useAdminStore((state) => state.bookings);
  const courts = useAdminStore((state) => state.courts);
  const loadingBookings = useAdminStore((state) => state.loadingBookings);
  const loadBookings = useAdminStore((state) => state.loadBookings);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateBookingStatus = useAdminStore((state) => state.updateBookingStatus);
  const loadAnalytics = useAdminStore((state) => state.loadAnalytics);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [courtFilter, setCourtFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<BookingStatus | null>(null);

  useEffect(() => {
    loadBookings();
    if (user?.role === 'admin') {
      loadCourts();
    }
  }, [loadBookings, loadCourts, user?.role]);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (courtFilter !== 'all' && b.court_id !== courtFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.reference_code?.toLowerCase().includes(q) ||
        b.customer?.name?.toLowerCase().includes(q) ||
        b.customer?.email?.toLowerCase().includes(q) ||
        b.court_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    setUpdatingStatus(status);
    try {
      await updateBookingStatus(bookingId, status);
      setSelectedBooking((prev) => (prev && prev.id === bookingId ? { ...prev, status } : prev));
      if (user?.role === 'admin') {
        await loadAnalytics();
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const Layout = user?.role === 'staff' ? StaffLayout : AdminLayout;

  return (
    <Layout>
      <div className="container-page py-6 sm:py-8 text-cream">
        <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
              Bookings
            </h1>
            <p className="mt-1 text-xs text-cream-muted sm:text-sm">
              Manage and update all court reservations and payments
            </p>
          </div>
          <Button
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Booking
          </Button>
        </div>

        {/* Filter controls */}
        <div className="mb-6 card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Search by name, email, ref code..."
              leftIcon={<Search className="h-4 w-4 text-cream-muted" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="w-full rounded-xl border border-forest-700/80 bg-forest-950/70 px-3.5 py-2.5 text-sm text-cream transition focus:border-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-forest-900">
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="w-full rounded-xl border border-forest-700/80 bg-forest-950/70 px-3.5 py-2.5 text-sm text-cream transition focus:border-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
            >
              <option value="all" className="bg-forest-900">All Courts</option>
              {courts.map((c) => {
                if (!c) return null;
                return (
                  <option key={c.id} value={c.id} className="bg-forest-900">
                    {c?.name || 'Unnamed Court'}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-cream-muted font-medium">
            <Filter className="h-3.5 w-3.5 text-brand-blue-300" />
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>

        {loadingBookings ? (
          <LoadingSpinner className="py-16" />
        ) : filtered.length === 0 ? (
          <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/60 py-12 text-center shadow-xl">
            <p className="text-sm font-medium text-cream-muted">No bookings match your filters.</p>
          </div>
        ) : (
          <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 overflow-hidden shadow-xl">
            {/* Desktop table view */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-700/80 bg-forest-950/70 text-[11px] uppercase tracking-wider text-cream-muted">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Court</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Slots</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-800/80">
                  {filtered.map((b) => (
                    <tr key={b.id} className="transition hover:bg-forest-800/40">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-brand-blue-300 tracking-wide">
                          {b.reference_code || 'N/A'}
                        </span>
                        {b.payment_reference && (
                          <p className="mt-0.5 text-[10px] text-cream-muted">
                            Pay ref: <span className="font-mono text-cream">{b.payment_reference}</span>
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-cream">{b.customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-cream-muted">{b.customer?.email || 'No email'}</p>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-cream">
                        {b.court_name || 'Unknown Court'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-cream-muted">
                        {formatDateLong(b.date)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-cream-muted max-w-[280px]">
                        {formatSlotsSummary(b.slots)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-brand-blue-300">
                        {formatCurrency(b.total_amount || 0)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="rounded-lg border border-forest-600 bg-forest-800/60 p-1.5 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300 active:scale-95"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list view */}
            <div className="space-y-3 p-4 md:hidden">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-forest-700/70 bg-forest-950/70 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-blue-300 tracking-wide">
                      {b.reference_code || 'N/A'}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-cream">{b.customer?.name || 'Unknown'}</p>
                    <p className="text-xs text-cream-muted">
                      {b.court_name || 'Unknown Court'} — {formatDateLong(b.date)}
                    </p>
                    <p className="mt-1 text-xs text-cream-muted/90">
                      {formatSlotsSummary(b.slots)}
                    </p>
                  </div>
                  {b.payment_reference && (
                    <p className="text-[11px] text-cream-muted">
                      Pay ref: <span className="font-mono text-cream">{b.payment_reference}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t border-forest-800 pt-3">
                    <span className="text-sm font-extrabold text-brand-blue-300">
                      {formatCurrency(b.total_amount || 0)}
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedBooking(b)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────── Booking Details Modal ─────────────────────── */}
      <AnimatePresence>
        {selectedBooking && (
          <Modal
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            title={`Booking ${selectedBooking.reference_code || 'N/A'}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-forest-700/80 pb-3">
                <StatusBadge status={selectedBooking.status} />
                <span className="text-xs text-cream-muted font-medium">
                  Created {formatDateTime(selectedBooking.created_at)}
                </span>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-bold text-cream">
                    {selectedBooking.customer?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-cream-muted">
                    {selectedBooking.customer?.email || 'No email'}
                  </p>
                  <p className="text-xs text-cream-muted">
                    {selectedBooking.customer?.phone || 'No phone'}
                  </p>
                  {selectedBooking.customer?.notes && (
                    <p className="mt-2.5 rounded-lg border border-forest-800 bg-forest-900/60 p-2 text-xs italic text-cream-muted">
                      "{selectedBooking.customer.notes}"
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">
                    Court Booking
                  </p>
                  <p className="mt-1 text-sm font-bold text-cream">
                    {selectedBooking.court_name || 'Unknown Court'}
                  </p>
                  <p className="text-xs text-cream-muted">
                    {formatDateLong(selectedBooking.date)}
                  </p>
                  <p className="mt-1.5 text-xs text-cream-muted">
                    {formatSlotsSummary(selectedBooking.slots)}
                  </p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between rounded-xl border border-brand-blue-500/40 bg-brand-blue-500/15 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  Total Amount
                </span>
                <span className="font-display text-2xl font-extrabold text-brand-blue-300">
                  {formatCurrency(selectedBooking.total_amount || 0)}
                </span>
              </div>

              {/* Payment Details (screenshot + reference) */}
              {(selectedBooking.payment_screenshot_url || selectedBooking.payment_reference) && (
                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-4">
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">
                    Payment Details
                  </p>

                  {selectedBooking.payment_reference && (
                    <div className="mb-3 flex items-center justify-between rounded-xl border border-forest-700/60 bg-forest-900/70 p-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                          Reference Number
                        </p>
                        <p className="mt-0.5 font-mono text-sm font-bold tracking-wider text-brand-blue-300">
                          {selectedBooking.payment_reference}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedBooking.payment_reference || '');
                        }}
                        className="rounded-lg border border-forest-600 bg-forest-800 p-1.5 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300 active:scale-95"
                        title="Copy reference"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {selectedBooking.payment_screenshot_url ? (
                    <img
                      src={selectedBooking.payment_screenshot_url}
                      alt="Payment screenshot"
                      className="max-h-72 w-full rounded-lg object-contain bg-forest-950 border border-forest-800"
                    />
                  ) : (
                    <p className="rounded-lg border border-dashed border-forest-700 bg-forest-950/60 p-3 text-center text-xs text-cream-muted">
                      No screenshot uploaded — user submitted reference number only.
                    </p>
                  )}
                </div>
              )}

              {/* Context-aware action buttons */}
              <div className="border-t border-forest-700/80 pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cream-muted">
                  Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Pending Payment → mark expired */}
                  {selectedBooking.status === 'pending_payment' && (
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={updatingStatus === 'expired'}
                      disabled={updatingStatus !== null}
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'expired')}
                    >
                      Mark Expired
                    </Button>
                  )}

                  {/* Payment Submitted → Confirm, Reject, Refund */}
                  {selectedBooking.status === 'payment_submitted' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        isLoading={updatingStatus === 'confirmed'}
                        disabled={updatingStatus !== null}
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={updatingStatus === 'rejected'}
                        disabled={updatingStatus !== null}
                        leftIcon={<XCircle className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={updatingStatus === 'refunded'}
                        disabled={updatingStatus !== null}
                        leftIcon={<RotateCcw className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'refunded')}
                      >
                        Refund
                      </Button>
                    </>
                  )}

                  {/* Confirmed → Complete, Cancel, Refund */}
                  {selectedBooking.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={updatingStatus === 'completed'}
                        disabled={updatingStatus !== null}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={updatingStatus === 'cancelled'}
                        disabled={updatingStatus !== null}
                        leftIcon={<XCircle className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={updatingStatus === 'refunded'}
                        disabled={updatingStatus !== null}
                        leftIcon={<RotateCcw className="h-4 w-4" />}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'refunded')}
                      >
                        Refund
                      </Button>
                    </>
                  )}

                  {/* Completed → Refund only */}
                  {selectedBooking.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      isLoading={updatingStatus === 'refunded'}
                      disabled={updatingStatus !== null}
                      leftIcon={<RotateCcw className="h-4 w-4" />}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'refunded')}
                    >
                      Refund
                    </Button>
                  )}

                  {/* Terminal statuses — no actions */}
                  {['cancelled', 'rejected', 'expired', 'refunded'].includes(
                    selectedBooking.status
                  ) && (
                    <p className="text-xs text-cream-muted">
                      No actions available for{' '}
                      <span className="font-semibold text-cream">
                        {selectedBooking.status}
                      </span>{' '}
                      bookings.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <StaffCreateBookingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => loadBookings()}
      />
    </Layout>
  );
}