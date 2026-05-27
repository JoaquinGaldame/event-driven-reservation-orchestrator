import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 800 }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {actions && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}