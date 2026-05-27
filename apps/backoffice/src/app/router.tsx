import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { PlaceholderPage } from '../shared/components/PlaceholderPage/PlaceholderPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <PlaceholderPage
            title="Business Dashboard"
            description="Executive overview of reservations, overbooking prevention, failures and operational risk."
          />
        ),
      },
      {
        path: 'reservations',
        element: (
          <PlaceholderPage
            title="Reservation Workflow Explorer"
            description="Inspect distributed reservation workflows, status transitions, correlation IDs and idempotency keys."
          />
        ),
      },
      {
        path: 'inventory',
        element: (
          <PlaceholderPage
            title="Inventory Control Center"
            description="Monitor availability, active locks, rejected overlaps and overbooking risk by property and unit."
          />
        ),
      },
      {
        path: 'operations',
        element: (
          <PlaceholderPage
            title="Operational Console"
            description="Operate failed events, stuck workflows, retries, service health and consumer lag."
          />
        ),
      },
      {
        path: 'audit',
        element: (
          <PlaceholderPage
            title="Audit Explorer"
            description="Search distributed event history by reservation, service, correlation ID, event type and status."
          />
        ),
      },
      {
        path: 'simulator',
        element: (
          <PlaceholderPage
            title="Scenario Simulator"
            description="Simulate duplicate webhooks, concurrent reservations, payment failures and service outages."
          />
        ),
      },
      {
        path: 'management/properties',
        element: (
          <PlaceholderPage
            title="Properties"
            description="Manage property metadata and operational context. Full CRUD will be introduced after core workflows."
          />
        ),
      },
      {
        path: 'management/units',
        element: (
          <PlaceholderPage
            title="Units"
            description="Manage units/resources protected by inventory locks to prevent overbooking."
          />
        ),
      },
      {
        path: 'management/owners',
        element: (
          <PlaceholderPage
            title="Owners"
            description="Manage owners and business context associated with properties, payouts and operational risk."
          />
        ),
      },
      {
        path: 'management/channels',
        element: (
          <PlaceholderPage
            title="Channels"
            description="Manage external event sources such as Airbnb, Booking.com, Vrbo, Direct and Admin."
          />
        ),
      },
      {
        path: 'management/users',
        element: (
          <PlaceholderPage
            title="Users & Roles"
            description="Manage access control for support agents, operators, analysts and platform administrators."
          />
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}