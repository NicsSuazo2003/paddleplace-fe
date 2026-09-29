import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image } from 'lucide-react';
import { APP_CONFIG } from '@/utils/constants';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = 'courts',
  label = 'Upload Image',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const clientSubdomain =
        import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'paddleplace';
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL ?? APP_CONFIG.apiUrl;

      if (!apiBaseUrl) {
        throw new Error('API base URL is not configured');
      }

      const response = await fetch(`${apiBaseUrl}/api/files/upload?folder=${folder}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Client-Subdomain': clientSubdomain,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    if (onRemove) onRemove();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-cream-muted">
          {label}
        </label>
      )}

      <div className="flex items-start gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {value ? (
          <div className="relative group">
            <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-forest-700/80 bg-forest-950 shadow-md">
              <img
                src={value}
                alt="Uploaded"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/128x128?text=Error';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-charcoal/70 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-brand-blue-500/90 p-2 text-white transition hover:bg-brand-blue-500"
                  title="Change image"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-lg bg-error/90 p-2 text-white transition hover:bg-error"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest-700/90 bg-forest-950/40 text-cream-muted transition-all hover:border-brand-blue-400 hover:bg-brand-blue-500/5 hover:text-brand-blue-200 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-brand-blue-400" />
            ) : (
              <>
                <Image className="h-7 w-7 text-cream-muted/60" />
                <span className="text-xs font-medium">Upload Image</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
}