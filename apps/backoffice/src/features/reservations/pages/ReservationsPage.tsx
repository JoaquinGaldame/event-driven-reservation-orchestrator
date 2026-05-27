import { Box, Button, MenuItem, Paper, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatusBadge } from '../../../shared/components';
import {
  reservations,
  type Channel,
  type Reservation,
  type ReservationStatus,
} from '../../../mocks/index';

const channels: Array<Channel | 'all'> = ['all', 'Airbnb', 'Booking.com', 'Vrbo', 'Direct', 'Admin'];
const statuses: Array<ReservationStatus | 'all'> = ['all', 'Confirmed', 'Pending', 'Rejected', 'Failed', 'Compensated', 'Cancelled'];

export function ReservationsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState<Channel | 'all'>('all');
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    return reservations.filter((r) => {
      if (channel !== 'all' && r.channel !== channel) return false;
      if (status !== 'all' && r.reservationStatus !== status) return false;

      if (!query) return true;

      return [
        r.publicId,
        r.reservationId,
        r.guestName,
        r.correlationId,
        r.idempotencyKey,
        r.propertyName,
        r.unitName,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [q, channel, status]);

  const columns: GridColDef<Reservation>[] = [
    {
      field: 'publicId',
      headerName: 'Public ID',
      width: 130,
      renderCell: ({ row }) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          {row.publicId}
        </Box>
      ),
    },
    {
      field: 'guestName',
      headerName: 'Guest · Property',
      flex: 1,
      minWidth: 300,
      renderCell: ({ row }) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: 13 }}>{row.guestName}</Box>
          <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
            {row.propertyName} · {row.unitName}
          </Box>
        </Box>
      ),
    },
    {
      field: 'channel',
      headerName: 'Channel',
      width: 120,
      renderCell: ({ row }) => (
        <Box sx={{ fontSize: 13 }}>{row.channel}</Box>
      ),
    },
    {
      field: 'dates',
      headerName: 'Dates',
      width: 190,
      valueGetter: (_value, row) =>
        `${new Date(row.checkIn).toLocaleDateString()} → ${new Date(row.checkOut).toLocaleDateString()}`,
    },
    {
      field: 'reservationStatus',
      headerName: 'Reservation',
      width: 130,
      renderCell: ({ row }) => (
        <StatusBadge label={row.reservationStatus} tone={statusTone(row.reservationStatus)} />
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 110,
      renderCell: ({ row }) => (
        <StatusBadge label={row.paymentStatus} tone={statusTone(row.paymentStatus)} />
      ),
    },
    {
      field: 'inventoryLockStatus',
      headerName: 'Inv. Lock',
      width: 110,
      renderCell: ({ row }) => (
        <StatusBadge label={row.inventoryLockStatus} tone={statusTone(row.inventoryLockStatus)} />
      ),
    },
    {
      field: 'correlationId',
      headerName: 'Correlation',
      width: 160,
      renderCell: ({ row }) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
          {row.correlationId}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityOutlinedIcon />}
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/reservations/${row.reservationId}`);
          }}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Reservation Workflow Explorer"
        description={`${rows.length} reservations · live multi-channel feed`}
        actions={
          <Button variant="outlined" size="small" startIcon={<FilterAltOutlinedIcon />}>
            Saved views
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(260px, 420px) 180px 180px',
            },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            placeholder="Search publicId, guest, correlationId..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <TextField
            select
            size="small"
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel | 'all')}
          >
            {channels.map((item) => (
              <MenuItem key={item} value={item}>
                {item === 'all' ? 'All channels' : item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReservationStatus | 'all')}
          >
            {statuses.map((item) => (
              <MenuItem key={item} value={item}>
                {item === 'all' ? 'All statuses' : item}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.reservationId}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
          }}
          onRowClick={(params) => navigate(`/reservations/${params.row.reservationId}`)}
          sx={{
            border: 0,
            minHeight: 620,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'background.default',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: 'text.secondary',
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'divider',
              cursor: 'pointer',
            },
          }}
        />
      </Paper>
    </Box>
  );
}

function statusTone(value: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  if (['Confirmed', 'Paid', 'Active', 'healthy', 'ok'].includes(value)) return 'success';
  if (['Pending', 'warning', 'degraded'].includes(value)) return 'warning';
  if (['Failed', 'Rejected', 'critical', 'error'].includes(value)) return 'error';
  if (['Compensated', 'Refunded', 'Released'].includes(value)) return 'info';
  return 'neutral';
}