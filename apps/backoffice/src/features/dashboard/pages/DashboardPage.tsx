import { Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { PageHeader } from '../../../shared/components/PageHeader';
import {
  channelDistribution,
  dashboardKpis,
  inventoryPressure,
  needsAttention,
  reservationTrend,
} from '../mock/dashboard.mock'
import { DashboardKpiGrid } from '../components/DashboardKpiGrid';
import { NeedsAttentionPanel } from '../components/NeedsAttentionPanel';
import { ReservationTrendChart } from '../components/ReservationTrendChart';
import { ChannelDistributionChart } from '../components/ChannelDistributionChart';
import { InventoryPressureChart } from '../components/InventoryPressureChart';

export function DashboardPage() {
  return (
    <Box
      sx={{
        maxWidth: 1900,
        mx: 'auto',
      }}
    >
      <PageHeader
        title="Business Dashboard"
        description="Last 24h · prod-eu-west-1 · multi-channel reservation orchestration"
        actions={
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1fr) 300px',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DashboardKpiGrid items={dashboardKpis} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 2fr) minmax(320px, 1fr)',
              },
              gap: 2,
            }}
          >
            <ReservationTrendChart data={reservationTrend} />
            <ChannelDistributionChart data={channelDistribution} />
          </Box>

          <InventoryPressureChart data={inventoryPressure} />
        </Box>

        <NeedsAttentionPanel items={needsAttention} />
      </Box>
    </Box>
  );
}