import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  reservations,
  timelineFor,
  type Reservation,
  type TimelineEvent,
} from '../../../mocks/index';
import { StatusBadge } from '../../../shared/components';

export function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'current' | 'failure'>('current');

  const reservation = useMemo(() => {
    const found = reservations.find((item) => item.reservationId === id);
    if (!found) {
      // Fallback to first reservation if not found
      return reservations[0];
    }
    return found;
  }, [id]);

  const currentTimeline = useMemo(() => timelineFor(reservation), [reservation]);

  const failureTimeline = useMemo(() => {
    // Create a realistic failure timeline for example
    const failedReservation = {
      ...reservation,
      reservationStatus: 'Failed' as const,
      paymentStatus: 'Failed' as const,
      inventoryLockStatus: 'Released' as const,
      failureReason: 'Payment gateway timeout (Stripe 504)',
      retryCount: 2,
    };
    return timelineFor(failedReservation);
  }, [reservation]);

  const events = tab === 'current' ? currentTimeline : failureTimeline;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {reservation.publicId} · {reservation.guestName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {reservation.propertyName} — {reservation.unitName} · {formatDate(reservation.checkIn)} → {formatDate(reservation.checkOut)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/reservations')}>
            Back
          </Button>
          <Button variant="outlined" size="small" startIcon={<ReplayIcon />}>
            Replay workflow
          </Button>
          <Button variant="contained" size="small">
            Manual override
          </Button>
        </Box>
      </Box>

      {/* Correlation banner */}
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <MetaPill label="Correlation ID" value={reservation.correlationId} />
            <MetaPill label="Idempotency Key" value={reservation.idempotencyKey} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <StatusBadge label={reservation.reservationStatus} tone={statusTone(reservation.reservationStatus)} />
            <StatusBadge label={reservation.paymentStatus} tone={statusTone(reservation.paymentStatus)} />
            <StatusBadge label={reservation.inventoryLockStatus} tone={statusTone(reservation.inventoryLockStatus)} />
          </Box>
        </Box>
      </Paper>

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 340px',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Left column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <BusinessSummary reservation={reservation} />


          {/* Timeline */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2, pt: 2 }}>
              <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700 }}>
                Event timeline
              </Typography>

              <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mt: 1 }}>
                <Tab value="current" label="This reservation" />
                <Tab value="failure" label="Failure example" />
              </Tabs>
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
              <ReadableTimeline events={events} />
            </Box>
          </Paper>
        </Box>

        {/* Right column */}
        <SidePanel reservation={reservation} />
      </Box>
    </Box>
  );
}


function BusinessSummary({ reservation }: { reservation: Reservation }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, mb: 2 }}>
        Business summary
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Info label="Guest" value={reservation.guestName} />
        <Info label="Channel" value={reservation.channel} />
        <Info label="Amount" value={`€${reservation.amount}`} />
        <Info label="Property" value={reservation.propertyName} />
        <Info label="Unit" value={reservation.unitName} />
        <Info label="Created" value={formatDateTime(reservation.createdAt)} />
      </Box>
    </Paper>
  );
}

// Clean timeline without technical JSON payloads
function ReadableTimeline({ events }: { events: TimelineEvent[] }) {
  // Remove duplicate last event if it's a duplicate
  const uniqueEvents = useMemo(() => {
    const result = [];
    for (let i = 0; i < events.length; i++) {
      if (i === events.length - 1 && i > 0 && events[i].eventType === events[i - 1].eventType) {
        continue; // Skip duplicate last event
      }
      result.push(events[i]);
    }
    return result;
  }, [events]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {uniqueEvents.map((event, index) => (
        <TimelineItem key={`${event.eventType}-${index}`} event={event} isLast={index === uniqueEvents.length - 1} />
      ))}
    </Box>
  );
}

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
      {/* Icon column */}
      <Box sx={{ flexShrink: 0, pt: 0.5 }}>
        {timelineIcon(event.status)}
      </Box>

      {/* Connector line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 11,
            top: 32,
            bottom: -16,
            width: 1.5,
            bgcolor: 'divider',
          }}
        />
      )}

      {/* Content */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.default',
          borderColor: event.status === 'error' ? 'error.main' : event.status === 'warn' ? 'warning.main' : 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {eventTitle(event.eventType)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {eventDescription(event)} · {formatTime(event.timestamp)}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={event.serviceName}
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontSize: 10 }}
          />
        </Box>

        {/* Additional context - no raw JSON */}
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {event.retry !== undefined && (
            <ContextChip label="Retry" value={`#${event.retry}`} />
          )}
          {event.note && (
            <ContextChip label="Reason" value={event.note} tone="error" />
          )}
          {/* Extract friendly payload info without JSON */}
          {event.payload && extractFriendlyPayloadInfo(event.payload).map((item) => (
            <ContextChip key={item.label} label={item.label} value={item.value} />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

function ContextChip({ label, value, tone }: { label: string; value: string | number; tone?: 'error' }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        border: '1px solid',
        borderColor: tone === 'error' ? 'error.main' : 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Typography sx={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: tone === 'error' ? 'error.main' : 'text.primary' }}>
        {String(value)}
      </Typography>
    </Box>
  );
}

// Extract friendly info from payload without showing JSON
function extractFriendlyPayloadInfo(payload: Record<string, unknown>): Array<{ label: string; value: string }> {
  const friendly: Array<{ label: string; value: string }> = [];

  if (payload.channel) {
    friendly.push({ label: 'Channel', value: String(payload.channel) });
  }
  if (payload.amount) {
    friendly.push({ label: 'Amount', value: `€${payload.amount}` });
  }
  if (payload.currency) {
    // currency already shown with amount, skip to avoid duplication
  }
  if (payload.unit) {
    friendly.push({ label: 'Unit', value: String(payload.unit) });
  }
  if (payload.lockTtl) {
    friendly.push({ label: 'Lock TTL', value: String(payload.lockTtl) });
  }
  if (payload.idempotencyKey) {
    friendly.push({ label: 'Idempotency Key', value: String(payload.idempotencyKey).slice(0, 20) });
  }

  return friendly;
}

function SidePanel({ reservation }: { reservation: Reservation }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, mb: 2 }}>
          Technical metadata
        </Typography>

        <Info label="reservationId" value={reservation.reservationId} mono />
        <Info label="publicId" value={reservation.publicId} mono />
        <Info label="correlationId" value={reservation.correlationId} mono />
        <Info label="idempotencyKey" value={reservation.idempotencyKey} mono />
        <Info label="retryCount" value={reservation.retryCount} mono />
        {reservation.failureReason && (
          <Info label="failureReason" value={reservation.failureReason} />
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, mb: 2 }}>
          Actions
        </Typography>

        <Button fullWidth variant="outlined" size="small" sx={{ mb: 1 }}>
          Retry last failed step
        </Button>
        <Button fullWidth variant="outlined" color="error" size="small">
          Trigger compensation
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          Privileged actions are role-gated and logged with your identity.
        </Typography>
      </Paper>
    </Box>
  );
}

