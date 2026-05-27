import { Box, Paper, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/Error';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { AttentionItem } from '../types';

type Props = {
  items: AttentionItem[];
};

const severityIcon = {
  warning: <WarningAmberIcon fontSize="small" color="warning" />,
  critical: <ErrorOutlineIcon fontSize="small" color="error" />,
  info: <InfoOutlinedIcon fontSize="small" color="info" />,
};

export function NeedsAttentionPanel({ items }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        height: '100%',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        Needs attention
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Items requiring operator decision or investigation.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              bgcolor: 'background.default',
            }}
          >
            {severityIcon[item.severity]}

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {item.title}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {item.description}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}