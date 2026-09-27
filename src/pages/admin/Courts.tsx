import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit3, Save, Trash2, Plus, AlertTriangle } from 'lucide-react';
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
  type: 'indoor',
  is_indoor: true,
  is_active: true,
  status: 'active',
};

export function Courts() {
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateCourt = useAdminStore((state) => state.updateCourt);
  const createCourt = useAdminStore((state) => state.createCourt);
  const deleteCourt = useAdminStore((state) => state.deleteCourt);

  const [editing, setEditing] = useState<Court | null>(null);
  const [deleting, setDeleting] = useState<Court | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await updateCourt(editing);
      } else {
        await createCourt(editing);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting?.id) return;
    setSaving(true);
    setDeleteError(null);
    try {
      await deleteCourt(deleting.id);
      setDeleting(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

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

  const getImageUrl = (court: Court): string => {
    return (
      court?.image ||
      court?.image_url ||
      'https://images.pexels.com/photos/17299530/pexels-photo-17299530.jpeg?auto=compress&cs=tinysrgb&w=1200'
    );
  };

  return (
    <AdminLayout>
      <div className="container-page py-6 sm:py-8 text-cream">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
              Courts Management
            </h1>
            <p className="mt-1 text-xs text-cream-muted sm:text-sm">
              Manage court details, peak/off-peak pricing, and available amenities
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setEditing({ ...BLANK_COURT })}
          >
            Add Court
          </Button>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-16" />
        ) : courts.length === 0 ? (
          <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/60 py-12 text-center shadow-xl backdrop-blur-sm">
            <Building2 className="mx-auto h-12 w-12 text-cream-muted/40" />
            <p className="mt-4 text-sm font-medium text-cream-muted">No courts found.</p>
            <p className="text-xs text-cream-muted/60">Click &quot;Add Court&quot; to create one.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court, i) => {
              if (!court) return null;

              return (
                <motion.div
                  key={court.id || `court-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 overflow-hidden shadow-xl backdrop-blur-sm transition-all hover:border-brand-blue-400/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 overflow-hidden sm:h-44">
                      <img
                        src={getImageUrl(court)}
                        alt={court?.name || 'Court'}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.pexels.com/photos/17299530/pexels-photo-17299530.jpeg?auto=compress&cs=tinysrgb&w=1200';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            court?.is_active
                              ? 'border border-accentGreen-400/40 bg-accentGreen-500/20 text-accentGreen-300'
                              : 'border border-red-500/40 bg-red-500/20 text-red-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              court?.is_active ? 'bg-accentGreen-400' : 'bg-red-400'
                            }`}
                          />
                          {court?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="font-display text-base font-bold text-cream sm:text-lg">
                        {court?.name || 'Unnamed Court'}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-cream-muted leading-relaxed">
                        {court?.description || 'No description provided.'}
                      </p>

                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {(court?.amenities || []).slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2 py-0.5 text-[10px] font-medium text-cream-muted"
                          >
                            {a}
                          </span>
                        ))}
                        {(court?.amenities || []).length > 4 && (
                          <span className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2 py-0.5 text-[10px] font-semibold text-brand-blue-300">
                            +{(court?.amenities || []).length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-forest-700/80 pt-3.5">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                            Off-Peak
                          </p>
                          <p className="text-sm font-extrabold text-brand-blue-300 sm:text-base">
                            {formatCurrency(court?.price_per_hour || 0)}
                            <span className="text-[10px] font-normal text-cream-muted">/hr</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                            Peak
                          </p>
                          <p className="text-sm font-extrabold text-brand-blue-300 sm:text-base">
                            {formatCurrency(court?.peak_price_per_hour || 0)}
                            <span className="text-[10px] font-normal text-cream-muted">/hr</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-[11px] font-medium text-cream-muted">
                        Operating Hours:{' '}
                        <span className="text-cream">
                          {court?.open_time || 'N/A'} – {court?.close_time || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      fullWidth
                      leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                      onClick={() => court && setEditing({ ...court })}
                      disabled={!court}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => court && setDeleting(court)}
                      disabled={!court}
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

      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          title={editing.id ? `Edit ${editing.name || 'Court'}` : 'Add New Court'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Court Name"
              value={editing.name || ''}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />

            <Textarea
              label="Description"
              rows={2}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Input
                label="Price per Hour (Off-Peak)"
                type="number"
                value={editing.price_per_hour || 0}
                onChange={(e) =>
                  setEditing({ ...editing, price_per_hour: Number(e.target.value) })
                }
              />
              <Input
                label="Peak Price per Hour"
                type="number"
                value={editing.peak_price_per_hour || 0}
                onChange={(e) =>
                  setEditing({ ...editing, peak_price_per_hour: Number(e.target.value) })
                }
              />
              <Input
                label="Opening Time"
                type="time"
                value={editing.open_time || '08:00'}
                onChange={(e) => setEditing({ ...editing, open_time: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={editing.close_time || '22:00'}
                onChange={(e) => setEditing({ ...editing, close_time: e.target.value })}
              />
            </div>

            <ImageUpload
              label="Court Image"
              value={editing.image || editing.image_url || ''}
              onChange={(url) => setEditing({ ...editing, image: url, image_url: url })}
              folder="courts"
            />

            <Input
              label="Surface Type"
              placeholder="e.g. Acrylic Sport Coating, Concrete"
              value={editing.surface || ''}
              onChange={(e) => setEditing({ ...editing, surface: e.target.value })}
            />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cream-muted">
                Amenities
              </p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((a) => {
                  const isSelected = editing.amenities?.includes(a) || false;
                  return (
                    <button
                      key={a}
                      type="button"
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-cream cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_indoor || false}
                  onChange={(e) => setEditing({ ...editing, is_indoor: e.target.checked })}
                  className="h-4 w-4 rounded border-forest-600 bg-forest-950 accent-brand-blue-500 cursor-pointer"
                />
                Indoor Court
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-cream cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active || false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-forest-600 bg-forest-950 accent-brand-blue-500 cursor-pointer"
                />
                Active (Bookable by public)
              </label>
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 mt-5 border-t border-forest-700/80 bg-forest-900/95 p-4 backdrop-blur-sm sm:static sm:mx-0 sm:mb-0 sm:bg-transparent sm:p-0 sm:pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  size="md"
                  fullWidth
                  isLoading={saving}
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                >
                  {editing.id ? 'Save Changes' : 'Create Court'}
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  fullWidth
                  className="sm:w-auto"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal
          isOpen={!!deleting}
          onClose={() => {
            setDeleting(null);
            setDeleteError(null);
          }}
          title="Delete Court"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <div className="text-sm text-cream">
                <p className="font-semibold">Delete &quot;{deleting.name}&quot; permanently?</p>
                <p className="mt-1 text-xs text-cream-muted">
                  This cannot be undone. If the court has existing bookings, deletion may
                  fail — deactivate it instead.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {deleteError}
              </div>
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
                Delete Court
              </Button>
              <Button
                size="md"
                variant="ghost"
                fullWidth
                className="sm:w-auto"
                onClick={() => {
                  setDeleting(null);
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}