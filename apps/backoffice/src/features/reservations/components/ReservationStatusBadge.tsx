import { Tooltip } from '@mui/material';
import { StatusBadge } from '../../../shared/components';
import type {
  InventoryLockStatus,
  PaymentStatus,
  ReservationStatus,
} from '../types';

type Props = {
  value: ReservationStatus | PaymentStatus | InventoryLockStatus;
  kind?: 'reservation' | 'payment' | 'inventory';
};

const labelMap: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  rejected: 'Rejected',
  failed: 'Failed',
  compensated: 'Compensated',
  cancelled: 'Cancelled',
  paid: 'Paid',
  refunded: 'Refunded',
  not_required: 'N/A',
  active: 'Active',
  released: 'Released',
  expired: 'Expired',
};

const toneMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  confirmed: 'success',
  paid: 'success',
  active: 'success',
  pending: 'warning',
  failed: 'error',
  rejected: 'error',
  compensated: 'info',
  refunded: 'info',
  released: 'info',
  cancelled: 'neutral',
  expired: 'neutral',
  not_required: 'neutral',
};

const helpMap: Record<string, string> = {
  confirmed: 'The reservation completed successfully.',
  pending: 'The workflow is still in progress.',
  rejected: 'The reservation was rejected before confirmation.',
  failed: 'A technical or payment failure occurred.',
  compensated: 'A rollback or recovery action was completed.',
  paid: 'Funds were captured successfully.',
  active: 'The inventory lock is currently held.',
  released: 'The inventory lock was released.',
};

export function ReservationStatusBadge({ value }: Props) {
  return (
    <Tooltip title={helpMap[value] ?? labelMap[value] ?? value} arrow>
      <span>
        <StatusBadge
          label={labelMap[value] ?? value}
          tone={toneMap[value] ?? 'neutral'}
        />
      </span>
    </Tooltip>
  );
}