import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentsIcon from '@mui/icons-material/Payments';
import BusinessIcon from '@mui/icons-material/Business';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TimerIcon from '@mui/icons-material/Timer';
import type { AttentionItem } from '../types';

type Props = {
  items: AttentionItem[];
};

type AttentionTone = 'warning' | 'critical' | 'info';

type AttentionRowProps = {
  icon: React.ReactNode;
  title: string;
  meta: string;
  tone: AttentionTone;
};

function getToneColor(tone: AttentionTone) {
  if (tone === 'critical') return 'error.main';
  if (tone === 'warning') return 'warning.main';
  return 'info.main';
}

function AttentionRow({ icon, title, meta, tone }: AttentionRowProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'background-color 140ms ease, border-color 140ms ease',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: getToneColor(tone),
        },
      }}
    >
      <Box
        sx={{
          mt: 0.15,
          color: getToneColor(tone),
          display: 'flex',
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            fontSize: 12,
            lineHeight: 1.25,
            color: 'text.primary',
          }}
          noWrap
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            color: 'text.secondary',
          }}
          noWrap
        >
          {meta}
        </Typography>
      </Box>
    </Paper>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Typography
      sx={{
        mb: 0.75,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'text.secondary',
      }}
    >
      {icon}
      {children}
    </Typography>
  );
}

export function NeedsAttentionPanel({ items }: Props) {
  const paymentFailure = items.find((item) => item.id === 'payment-failures');
  const dlq = items.find((item) => item.id === 'dlq-events');
  const stuckPayment = items.find((item) => item.id === 'stuck-payment');
  const inventoryLag = items.find((item) => item.id === 'inventory-lag');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: 'warning.main',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: 15,
          fontWeight: 800,
          mb: 0.5,
          color: 'text.primary',
        }}
      >
        <WarningAmberIcon fontSize="small" color="warning" />
        Needs attention
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: 11, mb: 2, lineHeight: 1.5 }}
      >
        Items in this panel require an operator decision. Click through to triage.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <SectionTitle icon={<TimerIcon sx={{ fontSize: 13 }} />}>
            Stuck workflows
          </SectionTitle>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {stuckPayment && (
              <AttentionRow
                icon={<TimerIcon fontSize="small" />}
                title="Stuck at PaymentRequested"
                meta="corr_34197500 · 8m"
                tone="warning"
              />
            )}

            <AttentionRow
              icon={<TimerIcon fontSize="small" />}
              title="Stuck at InventoryLockRequested"
              meta="corr_43498501 · 21m"
              tone="warning"
            />

            <AttentionRow
              icon={<TimerIcon fontSize="small" />}
              title="Stuck at NotificationRequested"
              meta="corr_52799502 · 34m"
              tone="warning"
            />
          </Box>
        </Box>

        <Box>
          <SectionTitle icon={<PaymentsIcon sx={{ fontSize: 13 }} />}>
            Payment failures
          </SectionTitle>

          {paymentFailure && (
            <AttentionRow
              icon={<PaymentsIcon fontSize="small" />}
              title="34 reservations awaiting compensation"
              meta="payments-svc · last 24h"
              tone="critical"
            />
          )}
        </Box>

        <Box>
          <SectionTitle icon={<BusinessIcon sx={{ fontSize: 13 }} />}>
            High-risk properties
          </SectionTitle>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <AttentionRow
              icon={<BusinessIcon fontSize="small" />}
              title="Kyoto Machiya — Gion"
              meta="Kyoto · 77% occ. · 6 overlaps"
              tone="warning"
            />

            <AttentionRow
              icon={<BusinessIcon fontSize="small" />}
              title="Brooklyn Heights Brownstone"
              meta="New York · 88% occ. · 0 overlaps"
              tone="critical"
            />
          </Box>
        </Box>

        <Box>
          <SectionTitle icon={<TimelineIcon sx={{ fontSize: 13 }} />}>
            Consumer lag
          </SectionTitle>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {inventoryLag && (
              <AttentionRow
                icon={<TimelineIcon fontSize="small" />}
                title="inventory-svc"
                meta="lag 184 · p99 312ms"
                tone="warning"
              />
            )}

            <AttentionRow
              icon={<TimelineIcon fontSize="small" />}
              title="notify-svc"
              meta="lag 421 · p99 540ms"
              tone="critical"
            />
          </Box>
        </Box>

        <Box>
          <SectionTitle icon={<ReportProblemIcon sx={{ fontSize: 13 }} />}>
            Dead-letter events
          </SectionTitle>

          {dlq && (
            <AttentionRow
              icon={<ReportProblemIcon fontSize="small" />}
              title="8 events in DLQ"
              meta="oldest 34m"
              tone="critical"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}