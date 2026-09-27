import type { Analytics, Booking, BookingStatus, Court, BlockedDate, ClientSettings, PaymentMethod } from '@/types';
import { apiRequest } from './api';
import { normalizeCourt, buildCourtPayload } from './courtService';

function normalizeClientSettings(raw: any): ClientSettings {
  const data = raw?.data ?? raw;
  return {
    id: data.id || '',
    name: data.name || '',
    subdomain: data.subdomain || '',
    logo_url: data.logoUrl ?? data.logo_url ?? null,
    primary_color: data.primaryColor ?? data.primary_color ?? '#1A2E1A',
    accent_color: data.accentColor ?? data.accent_color ?? '#C9A94E',
    gcash_number: data.gcashNumber ?? data.gcash_number ?? null,
    gcash_account_name: data.gcashAccountName ?? data.gcash_account_name ?? null,
    payment_methods: data.paymentMethods ?? data.payment_methods ?? [],
  };
}

function normalizeAnalytics(raw: any): Analytics {
  const data = raw?.data ?? raw;

  const rawRevenueByDay =
    data.revenueByDay ??
    data.revenue_by_day ??
    data.dailyRevenue ??
    data.daily_revenue ??
    data.revenueTrend ??
    [];

  if (rawRevenueByDay.length === 0) {
    console.warn(
      '[analytics] revenue_by_day resolved to an empty array. Raw analytics keys:',
      Object.keys(data)
    );
  }

  const revenueByDay = rawRevenueByDay
    .map((d: any) => ({
      date: d.date || '',
      revenue: Number(d.revenue ?? 0),
    }))
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  return {
    total_bookings: Number(data.totalBookings ?? data.total_bookings ?? 0),
    total_revenue: Number(data.totalRevenue ?? data.total_revenue ?? 0),
    pending_payments: Number(data.pendingPayments ?? data.pending_payments ?? 0),
    confirmed_bookings: Number(data.confirmedBookings ?? data.confirmed_bookings ?? 0),
    completed_bookings: Number(data.completedBookings ?? data.completed_bookings ?? 0),
    cancelled_bookings: Number(data.cancelledBookings ?? data.cancelled_bookings ?? 0),
    status_breakdown: data.statusBreakdown ?? data.status_breakdown ?? {},
    revenue_by_day: revenueByDay,
    court_breakdown: data.courtBreakdown ?? data.court_breakdown ?? [],
  };
}

function normalizeBooking(raw: any): Booking {
  const data = raw?.data ?? raw;
  return {
    id: data.id || '',
    reference_code: data.referenceCode ?? data.reference_code ?? '',
    court_id: data.courtId ?? data.court_id ?? '',
    court_name: data.courtName ?? data.court_name ?? 'Unknown Court',
    date: data.date || '',
    slots: (data.slots ?? []).map((s: any) => ({
      id: s.id || '',
      slot_id: s.slotId ?? s.slot_id ?? s.id ?? '',
      start_time: s.startTime ?? s.start_time ?? '',
      end_time: s.endTime ?? s.end_time ?? '',
      date: s.date ?? data.date ?? '',
      type: s.type ?? 'standard',
      price: Number(s.price ?? s.amount ?? s.total ?? s.Price ?? 0),
      is_peak: s.isPeak ?? s.is_peak ?? false,
    })),
    customer: {
      name: data.customerName ?? data.customer?.name ?? 'Unknown',
      email: data.customerEmail ?? data.customer?.email ?? '',
      phone: data.customerPhone ?? data.customer?.phone ?? '',
      notes: data.notes ?? data.customer?.notes ?? '',
    },
    total_amount: Number(data.totalAmount ?? data.total_amount ?? 0),
    status: data.status || 'pending_payment',
    payment_screenshot_url: data.paymentScreenshot ?? data.payment_screenshot_url ?? null,
    payment_reference: data.paymentReference ?? data.payment_reference ?? '',
    gcash_number: data.gcashNumber ?? data.gcash_number ?? '',
    created_at: data.createdAt ?? data.created_at ?? new Date().toISOString(),
    updated_at: data.updatedAt ?? data.updated_at ?? data.createdAt ?? data.created_at ?? new Date().toISOString(),
  };
}

