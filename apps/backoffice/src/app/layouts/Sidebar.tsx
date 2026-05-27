import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { sidebarSections } from './sidebar.config';

type Props = {
  open: boolean;
};

export function Sidebar({ open }: Props) {
  return (
    <Box
      sx={{
        width: open ? 300 : 72,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 180ms ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: open ? 3 : 2,
          minHeight: 88,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: open ? 'flex-start' : 'center',
        }}
      >
        {open ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
              Orchestrator
            </Typography>

            <Typography variant="body2" color="text.secondary" noWrap>
              Operations Console
            </Typography>
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            OC
          </Typography>
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          px: open ? 2 : 1,
          py: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {sidebarSections.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            {open && (
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
            )}

            <List dense disablePadding sx={{ mt: open ? 1 : 0 }}>
              {section.items.map((item) => {
                const Icon = item.icon;

                const navItem = (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    sx={{
                      minHeight: 40,
                      borderRadius: 2,
                      mb: 0.5,
                      px: open ? 1.5 : 1,
                      justifyContent: open ? 'flex-start' : 'center',
                      '&.active': {
                        bgcolor: 'action.selected',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: open ? 36 : 0,
                        mr: open ? 1 : 0,
                        justifyContent: 'center',
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>

                    {open && <ListItemText primary={item.label} />}
                  </ListItemButton>
                );

                return open ? (
                  navItem
                ) : (
                  <Tooltip key={item.path} title={item.label} placement="right">
                    {navItem}
                  </Tooltip>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}