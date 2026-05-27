import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './layouts/AppShell.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <div>Dashboard</div>,
      },
      {
        path: 'reservations',
        element: <div>Reservations</div>,
      },
      {
        path: 'inventory',
        element: <div>Inventory</div>,
      },
      {
        path: 'operations',
        element: <div>Operations</div>,
      },
      {
        path: 'audit',
        element: <div>Audit</div>,
      },
      {
        path: 'simulator',
        element: <div>Simulator</div>,
      },
      {
        path: 'management/properties',
        element: <div>Properties</div>,
      },
      {
        path: 'management/units',
        element: <div>Units</div>,
      },
      {
        path: 'management/owners',
        element: <div>Owners</div>,
      },
      {
        path: 'management/channels',
        element: <div>Channels</div>,
      },
      {
        path: 'management/users',
        element: <div>Users</div>,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}