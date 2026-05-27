import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../contexts/ThemeModeContext';

type Props = {
  onToggleSidebar: () => void;
};

export function Topbar({ onToggleSidebar }: Props) {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton onClick={onToggleSidebar}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Reservation Operations Console
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Distributed workflows, inventory locks, idempotency and auditability
          </Typography>
        </Box>

        <Chip
          label="Mock mode"
          size="small"
          color="warning"
          variant="outlined"
        />

        <IconButton>
          <SearchIcon />
        </IconButton>

        <IconButton onClick={toggleTheme}>
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}