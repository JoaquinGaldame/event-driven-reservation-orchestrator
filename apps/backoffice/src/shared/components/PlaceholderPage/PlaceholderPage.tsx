import { Box, Paper, Typography } from '@mui/material';

type Props = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: Props) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          Module under construction
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          This page is part of the operations console foundation. Real data,
          tables, filters and workflows will be added incrementally.
        </Typography>
      </Paper>
    </Box>
  );
}