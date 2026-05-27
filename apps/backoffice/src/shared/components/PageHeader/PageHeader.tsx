import { Box, Typography } from '@mui/material';
import type { PageHeaderProps } from './PageHeader.types';
import {
  pageHeaderActionsSx,
  pageHeaderDescriptionSx,
  pageHeaderRootSx,
  pageHeaderTitleSx,
} from './PageHeader.styles';


export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Box sx={pageHeaderRootSx}>
      <Box>
        <Typography variant="h4" component="h1" sx={pageHeaderTitleSx}>
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={pageHeaderDescriptionSx}
          >
            {description}
          </Typography>
        )}
      </Box>

      {actions && <Box sx={pageHeaderActionsSx}>{actions}</Box>}
    </Box>
  );
}