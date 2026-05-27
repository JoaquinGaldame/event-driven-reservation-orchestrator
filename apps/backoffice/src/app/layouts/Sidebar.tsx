import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { sidebarSections } from './sidebar.config';

export function Sidebar() {
  return (
    <Box
      sx={{
        width: 300,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Orchestrator
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Operations Console
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 2 }}>
        {sidebarSections.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                px: 1.5,
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </Typography>

            <List dense disablePadding sx={{ mt: 1 }}>
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.active': {
                        bgcolor: 'action.selected',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>

                    <ListItemText primary={item.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}