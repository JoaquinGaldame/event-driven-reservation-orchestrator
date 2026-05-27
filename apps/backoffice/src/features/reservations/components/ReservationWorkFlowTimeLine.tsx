import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { ReservationWorkflowEvent } from '../types';

type Props = {
  events: ReservationWorkflowEvent[];
};

function getIcon(status: ReservationWorkflowEvent['status']) {
  if (status === 'completed') return <CheckCircleIcon color="success" fontSize="small" />;
  if (status === 'failed') return <ErrorIcon color="error" fontSize="small" />;
  return <RadioButtonUncheckedIcon color="warning" fontSize="small" />;
}

export function ReservationWorkflowTimeline({ events }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 800, mb: 2 }}>
        Workflow timeline
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {events.map((event, index) => (
          <Box
            key={event.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '24px minmax(0, 1fr)',
              gap: 1.5,
              position: 'relative',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
              {getIcon(event.status)}
            </Box>

            {index < events.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 11,
                  top: 28,
                  bottom: -10,
                  width: 1,
                  bgcolor: 'divider',
                }}
              />
            )}

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.default',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: 'text.primary' }}>
                {event.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {event.description}
              </Typography>

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 11,
                  color: 'text.secondary',
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                }}
              >
                {event.service} · {event.timestamp}
              </Typography>

              {event.technicalPayload && (
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{
                    mt: 1,
                    bgcolor: 'transparent',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      Technical payload
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        fontSize: 11,
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(event.technicalPayload, null, 2)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Paper>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}