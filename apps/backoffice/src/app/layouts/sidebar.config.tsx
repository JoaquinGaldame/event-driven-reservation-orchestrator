import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ScienceIcon from '@mui/icons-material/Science';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HubIcon from '@mui/icons-material/Hub';
import GroupIcon from '@mui/icons-material/Group';
import { appRoutes } from '../routes';

export const sidebarSections = [
  {
    title: 'Operations',
    items: [
      {
        label: 'Dashboard',
        path: appRoutes.dashboard,
        icon: DashboardIcon,
      },
      {
        label: 'Reservations',
        path: appRoutes.reservations,
        icon: EventNoteIcon,
      },
      {
        label: 'Inventory',
        path: appRoutes.inventory,
        icon: InventoryIcon,
      },
      {
        label: 'Operational Console',
        path: appRoutes.operations,
        icon: SettingsSuggestIcon,
      },
      {
        label: 'Audit Explorer',
        path: appRoutes.audit,
        icon: ManageSearchIcon,
      },
      {
        label: 'Scenario Simulator',
        path: appRoutes.simulator,
        icon: ScienceIcon,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Properties',
        path: appRoutes.management.properties,
        icon: HomeWorkIcon,
      },
      {
        label: 'Units',
        path: appRoutes.management.units,
        icon: MeetingRoomIcon,
      },
      {
        label: 'Owners',
        path: appRoutes.management.owners,
        icon: AccountCircleIcon,
      },
      {
        label: 'Channels',
        path: appRoutes.management.channels,
        icon: HubIcon,
      },
      {
        label: 'Users & Roles',
        path: appRoutes.management.users,
        icon: GroupIcon,
      },
    ],
  },
] as const;