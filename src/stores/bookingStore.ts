import { create } from 'zustand';
import type { Court, TimeSlot, BookingSlotItem, CustomerDetails, Booking } from '@/types';
import { courtService } from '@/services/courtService';
import { bookingService } from '@/services/bookingService';
import { todayISO } from '@/utils/format';

type BookingMode = 'private' | 'open';

interface BookingStoreState {
  courts: Court[];
  selectedCourt: Court | null;
  selectedDate: string;
  slots: TimeSlot[];
  selectedSlotIds: string[];
  customer: CustomerDetails;
  currentBooking: Booking | null;
  loadingCourts: boolean;
  loadingSlots: boolean;
  error: string | null;

  // ✅ UI mode for the booking grid (private court vs open play)
  bookingMode: BookingMode;
  setBookingMode: (mode: BookingMode) => void;

  loadCourts: () => Promise<void>;
  selectCourt: (court: Court) => void;
  setDate: (date: string) => void;
  loadSlots: () => Promise<void>;
  loadAllCourtsSlots: () => Promise<void>;
  toggleSlot: (slotId: string) => void;
  removeSlot: (slotId: string) => void;
  clearSlots: () => void;
  clearSelection: () => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  createBooking: () => Promise<Booking>;
  reset: () => void;
  refreshSlots: () => Promise<boolean>;
}

