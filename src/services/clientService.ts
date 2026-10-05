import type { ClientSettings } from '@/types';
import { apiRequest } from './api';

function normalizeClientSettings(raw: any): ClientSettings {
  return {
    id: raw.id,
    name: raw.name,
    subdomain: raw.subdomain,
    logo_url: raw.logoUrl ?? raw.logo_url ?? null,
    primary_color: raw.primaryColor ?? raw.primary_color,
    accent_color: raw.accentColor ?? raw.accent_color,
    gcash_number: raw.gcashNumber ?? raw.gcash_number ?? null,
    gcash_account_name: raw.gcashAccountName ?? raw.gcash_account_name ?? null,
    payment_methods: raw.paymentMethods ?? raw.payment_methods ?? [],
    available_amenities: raw.availableAmenities ?? raw.available_amenities ?? [],
  };
}

export const clientService = {
  async getPublicSettings(): Promise<ClientSettings> {
    const res = await apiRequest<any>('/api/clients/public');
    return normalizeClientSettings(res?.data ?? res);
  },
};