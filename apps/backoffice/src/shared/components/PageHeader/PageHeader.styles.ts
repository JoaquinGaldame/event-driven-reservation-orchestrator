import type { SxProps, Theme } from '@mui/material/styles';

export const pageHeaderRootSx: SxProps<Theme> = {
  mb: 3,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 2,
};

export const pageHeaderTitleSx: SxProps<Theme> = {
  fontWeight: 800,
};

export const pageHeaderDescriptionSx: SxProps<Theme> = {
  mt: 0.5,
};

export const pageHeaderActionsSx: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center',
};