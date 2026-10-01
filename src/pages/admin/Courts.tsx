// src/pages/admin/Courts.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Edit3,
  Save,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  EyeOff,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useAdminStore } from '@/stores/adminStore';
import { formatCurrency } from '@/utils/format';
import { AMENITIES_LIST } from '@/utils/constants';
import type { Court } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';

const BLANK_COURT: Court = {
  id: '',
  name: '',
  description: '',
  image: '',
  image_url: '',
  price_per_hour: 300,
  peak_price_per_hour: 400,
  open_time: '06:00',
  close_time: '22:00',
  amenities: [],
  surface: 'Acrylic',
  dimensions: '44ft x 20ft',
  images: [],
  rating: 4.8,
  type: 'outdoor',
  is_indoor: false,
  is_active: true,
  status: 'active',
};

/** "06:00" → "6:00 AM" so hours are readable at a glance. */
function formatTime12(t?: string) {
  if (!t || !/^\d{2}:\d{2}/.test(t)) return t || 'N/A';
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function Courts() {
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateCourt = useAdminStore((state) => state.updateCourt);
  const createCourt = useAdminStore((state) => state.createCourt);
  const deleteCourt = useAdminStore((state) => state.deleteCourt);

  const [editing, setEditing] = useState<Court | null>(null);
  // Prices are edited as strings so the field can be cleared and retyped naturally.
  const [prices, setPrices] = useState({ off: '', peak: '' });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showDiscard, setShowDiscard] = useState(false);
  const snapshot = useRef('');

  const [deleting, setDeleting] = useState<Court | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /* ── Loading ──────────────────────────────────────────────────────────── */

  const fetchCourts = useCallback(async () => {
    setLoadError(null);
    try {
      await loadCourts();
    } catch {
      setLoadError('Could not load courts. Check your connection and try again.');
    }
  }, [loadCourts]);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const validCourts = useMemo(() => courts.filter(Boolean) as Court[], [courts]);
  const activeCount = validCourts.filter((c) => c.is_active).length;

  /* ── Editor open / close ──────────────────────────────────────────────── */

  const openEditor = (court: Court) => {
    const draft = { ...court };
    const p = {
      off: String(court.price_per_hour ?? ''),
      peak: String(court.peak_price_per_hour ?? ''),
    };
    setEditing(draft);
    setPrices(p);
    setFormErrors([]);
    snapshot.current = JSON.stringify({ draft, p });
  };

  const isDirty =
    !!editing && JSON.stringify({ draft: editing, p: prices }) !== snapshot.current;

  const requestCloseEditor = () => {
    if (saving) return;
    if (isDirty) setShowDiscard(true);
    else setEditing(null);
  };

  /* ── Validation + save ────────────────────────────────────────────────── */

  const validate = (c: Court): string[] => {
    const errors: string[] = [];
    const name = (c.name || '').trim();
    const off = Number(prices.off);
    const peak = Number(prices.peak);

    if (!name) errors.push('Court name is required.');
    else if (
      validCourts.some(
        (o) => o.id !== c.id && (o.name || '').trim().toLowerCase() === name.toLowerCase()
      )
    ) {
      errors.push(`Another court is already named "${name}".`);
    }

    if (prices.off === '' || Number.isNaN(off) || off <= 0)
      errors.push('Off-peak price must be greater than 0.');
    if (prices.peak === '' || Number.isNaN(peak) || peak <= 0)
      errors.push('Peak price must be greater than 0.');
    else if (!Number.isNaN(off) && peak < off)
      errors.push('Peak price should not be lower than the off-peak price.');

    if (!c.open_time || !c.close_time) errors.push('Opening and closing times are required.');
    else if (c.close_time <= c.open_time)
      errors.push('Closing time must be later than opening time.');

    return errors;
  };

  const handleSave = async () => {
    if (!editing) return;
    const errors = validate(editing);
    setFormErrors(errors);
    if (errors.length > 0) return;

    const payload: Court = {
      ...editing,
      name: editing.name.trim(),
      description: (editing.description || '').trim(),
      price_per_hour: Number(prices.off),
      peak_price_per_hour: Number(prices.peak),
      // Keep the redundant fields consistent so the public site never disagrees with the admin.
      type: editing.is_indoor ? 'indoor' : 'outdoor',
      status: (editing.is_active ? 'active' : 'inactive') as Court['status'],
    };

    setSaving(true);
    try {
      if (payload.id) await updateCourt(payload);
      else await createCourt(payload);
      setToast({
        type: 'success',
        message: payload.id ? `${payload.name} updated.` : `${payload.name} created.`,
      });
      setEditing(null);
    } catch (err) {
      setFormErrors([
        err instanceof Error && err.message
          ? `Couldn't save: ${err.message}`
          : "Couldn't save the court. Please try again.",
      ]);
    } finally {
      setSaving(false);
    }
  };

  /* ── Quick active toggle ──────────────────────────────────────────────── */

  const toggleActive = async (court: Court) => {
    setTogglingId(court.id);
    const next = !court.is_active;
    try {
      await updateCourt({
        ...court,
        is_active: next,
        status: (next ? 'active' : 'inactive') as Court['status'],
      });
      setToast({
        type: 'success',
        message: next
          ? `${court.name} is now bookable.`
          : `${court.name} is hidden from customers.`,
      });
    } catch {
      setToast({ type: 'error', message: `Couldn't update ${court.name}. Please try again.` });
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Delete / deactivate ──────────────────────────────────────────────── */

  const closeDelete = () => {
    if (saving) return;
    setDeleting(null);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deleting?.id) return;
    setSaving(true);
    setDeleteError(null);
    try {
      await deleteCourt(deleting.id);
      setToast({ type: 'success', message: `${deleting.name} deleted.` });
      setDeleting(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error && err.message ? err.message : 'Delete failed. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivateInstead = async () => {
    if (!deleting) return;
    const court = deleting;
    setDeleting(null);
    setDeleteError(null);
    if (court.is_active) await toggleActive(court);
  };

  /* ── Amenities ────────────────────────────────────────────────────────── */

  const toggleAmenity = (amenity: string) => {
    if (!editing) return;
    const has = editing.amenities.includes(amenity);
    setEditing({
      ...editing,
      amenities: has
        ? editing.amenities.filter((a) => a !== amenity)
        : [...editing.amenities, amenity],
    });
  };

  const getImageUrl = (court: Court): string => court?.image || court?.image_url || '';

  return (
    <AdminLayout>
      <div className="container-page py-6 sm:py-8 text-cream">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
              Courts Management
            </h1>
            <p className="mt-1 text-xs text-cream-muted sm:text-sm">
              Edit court details, pricing, hours, and which courts customers can book
            </p>
            {!loadingCourts && validCourts.length > 0 && (
              <p className="mt-2 text-xs font-medium text-cream-muted">
                {activeCount} of {validCourts.length} courts bookable by customers
              </p>
            )}
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => openEditor({ ...BLANK_COURT })}
          >
            Add Court
          </Button>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-16" />
        ) : loadError ? (
          <div className="card rounded-2xl border border-red-500/40 bg-red-500/10 py-10 text-center shadow-xl">
            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-300" />
            <p className="text-sm font-medium text-cream">{loadError}</p>
            <Button size="sm" variant="secondary" className="mt-4" onClick={fetchCourts}>
              Try again
            </Button>
          </div>
        ) : validCourts.length === 0 ? (
          <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/60 px-4 py-12 text-center shadow-xl backdrop-blur-sm">
            <Building2 className="mx-auto h-12 w-12 text-cream-muted/40" />
            <p className="mt-4 text-sm font-semibold text-cream">No courts yet</p>
            <p className="mt-1 text-sm text-cream-muted">
              Customers can't book anything until you add a court.
            </p>
            <Button
              size="sm"
              className="mt-4"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => openEditor({ ...BLANK_COURT })}
            >
              Add your first court
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {validCourts.map((court, i) => {
              const img = getImageUrl(court);
              const isToggling = togglingId === court.id;
              return (
                <motion.div
                  key={court.id || `court-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`card rounded-2xl border bg-forest-900/80 overflow-hidden shadow-xl backdrop-blur-sm transition-all hover:border-brand-blue-400/50 flex flex-col justify-between ${
                    court.is_active ? 'border-forest-700/80' : 'border-forest-700/50 opacity-80'
                  }`}
                >
                  <div>
                    <div className="relative h-40 overflow-hidden sm:h-44">
                      {img ? (
                        <img
                          src={img}
                          alt={court.name || 'Court'}
                          className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${
                            court.is_active ? '' : 'grayscale'
                          }`}
                          onError={(e) => {
                            // Hide a broken image instead of swapping in an unrelated stock photo.
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      {/* Placeholder sits behind the image so a missing/broken photo is obvious */}
                      <div className="absolute inset-0 -z-0 flex items-center justify-center bg-forest-950">
                        <Building2 className="h-10 w-10 text-cream-muted/30" />
                      </div>
                      {img && (
                        <img
                          src={img}
                          alt=""
                          aria-hidden="true"
                          className={`absolute inset-0 h-full w-full object-cover ${
                            court.is_active ? '' : 'grayscale'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            court.is_active
                              ? 'border border-mint-400/40 bg-mint-500/20 text-mint-300'
                              : 'border border-red-500/40 bg-red-500/20 text-red-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              court.is_active ? 'bg-mint-400' : 'bg-red-400'
                            }`}
                          />
                          {court.is_active ? 'Bookable' : 'Hidden from customers'}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-forest-600 bg-forest-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-cream-muted">
                          {court.is_indoor ? 'Indoor' : 'Outdoor'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="font-display text-base font-bold text-cream sm:text-lg">
                        {court.name || 'Unnamed Court'}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-cream-muted leading-relaxed">
                        {court.description || 'No description yet — add one so customers know what to expect.'}
                      </p>

                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {(court.amenities || []).slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2 py-0.5 text-[11px] font-medium text-cream-muted"
                          >
                            {a}
                          </span>
                        ))}
                        {(court.amenities || []).length > 4 && (
                          <span className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2 py-0.5 text-[11px] font-semibold text-brand-blue-300">
                            +{court.amenities.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-forest-700/80 pt-3.5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-cream-muted">
                            Off-peak
                          </p>
                          <p className="text-sm font-extrabold text-brand-blue-300 sm:text-base">
                            {formatCurrency(court.price_per_hour || 0)}
                            <span className="text-[11px] font-normal text-cream-muted">/hr</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-cream-muted">
                            Peak
                          </p>
                          <p className="text-sm font-extrabold text-brand-blue-300 sm:text-base">
                            {formatCurrency(court.peak_price_per_hour || 0)}
                            <span className="text-[11px] font-normal text-cream-muted">/hr</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs font-medium text-cream-muted">
                        Open daily:{' '}
                        <span className="text-cream">
                          {formatTime12(court.open_time)} – {formatTime12(court.close_time)}
                        </span>
                      </div>

                      {/* Quick bookable toggle */}
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-forest-700/60 bg-forest-950/50 px-3 py-2">
                        <span className="text-xs font-semibold text-cream">
                          {court.is_active ? 'Bookable by customers' : 'Hidden from customers'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!court.is_active}
                          aria-label={`${court.is_active ? 'Hide' : 'Show'} ${court.name || 'court'} for customers`}
                          disabled={isToggling}
                          onClick={() => toggleActive(court)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${
                            court.is_active ? 'bg-brand-blue-500' : 'bg-forest-700'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                              court.is_active ? 'left-[22px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      fullWidth
                      leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                      onClick={() => openEditor({ ...court })}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => setDeleting(court)}
                      aria-label={`Delete ${court.name || 'court'}`}
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────── Add / Edit modal ─────────────────────── */}
      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={requestCloseEditor}
          title={editing.id ? `Edit ${editing.name || 'Court'}` : 'Add New Court'}
          size="lg"
        >
          <div className="space-y-5">
            {/* Basics */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-cream">Basics</h3>
              <Input
                label="Court name"
                placeholder="e.g. Court 1 – Center Court"
                value={editing.name || ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <Textarea
                label="Description"
                rows={2}
                placeholder="What should customers know? Lighting, nets, surface feel..."
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <ImageUpload
                label="Court image"
                value={editing.image || editing.image_url || ''}
                onChange={(url) => setEditing({ ...editing, image: url, image_url: url })}
                folder="courts"
              />
            </section>

            {/* Pricing & hours */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-cream">Pricing and hours</h3>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <Input
                    label="Off-peak price per hour (₱)"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={prices.off}
                    onChange={(e) => setPrices({ ...prices, off: e.target.value })}
                  />
                  <p className="mt-1 text-[11px] text-cream-muted">Standard hours.</p>
                </div>
                <div>
                  <Input
                    label="Peak price per hour (₱)"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={prices.peak}
                    onChange={(e) => setPrices({ ...prices, peak: e.target.value })}
                  />
                  <p className="mt-1 text-[11px] text-cream-muted">
                    Charged during your busy hours (set in pricing/peak settings).
                  </p>
                </div>
                <Input
                  label="Opens at"
                  type="time"
                  value={editing.open_time || ''}
                  onChange={(e) => setEditing({ ...editing, open_time: e.target.value })}
                />
                <Input
                  label="Closes at"
                  type="time"
                  value={editing.close_time || ''}
                  onChange={(e) => setEditing({ ...editing, close_time: e.target.value })}
                />
              </div>
            </section>

            {/* Facilities */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-cream">Facilities</h3>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Input
                  label="Surface type"
                  placeholder="e.g. Acrylic, Concrete"
                  value={editing.surface || ''}
                  onChange={(e) => setEditing({ ...editing, surface: e.target.value })}
                />
                <Input
                  label="Dimensions"
                  placeholder="e.g. 44ft x 20ft"
                  value={editing.dimensions || ''}
                  onChange={(e) => setEditing({ ...editing, dimensions: e.target.value })}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-cream-muted">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map((a) => {
                    const isSelected = editing.amenities?.includes(a) || false;
                    return (
                      <button
                        key={a}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleAmenity(a)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? 'border-brand-blue-400 bg-brand-blue-500 text-white shadow-glow-blue'
                            : 'border-forest-700/80 bg-forest-950/60 text-cream-muted hover:border-brand-blue-400/40 hover:text-cream'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-cream cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_indoor || false}
                  onChange={(e) => setEditing({ ...editing, is_indoor: e.target.checked })}
                  className="h-4 w-4 rounded border-forest-600 bg-forest-950 accent-brand-blue-500 cursor-pointer"
                />
                Indoor court
              </label>
            </section>

            {/* Visibility */}
            <section className="rounded-xl border border-forest-700/80 bg-forest-950/50 p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active || false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-forest-600 bg-forest-950 accent-brand-blue-500 cursor-pointer"
                />
                <span>
                  <span className="block text-xs font-semibold text-cream">
                    Bookable by customers
                  </span>
                  <span className="mt-0.5 block text-[11px] text-cream-muted">
                    Turn off to hide this court from new bookings (e.g. maintenance). Existing
                    bookings are not cancelled automatically.
                  </span>
                </span>
              </label>
            </section>

            {/* Errors */}
            {formErrors.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200"
              >
                <p className="mb-1 font-semibold">Please fix the following:</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {formErrors.map((er) => (
                    <li key={er}>{er}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sticky bottom-0 -mx-4 -mb-4 mt-5 border-t border-forest-700/80 bg-forest-900/95 p-4 backdrop-blur-sm sm:static sm:mx-0 sm:mb-0 sm:bg-transparent sm:p-0 sm:pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  size="md"
                  fullWidth
                  isLoading={saving}
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                >
                  {editing.id ? 'Save changes' : 'Create court'}
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  fullWidth
                  className="sm:w-auto"
                  disabled={saving}
                  onClick={requestCloseEditor}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────── Discard changes ─────────────────────── */}
      {showDiscard && (
        <Modal
          isOpen={showDiscard}
          onClose={() => setShowDiscard(false)}
          title="Discard changes?"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-cream-muted">
              You have unsaved changes. If you leave now, they'll be lost.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button size="sm" variant="secondary" onClick={() => setShowDiscard(false)}>
                Keep editing
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setShowDiscard(false);
                  setEditing(null);
                }}
              >
                Discard changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────── Delete modal ─────────────────────── */}
      {deleting && (
        <Modal isOpen={!!deleting} onClose={closeDelete} title="Delete court" size="sm">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <div className="text-sm text-cream">
                <p className="font-semibold">Delete &quot;{deleting.name}&quot; permanently?</p>
                <p className="mt-1 text-xs text-cream-muted">
                  This can't be undone. If this court has bookings, deleting may fail. Hiding
                  it from customers is the safer option.
                </p>
              </div>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {deleteError}
                {deleting.is_active && (
                  <span className="mt-1 block text-cream-muted">
                    You can hide the court instead so customers can't book it.
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {deleting.is_active && (
                <Button
                  size="md"
                  variant="secondary"
                  fullWidth
                  disabled={saving}
                  leftIcon={<EyeOff className="h-4 w-4" />}
                  onClick={deactivateInstead}
                >
                  Hide from customers instead
                </Button>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  size="md"
                  fullWidth
                  isLoading={saving}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={handleDelete}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Delete court
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  fullWidth
                  className="sm:w-auto"
                  disabled={saving}
                  onClick={closeDelete}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────── Toast ─────────────────────── */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4"
      >
        {toast && (
          <div
            role="status"
            className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl ${
              toast.type === 'success'
                ? 'border-green-500/50 bg-green-900/90 text-green-50'
                : 'border-red-500/50 bg-red-900/90 text-red-50'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}