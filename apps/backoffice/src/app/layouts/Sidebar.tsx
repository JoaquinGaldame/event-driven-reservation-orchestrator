import { Box, Typography } from '@mui/material';

export function Sidebar() {
  return (
    <Box
      width={280}
      borderRight="1px solid"
      borderColor="divider"
      p={3}
    >
      <Typography variant="h6">
        Event Orchestrator Console
      </Typography>
    </Box>
  );
}