// Helper components
function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <Chip
      variant="outlined"
      size="small"
      label={`${label}: ${value}`}
      sx={{ fontFamily: 'monospace', fontSize: 11 }}
    />
  );
}

function Info({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 0.25,
          color: 'text.primary',
          fontSize: 13,
          fontFamily: mono ? 'monospace' : undefined,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// Timeline icons
function timelineIcon(status: TimelineEvent['status']) {
  if (status === 'ok') return <CheckCircleIcon color="success" fontSize="small" />;
  if (status === 'error') return <ErrorIcon color="error" fontSize="small" />;
  if (status === 'warn') return <WarningAmberIcon color="warning" fontSize="small" />;
  return <AccessTimeIcon color="warning" fontSize="small" />;
}

// Friendly event titles
function eventTitle(type: string): string {
  const map: Record<string, string> = {
    ReservationRequested: 'Reservation request received',
    InventoryLockRequested: 'Inventory lock requested',
    InventoryLocked: 'Inventory locked',
    InventoryLockRejected: 'Inventory lock rejected',
    PaymentRequested: 'Payment requested',
    PaymentConfirmed: 'Payment confirmed',
    PaymentFailed: 'Payment failed',
    NotificationRequested: 'Notification requested',
    NotificationSent: 'Notification sent',
    NotificationFailed: 'Notification failed',
    ReservationConfirmed: 'Reservation confirmed',
    ReservationRejected: 'Reservation rejected',
    CompensationStarted: 'Compensation started',
    InventoryReleased: 'Inventory released',
    PaymentRefunded: 'Payment refunded',
  };
  return map[type] ?? type;
}

// Friendly event descriptions
function eventDescription(event: TimelineEvent): string {
  const map: Record<string, string> = {
    ReservationRequested: 'A channel submitted a reservation request',
    InventoryLockRequested: 'Requested inventory lock to prevent overbooking',
    InventoryLocked: 'Unit temporarily protected for this reservation',
    InventoryLockRejected: 'Unit could not be locked due to conflict',
    PaymentRequested: 'Payment step started',
    PaymentConfirmed: 'Payment provider confirmed the charge',
    PaymentFailed: 'Payment provider failed or rejected the charge',
    NotificationRequested: 'Preparing guest/operator notifications',
    NotificationSent: 'Notification sent successfully',
    NotificationFailed: 'Notification provider failed',
    ReservationConfirmed: 'Reservation completed successfully',
    ReservationRejected: 'Reservation rejected, will not be confirmed',
    CompensationStarted: 'Recovery flow started to undo side effects',
    InventoryReleased: 'Inventory lock released',
    PaymentRefunded: 'Payment refunded as part of compensation',
  };
  return map[event.eventType] ?? event.eventType;
}

function statusTone(value: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  if (['Confirmed', 'Paid', 'Active', 'ok'].includes(value)) return 'success';
  if (['Pending', 'warn'].includes(value)) return 'warning';
  if (['Failed', 'Rejected', 'error'].includes(value)) return 'error';
  if (['Compensated', 'Refunded', 'Released'].includes(value)) return 'info';
  return 'neutral';
}

function formatDate(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function formatTime(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString();
}

function formatDateTime(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}