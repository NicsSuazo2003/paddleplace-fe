import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  CalendarOff,
  Plus,
  Trash2,
  Save,
  Building2,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  QrCode,
  Smartphone,
  Banknote,
  Edit3,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import { adminService } from '@/services/adminService';
import {
  formatDateLong,
  todayISO,
  toISODate,
  addDays,
} from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';
import type { ClientSettings, PaymentMethod } from '@/types';
import { StaffManagement } from '@/components/ui/StaffManagement';
import { Modal } from '@/components/ui/Modal';

const PAYMENT_TYPE_OPTIONS = [
  { value: 'gcash', label: 'GCash', icon: '📱' },
  { value: 'qr_ph', label: 'QR Ph (Bank QR)', icon: '📷' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'e_wallet', label: 'E-Wallet', icon: '💳' },
  { value: 'other', label: 'Other', icon: '🔗' },
];

const ICON_OPTIONS = [
  { value: 'Smartphone', icon: Smartphone },
  { value: 'QrCode', icon: QrCode },
  { value: 'Banknote', icon: Banknote },
  { value: 'CreditCard', icon: CreditCard },
  { value: 'Wallet', icon: Wallet },
  { value: 'Building2', icon: Building2 },
];

export function Settings() {
  const { user } = useAuthStore();

  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const blockedDates = useAdminStore((state) => state.blockedDates);

  const loadCourts = useAdminStore((state) => state.loadCourts);
  const loadBlockedDates = useAdminStore((state) => state.loadBlockedDates);
  const addBlockedDate = useAdminStore((state) => state.addBlockedDate);
  const removeBlockedDate = useAdminStore((state) => state.removeBlockedDate);

  const { updateProfile, changePassword } = useAuthStore();

  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [blockDate, setBlockDate] = useState(toISODate(addDays(new Date(), 7)));
  const [blockReason, setBlockReason] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [isFullDay, setIsFullDay] = useState(true);

  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileMsg, setProfileMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [passwordMsg, setPasswordMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);

  const [methodMsg, setMethodMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [uploadingQR, setUploadingQR] = useState(false);

  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    type: 'other',
    icon: 'Smartphone',
    enabled: true,
    config: {
      account_name: '',
      account_number: '',
      qr_image_url: '',
      instructions: '',
    },
  });

  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadCourts();
    loadPaymentMethods();

    (async () => {
      try {
        const settings = await adminService.getSettings();
        setClientSettings(settings);
      } catch (err) {
        console.error('Failed to load client settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedCourtId) {
      loadBlockedDates(selectedCourtId);
    }
  }, [selectedCourtId, loadBlockedDates]);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0]?.id || '');
    }
  }, [courts, selectedCourtId]);

  useEffect(() => {
    setProfileName(user?.name ?? '');
    setProfileEmail(user?.email ?? '');
    setProfilePhone(user?.phone ?? '');
  }, [user]);

  const loadPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const settings = await adminService.getSettings();
      if (settings.payment_methods && settings.payment_methods.length > 0) {
        setPaymentMethods(settings.payment_methods);
      } else {
        setPaymentMethods([
          {
            id: '1',
            name: 'GCash',
            type: 'gcash',
            icon: 'Smartphone',
            enabled: true,
            config: {
              account_name: APP_CONFIG.gcashAccountName || 'Paddle Place',
              account_number: APP_CONFIG.gcashNumber || '09XX XXX XXXX',
            },
            sort_order: 0,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const savePaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      await adminService.updateSettings({ payment_methods: methods });
      setPaymentMethods(methods);
      return true;
    } catch (error) {
      console.error('Failed to save payment methods:', error);
      setMethodMsg({ type: 'error', text: 'Failed to save payment methods' });
      return false;
    }
  };

  const handleQrUpload = async (file: File): Promise<string | null> => {
    setUploadingQR(true);
    setMethodMsg(null);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const token = localStorage.getItem('admin_token');

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL ?? APP_CONFIG.apiUrl;

      const response = await fetch(`${baseUrl}/api/files/upload`, {
        method: 'POST',
        headers: {
          'X-Client-Subdomain':
            import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'paddleplace',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.url;

      if (imageUrl) {
        setFormData({
          ...formData,
          config: { ...formData.config, qr_image_url: imageUrl },
        });
        setMethodMsg({ type: 'success', text: 'QR code uploaded successfully!' });
        return imageUrl;
      }
      throw new Error('No URL returned from upload');
    } catch (error) {
      setMethodMsg({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload QR code',
      });
      return null;
    } finally {
      setUploadingQR(false);
    }
  };

  const handleAddMethod = async () => {
    if (!formData.name?.trim()) {
      setMethodMsg({ type: 'error', text: 'Payment method name is required.' });
      return;
    }

    setSavingMethod(true);
    setMethodMsg(null);

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      type: (formData.type as PaymentMethod['type']) || 'other',
      icon: formData.icon || 'Smartphone',
      enabled: formData.enabled !== undefined ? formData.enabled : true,
      config: {
        account_name: formData.config?.account_name || '',
        account_number: formData.config?.account_number || '',
        qr_image_url: formData.config?.qr_image_url || '',
        instructions: formData.config?.instructions || '',
      },
      sort_order: paymentMethods.length,
    };

    const updated = [...paymentMethods, newMethod];
    const success = await savePaymentMethods(updated);

    if (success) {
      setMethodMsg({ type: 'success', text: `"${newMethod.name}" added successfully.` });
      setShowAddModal(false);
      resetForm();
      await loadPaymentMethods();
    }
    setSavingMethod(false);
  };

  const handleEditMethod = async () => {
    if (!editingMethod) return;
    if (!formData.name?.trim()) {
      setMethodMsg({ type: 'error', text: 'Payment method name is required.' });
      return;
    }

    setSavingMethod(true);
    setMethodMsg(null);

    const updatedMethod: PaymentMethod = {
      ...editingMethod,
      name: formData.name.trim(),
      type: (formData.type as PaymentMethod['type']) || editingMethod.type,
      icon: formData.icon || editingMethod.icon,
      enabled: formData.enabled !== undefined ? formData.enabled : editingMethod.enabled,
      config: {
        account_name: formData.config?.account_name ?? editingMethod.config?.account_name ?? '',
        account_number: formData.config?.account_number ?? editingMethod.config?.account_number ?? '',
        qr_image_url: formData.config?.qr_image_url ?? editingMethod.config?.qr_image_url ?? '',
        instructions: formData.config?.instructions ?? editingMethod.config?.instructions ?? '',
      },
    };

    const updated = paymentMethods.map((method) =>
      method.id === editingMethod.id ? updatedMethod : method
    );

    const success = await savePaymentMethods(updated);
    if (success) {
      setMethodMsg({ type: 'success', text: `"${updatedMethod.name}" updated successfully.` });
      setEditingMethod(null);
      resetForm();
      await loadPaymentMethods();
    }
    setSavingMethod(false);
  };

  const handleToggleMethod = async (id: string) => {
    const method = paymentMethods.find((m) => m.id === id);
    if (!method) return;
    const updated = paymentMethods.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    await savePaymentMethods(updated);
    setPaymentMethods(updated);
  };

  const handleDeleteMethod = async (id: string) => {
    const method = paymentMethods.find((m) => m.id === id);
    if (!method) return;
    if (!confirm(`Remove "${method.name}" from payment options?`)) return;

    const updated = paymentMethods.filter((m) => m.id !== id);
    const success = await savePaymentMethods(updated);
    if (success) {
      setPaymentMethods(updated);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      icon: 'Smartphone',
      enabled: true,
      config: {
        account_name: '',
        account_number: '',
        qr_image_url: '',
        instructions: '',
      },
    });
    setMethodMsg(null);
  };

  const handleEditClick = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      icon: method.icon,
      enabled: method.enabled,
      config: { ...method.config },
    });
    setMethodMsg(null);
  };

  const handleAddBlock = async () => {
    if (!selectedCourtId || !blockDate) return;

    const payload: any = {
      court_id: selectedCourtId,
      date: blockDate,
      reason: blockReason || 'Maintenance',
    };

    if (!isFullDay && blockStartTime && blockEndTime) {
      payload.startTime = blockStartTime;
      payload.endTime = blockEndTime;
    }

    await addBlockedDate(payload);
    if (selectedCourtId) {
      await loadBlockedDates(selectedCourtId);
    }

    setBlockReason('');
    setBlockStartTime('');
    setBlockEndTime('');
    setIsFullDay(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const filteredBlocked = selectedCourtId
    ? blockedDates.filter((b) => b.court_id === selectedCourtId)
    : blockedDates;

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);
  const Layout = user?.role === 'staff' ? StaffLayout : AdminLayout;

  return (
    <Layout>
      <div className="container-page py-6 sm:py-8 text-cream">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-xs text-cream-muted sm:text-sm">
            Manage your account credentials, payout methods, and blocked schedules
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-16" />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* Account Info */}
            <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-cream sm:text-lg">
                <SettingsIcon className="h-5 w-5 text-brand-blue-300" />
                Account Profile
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Display Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
                <Input
                  label="Mobile Number"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </div>

              {profileMsg && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                    profileMsg.type === 'success'
                      ? 'border-mint-400/40 bg-mint-500/15 text-mint-300'
                      : 'border-error/40 bg-error/15 text-error'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {profileMsg.text}
                </div>
              )}

              <div className="mt-5 border-t border-forest-700/80 pt-4">
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={savingProfile}
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </Button>
              </div>
            </div>

            {/* Change Password */}
            <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-cream sm:text-lg">
                <Lock className="h-5 w-5 text-brand-blue-300" />
                Change Password
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  hint="At least 8 characters"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordMsg && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                    passwordMsg.type === 'success'
                      ? 'border-mint-400/40 bg-mint-500/15 text-mint-300'
                      : 'border-error/40 bg-error/15 text-error'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {passwordMsg.text}
                </div>
              )}

              <div className="mt-5 border-t border-forest-700/80 pt-4">
                <Button
                  variant="secondary"
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={savingPassword}
                  onClick={handleChangePassword}
                >
                  Update Password
                </Button>
              </div>
            </div>

            {/* Payment Methods */}
            {isAdmin && (
              <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-base font-bold text-cream sm:text-lg">
                      <Wallet className="h-5 w-5 text-brand-blue-300" />
                      Checkout Payment Options
                    </h2>
                    <p className="mt-0.5 text-xs text-cream-muted sm:text-sm">
                      Configure GCash, Bank Transfer, and QR codes displayed to clients during checkout
                    </p>
                  </div>

                  <Button
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                  >
                    Add Method
                  </Button>
                </div>

                {loadingPaymentMethods ? (
                  <LoadingSpinner className="py-8" />
                ) : paymentMethods.length === 0 ? (
                  <div className="rounded-xl border border-forest-700/80 bg-forest-950/60 py-8 text-center">
                    <Wallet className="mx-auto h-10 w-10 text-cream-muted/30" />
                    <p className="mt-3 text-sm font-semibold text-cream-muted">No payment methods configured.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((method) => {
                        const IconComponent =
                          ICON_OPTIONS.find((i) => i.value === method.icon)?.icon || Smartphone;

                        return (
                          <div
                            key={method.id}
                            className="flex flex-col gap-3 rounded-xl border border-forest-700/80 bg-forest-950/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3.5">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-blue-400/30 bg-brand-blue-500/20 text-brand-blue-300 shadow-inner">
                                <IconComponent className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate font-bold text-cream text-sm sm:text-base">
                                    {method.name}
                                  </p>
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                                      method.enabled
                                        ? 'border border-mint-400/40 bg-mint-500/20 text-mint-300'
                                        : 'border border-error/40 bg-error/20 text-error'
                                    }`}
                                  >
                                    {method.enabled ? 'Active' : 'Disabled'}
                                  </span>
                                </div>

                                <p className="truncate text-xs text-cream-muted mt-0.5">
                                  {method.type.replace('_', ' ').toUpperCase()}
                                  {method.config?.account_name && (
                                    <span> · {method.config.account_name}</span>
                                  )}
                                  {method.config?.account_number && (
                                    <span className="font-mono ml-1 text-brand-blue-300">
                                      ({method.config.account_number})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 sm:justify-start">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={method.enabled}
                                  onChange={() => handleToggleMethod(method.id)}
                                  className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full border border-forest-600 bg-forest-800 transition-all after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-mint-500 peer-checked:after:translate-x-full peer-focus:outline-none" />
                              </label>

                              <button
                                onClick={() => handleEditClick(method)}
                                className="rounded-lg border border-forest-600 bg-forest-800/80 p-2 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300 active:scale-95"
                                title="Edit Method"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteMethod(method.id)}
                                className="rounded-lg border border-forest-600 bg-forest-800/80 p-2 text-cream-muted transition hover:border-error hover:text-error active:scale-95"
                                title="Delete Method"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Blocked Dates */}
            {isAdmin && (
              <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
                <h2 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-cream sm:text-lg">
                  <CalendarOff className="h-5 w-5 text-brand-blue-300" />
                  Blocked Dates & Maintenance
                </h2>

                <p className="mb-4 text-xs text-cream-muted sm:text-sm">
                  Block specific courts for private tournaments, holidays, or maintenance
                </p>

                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream-muted">
                    Filter By Court
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {courts.map((court) => {
                      if (!court) return null;
                      const isSelected = selectedCourtId === court.id;
                      return (
                        <button
                          key={court.id}
                          onClick={() => {
                            setSelectedCourtId(court.id);
                            loadBlockedDates(court.id);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            isSelected
                              ? 'border-brand-blue-400 bg-brand-blue-500 text-white shadow-glow-blue'
                              : 'border-forest-700/80 bg-forest-950/70 text-cream-muted hover:border-brand-blue-400/50 hover:text-cream'
                          }`}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {court.name || 'Court'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5 grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
                  <Input
                    label="Date to Block"
                    type="date"
                    min={todayISO()}
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                  />

                  <div className="flex items-end">
                    <label className="flex w-full items-center gap-2 rounded-xl border border-forest-700/80 bg-forest-950/70 px-3.5 py-2.5 text-xs font-semibold text-cream cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFullDay}
                        onChange={(e) => {
                          setIsFullDay(e.target.checked);
                          if (e.target.checked) {
                            setBlockStartTime('');
                            setBlockEndTime('');
                          }
                        }}
                        className="h-4 w-4 rounded border-forest-600 bg-forest-950 accent-brand-blue-500 cursor-pointer"
                      />
                      <span>Full Day Block</span>
                    </label>
                  </div>

                  {!isFullDay && (
                    <>
                      <Input
                        label="Start Time"
                        type="time"
                        value={blockStartTime}
                        onChange={(e) => setBlockStartTime(e.target.value)}
                        leftIcon={<Clock className="h-4 w-4 text-brand-blue-300" />}
                      />
                      <Input
                        label="End Time"
                        type="time"
                        value={blockEndTime}
                        onChange={(e) => setBlockEndTime(e.target.value)}
                        leftIcon={<Clock className="h-4 w-4 text-brand-blue-300" />}
                      />
                    </>
                  )}

                  <Input
                    label="Reason"
                    placeholder="e.g. Tournament, Resurfacing"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={handleAddBlock}
                    disabled={!blockDate || !selectedCourtId}
                  >
                    Block Date
                  </Button>
                </div>

                <div className="space-y-2.5 border-t border-forest-700/80 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                    {selectedCourt ? `${selectedCourt.name} — ` : ''}Active Blocks
                  </p>

                  {filteredBlocked.length === 0 ? (
                    <div className="rounded-xl border border-forest-700/60 bg-forest-950/40 py-6 text-center">
                      <CalendarOff className="mx-auto h-8 w-8 text-cream-muted/30" />
                      <p className="mt-2 text-xs font-semibold text-cream-muted">
                        No blocked dates scheduled for this court.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredBlocked.map((block) => (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between gap-3 rounded-xl border border-forest-700/70 bg-forest-950/70 p-3.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-cream">
                              {formatDateLong(block.date)}
                              {(block as any).startTime && (block as any).endTime && (
                                <span className="ml-2 font-mono text-xs font-semibold text-brand-blue-300">
                                  {(block as any).startTime} – {(block as any).endTime}
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-cream-muted mt-0.5">
                              {block.reason}
                            </p>
                          </div>

                          <button
                            onClick={() => removeBlockedDate(block.id)}
                            className="rounded-lg border border-forest-600 bg-forest-800/60 p-2 text-cream-muted transition hover:border-error hover:text-error active:scale-95"
                            title="Remove block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )}

            {/* Staff Management */}
            {isAdmin && <StaffManagement />}

            {/* App Info */}
            <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
              <h2 className="mb-4 font-display text-base font-bold text-cream sm:text-lg">
                System Information
              </h2>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream-muted">Platform</p>
                  <p className="mt-1 text-sm font-bold text-cream">{APP_CONFIG.name}</p>
                </div>

                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream-muted">Established</p>
                  <p className="mt-1 text-sm font-bold text-cream">Est. {APP_CONFIG.established}</p>
                </div>

                <div className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream-muted">Built By</p>
                  <p className="mt-1 text-sm font-bold text-cream">{APP_CONFIG.developer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Payment Method Modal */}
      <Modal
        isOpen={showAddModal || !!editingMethod}
        onClose={() => {
          setShowAddModal(false);
          setEditingMethod(null);
          resetForm();
        }}
        title={editingMethod ? `Edit ${editingMethod.name}` : 'Add Payment Method'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Payment Method Name"
            placeholder="e.g. GCash, Maya, BPI Online, QR Ph"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream-muted">
                Payment Type
              </label>
              <select
                value={formData.type || 'other'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })
                }
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/70 px-3.5 py-2.5 text-sm text-cream transition focus:border-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
              >
                {PAYMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-forest-900">
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream-muted">
                Display Icon
              </label>
              <select
                value={formData.icon || 'Smartphone'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/70 px-3.5 py-2.5 text-sm text-cream transition focus:border-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-forest-900">
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-forest-700/80 pt-4 space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-blue-300">
              Account Credentials
            </p>

            <Input
              label="Account Holder Name"
              placeholder="e.g. Paddle Place"
              value={formData.config?.account_name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, account_name: e.target.value },
                })
              }
            />

            {(formData.type === 'gcash' || formData.type === 'e_wallet') && (
              <Input
                label="Account Number"
                placeholder="09XX XXX XXXX"
                value={formData.config?.account_number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, account_number: e.target.value },
                  })
                }
              />
            )}

            {(formData.type === 'qr_ph' || formData.type === 'gcash') && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  QR Code Image
                  {uploadingQR && <Loader2 className="ml-2 inline h-4 w-4 animate-spin text-brand-blue-300" />}
                </label>

                {formData.config?.qr_image_url ? (
                  <div className="rounded-xl border border-forest-700/80 bg-forest-950/80 p-4">
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                      <img
                        src={formData.config.qr_image_url}
                        alt="QR Code"
                        className="h-24 w-24 rounded-lg border border-forest-700 object-contain bg-white p-1"
                      />
                      <div className="min-w-0 text-center sm:text-left">
                        <p className="text-xs font-bold text-mint-300">QR Code Linked ✓</p>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              config: { ...formData.config, qr_image_url: '' },
                            })
                          }
                          className="mt-2 text-xs font-medium text-error hover:underline"
                        >
                          Remove QR Image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-forest-700/80 bg-forest-950/40 p-5 text-center transition hover:border-brand-blue-400/50">
                    <ImageIcon className="mx-auto h-8 w-8 text-cream-muted/40" />
                    <p className="mt-2 text-xs text-cream-muted">Upload QR code for instant client scans</p>
                    <label className="mt-3 inline-block cursor-pointer">
                      <span className="rounded-xl border border-brand-blue-400/40 bg-brand-blue-500/20 px-3.5 py-1.5 text-xs font-semibold text-brand-blue-300 transition hover:bg-brand-blue-500 hover:text-white">
                        {uploadingQR ? 'Uploading...' : 'Choose QR Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingQR}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) await handleQrUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            <Textarea
              label="Checkout Instructions (optional)"
              rows={2}
              placeholder="e.g. Please put your name or booking reference in the notes..."
              value={formData.config?.instructions || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, instructions: e.target.value },
                })
              }
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-cream cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled !== undefined ? formData.enabled : true}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-forest-600 bg-forest-950 accent-brand-blue-500 cursor-pointer"
              />
              Active (Visible during client checkout)
            </label>
          </div>

          {methodMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                methodMsg.type === 'success'
                  ? 'border-mint-400/40 bg-mint-500/15 text-mint-300'
                  : 'border-error/40 bg-error/15 text-error'
              }`}
            >
              {methodMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {methodMsg.text}
            </div>
          )}

          <div className="sticky bottom-0 -mx-4 -mb-4 mt-5 border-t border-forest-700/80 bg-forest-900/95 p-4 backdrop-blur-sm sm:static sm:mx-0 sm:mb-0 sm:bg-transparent sm:p-0 sm:pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button
                size="md"
                fullWidth
                isLoading={savingMethod}
                leftIcon={<Save className="h-4 w-4" />}
                onClick={editingMethod ? handleEditMethod : handleAddMethod}
              >
                {editingMethod ? 'Save Changes' : 'Add Payment Method'}
              </Button>
              <Button
                size="md"
                variant="ghost"
                fullWidth
                className="sm:w-auto"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMethod(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}