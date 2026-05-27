import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../contexts/ThemeModeContext';

export function Topbar() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Operations Console
        </Typography>

        <IconButton onClick={toggleTheme}>
          {mode === 'dark'
            ? <LightModeIcon />
            : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}