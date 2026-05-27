import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Sidebar open={sidebarOpen} />

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}