export const adminService = {
  async getAnalytics(): Promise<Analytics> {
    const res = await apiRequest<any>('/api/admin/analytics');
    return normalizeAnalytics(res?.data ?? res);
  },

  async getSettings(): Promise<ClientSettings> {
    const res = await apiRequest<any>('/api/admin/settings');
    return normalizeClientSettings(res?.data ?? res);
  },

  async updateSettings(payload: {
    name?: string;
    gcash_number?: string;
    gcash_account_name?: string;
    payment_methods?: PaymentMethod[];
    rcbc_account_name?: string;
    rcbc_qr_image?: string;
  }): Promise<ClientSettings> {
    const res = await apiRequest<any>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        gcashNumber: payload.gcash_number,
        gcashAccountName: payload.gcash_account_name,
        paymentMethods: payload.payment_methods,
        rcbcAccountName: payload.rcbc_account_name,
        rcbcQrImage: payload.rcbc_qr_image,
      }),
    });
    return normalizeClientSettings(res?.data ?? res);
  },

  async getBookings(filters?: {
    status?: BookingStatus;
    courtId?: string;
    date?: string;
    search?: string;
  }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.courtId) params.set('court_id', filters.courtId);
    if (filters?.date) params.set('date', filters.date);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    const res = await apiRequest<any>(`/api/admin/bookings${query ? `?${query}` : ''}`);
    const rawList = Array.isArray(res) ? res : res?.data || [];
    return rawList.map((item: any) => normalizeBooking(item));
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const res = await apiRequest<any>(`/api/admin/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return normalizeBooking(res?.data ?? res);
  },

  async getCourts(): Promise<Court[]> {
    const data = await apiRequest<any>('/api/admin/courts');
    const rawList = Array.isArray(data) ? data : data?.data || data?.courts || [];
    return rawList.map((court: any, idx: number) => normalizeCourt(court, idx));
  },

  async updateCourt(court: Court): Promise<Court> {
    const payload = buildCourtPayload(court);
    const res = await apiRequest<any>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const updated = res?.data ?? res?.court ?? res;
    return normalizeCourt(updated);
  },

  // ✅ NEW: create a court via POST /api/admin/courts
  async createCourt(court: Partial<Court>): Promise<Court> {
    const payload = buildCourtPayload(court as Court);
    // Server generates the id — don't send our empty placeholder
    delete payload.id;
    const res = await apiRequest<any>('/api/admin/courts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = res?.data ?? res?.court ?? res;
    return normalizeCourt(created);
  },

  // ✅ NEW: delete a court via DELETE /api/admin/courts/{id}
  async deleteCourt(id: string): Promise<void> {
    await apiRequest<void>(`/api/admin/courts/${id}`, {
      method: 'DELETE',
    });
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    if (!courtId) {
      console.warn('No court selected, returning empty blocked dates');
      return [];
    }

    try {
      const res = await apiRequest<any>(`/api/courts/${courtId}/blocked-dates`);
      const rawList = Array.isArray(res) ? res : res?.data || [];
      return rawList.map((item: any) => ({
        id: item.id || '',
        court_id: courtId,
        date: item.date || '',
        reason: item.reason || 'No reason provided',
        startTime: item.startTime || item.start_time || null,
        endTime: item.endTime || item.end_time || null,
      }));
    } catch (error) {
      console.error('Failed to fetch blocked dates:', error);
      return [];
    }
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    const payload: any = {
      date: blocked.date,
      reason: blocked.reason,
    };

    if ((blocked as any).startTime) {
      payload.startTime = (blocked as any).startTime;
    }
    if ((blocked as any).endTime) {
      payload.endTime = (blocked as any).endTime;
    }

    const res = await apiRequest<any>(`/api/courts/${blocked.court_id}/blocked-dates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const created = res?.data ?? res;
    return {
      id: created.id || '',
      court_id: blocked.court_id,
      date: created.date || blocked.date,
      reason: created.reason || blocked.reason,
      startTime: created.startTime || null,
      endTime: created.endTime || null,
    };
  },

  async removeBlockedDate(id: string): Promise<void> {
    await apiRequest<void>(`/api/courts/blocked-dates/${id}`, {
      method: 'DELETE',
    });
  },

  async createStaff(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<any> {
    const res = await apiRequest<any>('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data ?? res;
  },

  async updateStaffStatus(userId: string, status: string): Promise<void> {
    await apiRequest(`/api/admin/staff/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async deleteStaff(userId: string): Promise<void> {
    await apiRequest(`/api/admin/staff/${userId}`, {
      method: 'DELETE',
    });
  },

  async createManualBooking(payload: {
    court_id: string;
    date: string;
    slots: { start_time: string; end_time: string }[];
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    notes?: string;
    payment_mode: 'cash' | 'gcash' | 'pay_later' | 'free';
    total_amount?: number;
    staff_notes?: string;
    send_confirmation?: boolean;
  }): Promise<Booking> {
    const res = await apiRequest<any>('/api/admin/bookings/manual', {
      method: 'POST',
      body: JSON.stringify({
        courtId: payload.court_id,
        date: payload.date,
        slots: payload.slots.map((s) => ({
          startTime: s.start_time,
          endTime: s.end_time,
        })),
        customerName: payload.customer_name,
        customerEmail: payload.customer_email || null,
        customerPhone: payload.customer_phone || null,
        notes: payload.notes || null,
        paymentMode: payload.payment_mode,
        totalAmount: payload.total_amount ?? null,
        staffNotes: payload.staff_notes || null,
        sendConfirmation: payload.send_confirmation ?? false,
      }),
    });
    return normalizeBooking(res?.data ?? res);
  },
};