export const appRoutes = {
  dashboard: '/',
  reservations: '/reservations',
  inventory: '/inventory',
  operations: '/operations',
  audit: '/audit',
  simulator: '/simulator',

  management: {
    properties: '/management/properties',
    units: '/management/units',
    owners: '/management/owners',
    channels: '/management/channels',
    users: '/management/users',
  },
} as const;