import { Chip } from '@mui/material';

export type StatusTone =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const toneToColor: Record<StatusTone, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  neutral: 'default',
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <Chip
      label={label}
      color={toneToColor[tone]}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 700,
        borderRadius: 999,
        textTransform: 'capitalize',
      }}
    />
  );
}