const emptyCustomer: CustomerDetails = {
  name: '',
  email: '',
  phone: '',
  notes: '',
};

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  courts: [],
  selectedCourt: null,
  selectedDate: todayISO(),
  slots: [],
  selectedSlotIds: [],
  customer: emptyCustomer,
  currentBooking: null,
  loadingCourts: false,
  loadingSlots: false,
  error: null,

  // ✅ Default to private court booking
  bookingMode: 'private',
  setBookingMode: (mode) => set({ bookingMode: mode }),

  loadCourts: async () => {
    set({ loadingCourts: true, error: null });
    try {
      const courts = await courtService.getCourts();
      const activeCourts = courts.filter((c) => c.is_active !== false);
      const initialCourt = activeCourts[0] ?? null;

      set({
        courts: activeCourts,
        selectedCourt: initialCourt,
        loadingCourts: false,
      });
    } catch (err) {
      set({
        loadingCourts: false,
        error: err instanceof Error ? err.message : 'Failed to load courts',
      });
    }
  },

  selectCourt: (court) => {
    set({ selectedCourt: court, selectedSlotIds: [], error: null });
    get().loadSlots();
  },

  setDate: (date) => {
    set({ selectedDate: date, selectedSlotIds: [], error: null });
  },

  loadSlots: async () => {
    const { selectedCourt, selectedDate } = get();
    if (!selectedCourt) return;

    set({ loadingSlots: true, error: null });
    try {
      const slots = await courtService.getAvailability(selectedCourt.id, selectedDate);
      set({ slots, loadingSlots: false });
    } catch (err) {
      set({
        loadingSlots: false,
        error: err instanceof Error ? err.message : 'Failed to load slots',
      });
    }
  },

  loadAllCourtsSlots: async () => {
    const { courts, selectedDate } = get();
    if (courts.length === 0) return;

    const requestDate = selectedDate;
    set({ loadingSlots: true, error: null });
    try {
      const results = await Promise.all(
        courts.map((c) => courtService.getAvailability(c.id, requestDate))
      );
      if (get().selectedDate === requestDate) {
        set({ slots: results.flat(), loadingSlots: false });
      }
    } catch (err) {
      if (get().selectedDate === requestDate) {
        set({
          loadingSlots: false,
          error: err instanceof Error ? err.message : 'Failed to load slots',
        });
      }
    }
  },

  refreshSlots: async (): Promise<boolean> => {
    const { selectedCourt, selectedDate, selectedSlotIds } = get();
    if (!selectedCourt || selectedSlotIds.length === 0) return true;

    try {
      const freshSlots = await courtService.getAvailability(selectedCourt.id, selectedDate);
      set({ slots: freshSlots });

      const allAvailable = selectedSlotIds.every((slotId) => {
        const slot = freshSlots.find((s) => s.id === slotId);
        return slot?.is_available === true;
      });

      if (!allAvailable) {
        const stillAvailableIds = selectedSlotIds.filter((slotId) => {
          const slot = freshSlots.find((s) => s.id === slotId);
          return slot?.is_available === true;
        });
        set({ selectedSlotIds: stillAvailableIds });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to refresh slots:', err);
      return true;
    }
  },

  // ✅ Pure immutable updates — no direct state mutation
  toggleSlot: (slotId) => {
    set((state) => {
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot) return state;

      // If tapping a slot from a different court, switch the selected court
      const currentCourtId = state.selectedCourt?.id;
      const newCourt =
        currentCourtId !== slot.court_id
          ? state.courts.find((c) => c.id === slot.court_id)
          : undefined;

      const courtPatch = newCourt ? { selectedCourt: newCourt } : {};

      const exists = state.selectedSlotIds.includes(slotId);
      if (exists) {
        return {
          selectedSlotIds: state.selectedSlotIds.filter((id) => id !== slotId),
          ...courtPatch,
        };
      }

      // fixed_2hr slots are exclusive — replace any prior selection
      if (slot.type === 'fixed_2hr') {
        return {
          selectedSlotIds: [slotId],
          ...courtPatch,
        };
      }

      // Otherwise: drop any existing fixed_2hr selection, then append
      const filtered = state.selectedSlotIds.filter((id) => {
        const s = state.slots.find((sl) => sl.id === id);
        return s?.type !== 'fixed_2hr';
      });

      return {
        selectedSlotIds: [...filtered, slotId],
        ...courtPatch,
      };
    });
  },

  // ✅ Remove a single slot from the current selection (used by Booking page "×" buttons)
  removeSlot: (slotId) =>
    set((state) => ({
      selectedSlotIds: state.selectedSlotIds.filter((id) => id !== slotId),
    })),

  clearSlots: () => set({ selectedSlotIds: [] }),

  // ✅ Alias — clearer intent name for UI components
  clearSelection: () => get().clearSlots(),

  setCustomer: (customerData) =>
    set((state) => ({
      customer: { ...state.customer, ...customerData },
    })),

  createBooking: async () => {
    const { selectedDate, selectedSlotIds, slots, customer } = get();

    console.log('🔵 createBooking called with:', {
      selectedSlotIds,
      slotsCount: slots.length,
      customer,
    });

    if (selectedSlotIds.length === 0) {
      console.error('❌ No slots selected');
      throw new Error('Please select at least one time slot');
    }

    // Derive courts from the actual selected slots, not the stale selectedCourt
    const selectedSlotObjs = slots.filter((s) => selectedSlotIds.includes(s.id));
    const courtIds = Array.from(new Set(selectedSlotObjs.map((s) => s.court_id)));

    if (courtIds.length === 0) {
      throw new Error('Could not determine court for selected slots');
    }

    console.log('🔵 Booking for courts:', courtIds);

    const createdBookings = [];

    // Group by court and submit one booking per court
    for (const courtId of courtIds) {
      console.log(`🔵 Processing court ${courtId}...`);

      const freshSlots = await courtService.getAvailability(courtId, selectedDate);
      console.log(`✅ Fresh slots loaded for court ${courtId}:`, freshSlots.length);

      const idsForThisCourt = selectedSlotObjs
        .filter((s) => s.court_id === courtId)
        .map((s) => s.id);

      const stillAvailable = idsForThisCourt.every((slotId) => {
        const fresh = freshSlots.find((s) => s.id === slotId);
        return fresh?.is_available === true;
      });

      if (!stillAvailable) {
        const stillAvailableIds = idsForThisCourt.filter((slotId) => {
          const fresh = freshSlots.find((s) => s.id === slotId);
          return fresh?.is_available === true;
        });

        set((state) => ({
          slots: state.slots.map((s) => freshSlots.find((f) => f.id === s.id) ?? s),
          selectedSlotIds: state.selectedSlotIds.filter(
            (id) => !idsForThisCourt.includes(id) || stillAvailableIds.includes(id)
          ),
        }));

        throw new Error(
          `One or more selected time slots for court ${courtId} are no longer available. Please select new slots.`
        );
      }

      const thisCourtSlots = freshSlots.filter((s) => idsForThisCourt.includes(s.id));
      const bookingSlots: BookingSlotItem[] = thisCourtSlots.map((s) => ({
        id: s.id,
        slot_id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        date: s.date || selectedDate,
        type: s.type,
        price: Number(s.price || 0),
        is_peak: s.is_peak || false,
      }));

      const totalAmount = bookingSlots.reduce((sum, s) => sum + s.price, 0);
      console.log(`🔵 Total amount for court ${courtId}:`, totalAmount);

      const booking = await bookingService.createBooking({
        court_id: courtId,
        date: selectedDate,
        slots: bookingSlots,
        customer,
        total_amount: totalAmount,
      });

      console.log(`✅ Booking created for court ${courtId}:`, booking.reference_code);
      createdBookings.push(booking);
    }

    set({
      currentBooking: createdBookings[createdBookings.length - 1],
      selectedSlotIds: [],
    });

    return createdBookings[createdBookings.length - 1];
  },

  reset: () =>
    set({
      selectedSlotIds: [],
      currentBooking: null,
      customer: emptyCustomer,
      error: null,
    }),
}));

export function getSelectedSlotItems(state: BookingStoreState): BookingSlotItem[] {
  return state.slots
    .filter((s) => state.selectedSlotIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      slot_id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      date: s.date || state.selectedDate,
      type: s.type,
      price: Number(s.price || 0),
      is_peak: s.is_peak || false,
    }));
}

export function getSelectedTotal(state: BookingStoreState): number {
  return state.slots
    .filter((s) => state.selectedSlotIds.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price || 0), 0);
}