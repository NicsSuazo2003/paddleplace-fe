// src/pages/admin/SecurityLogs.tsx
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Filter, Eye, EyeOff, AlertTriangle, Info, XCircle, Search } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { apiRequest, ApiError } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SecurityEventDto {
  id: string;
  clientId: string;
  ipHash: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  eventType: string;
  severity: string;
  message: string | null;
  metadata: unknown;
  success: boolean;
  errorCode: string | null;
  createdAt: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; icon: typeof Info }> = {
  info: { bg: 'bg-brand-blue-500/15', text: 'text-brand-blue-300', icon: Info },
  warning: { bg: 'bg-amber-500/15', text: 'text-amber-300', icon: AlertTriangle },
  critical: { bg: 'bg-red-500/15', text: 'text-red-300', icon: XCircle },
};

export function SecurityLogs() {
  const [events, setEvents] = useState<SecurityEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hideRateLimit, setHideRateLimit] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('take', '200');
      if (hideRateLimit) params.set('hideRateLimit', 'true');
      if (severityFilter) params.set('severity', severityFilter);
      if (eventTypeFilter) params.set('eventType', eventTypeFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await apiRequest<SecurityEventDto[]>(
        `/api/admin/security-events?${params.toString()}`
      );
      setEvents(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load security events.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.eventType));
    return Array.from(set).sort();
  }, [events]);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-cream sm:text-3xl">
              <Shield className="h-7 w-7 text-brand-blue-300" />
              Security Logs
            </h1>
            <p className="mt-1 text-sm text-cream-muted">
              Login attempts, password resets, rate limits, and other security events
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="self-start rounded-xl border border-forest-700 bg-forest-800/80 px-4 py-2 text-sm font-semibold text-cream transition hover:border-brand-blue-400 hover:text-brand-blue-300 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream-muted">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full rounded-xl border border-forest-700 bg-forest-950 px-3 py-2 text-sm text-cream focus:border-brand-blue-400 focus:outline-none"
              >
                <option value="">All</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                Event Type
              </label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-forest-700 bg-forest-950 px-3 py-2 text-sm text-cream focus:border-brand-blue-400 focus:outline-none"
              >
                <option value="">All</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                Search (IP, message, user agent)
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                  placeholder="e.g. 192.168 or 'failed'"
                  className="w-full rounded-xl border border-forest-700 bg-forest-950 pl-9 pr-3 py-2 text-sm text-cream focus:border-brand-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-forest-700/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-cream-muted hover:text-cream">
              <input
                type="checkbox"
                checked={hideRateLimit}
                onChange={(e) => setHideRateLimit(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-forest-700 bg-forest-950"
              />
              {hideRateLimit ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              Hide rate-limit noise
            </label>
            <button
              onClick={load}
              disabled={loading}
              className="self-start rounded-xl bg-brand-blue-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue-400 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner className="py-16" />}

        {!loading && error && (
          <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-10 text-center text-sm text-cream-muted">
            No security events match the current filters.
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-2">
            {events.map((event) => {
              const sev = SEVERITY_STYLES[event.severity] ?? SEVERITY_STYLES.info;
              const SevIcon = sev.icon;
              const expanded = expandedId === event.id;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-forest-700/80 bg-forest-900/80 backdrop-blur-sm"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : event.id)}
                    className="flex w-full items-start gap-3 p-3 text-left transition hover:bg-forest-800/60 sm:p-4"
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${sev.bg} ${sev.text}`}>
                      <SevIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-blue-300">
                          {event.eventType}
                        </span>
                        <span className={`rounded-full ${sev.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sev.text}`}>
                          {event.severity}
                        </span>
                        {!event.success && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                            FAILED
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-cream">
                        {event.message ?? '(no message)'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-cream-muted">
                        {new Date(event.createdAt).toLocaleString()} · {event.ipAddress ?? event.ipHash?.slice(0, 12) ?? 'no-ip'}
                      </p>
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-forest-700/60 p-3 text-xs sm:p-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-cream-muted">ID:</span>{' '}
                          <span className="font-mono text-cream">{event.id}</span>
                        </div>
                        <div>
                          <span className="text-cream-muted">Client ID:</span>{' '}
                          <span className="font-mono text-cream">{event.clientId}</span>
                        </div>
                        <div>
                          <span className="text-cream-muted">IP:</span>{' '}
                          <span className="font-mono text-cream">{event.ipAddress ?? '—'}</span>
                        </div>
                        <div>
                          <span className="text-cream-muted">IP hash:</span>{' '}
                          <span className="font-mono text-cream">{event.ipHash?.slice(0, 16) ?? '—'}</span>
                        </div>
                        <div>
                          <span className="text-cream-muted">User agent:</span>{' '}
                          <span className="font-mono text-cream break-all">
                            {event.userAgent ?? '—'}
                          </span>
                        </div>
                        {event.errorCode && (
                          <div>
                            <span className="text-cream-muted">Error code:</span>{' '}
                            <span className="font-mono text-cream">{event.errorCode}</span>
                          </div>
                        )}
                      </div>

                      {event.metadata != null && (
                        <div className="mt-3">
                          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-cream-muted">
                            Metadata
                          </div>
                          <pre className="overflow-x-auto rounded-lg border border-forest-700/60 bg-forest-950/80 p-3 text-[11px] leading-relaxed text-cream-muted">
{JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}