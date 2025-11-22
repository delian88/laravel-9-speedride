import { User, UserRole, VehicleType } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'rider_1',
    name: 'Alice Rider',
    email: 'alice@gocab.com',
    role: UserRole.RIDER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    rating: 4.8,
    walletBalance: 45.50,
    totalTrips: 12
  },
  {
    id: 'driver_1',
    name: 'Bob Driver',
    email: 'bob@gocab.com',
    role: UserRole.DRIVER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    rating: 4.9,
    isOnline: false,
    walletBalance: 120.00,
    totalTrips: 345
  },
  {
    id: 'admin_1',
    name: 'Super Admin',
    email: 'admin@gocab.com',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  }
];

export const VEHICLE_RATES = {
  [VehicleType.UBER_X]: 1.2,
  [VehicleType.UBER_BLACK]: 2.8,
  [VehicleType.UBER_VAN]: 2.0
};

export const MAP_STYLES = {
    // Just a constant for reference, CSS handles the actual visual
    default: 'mapbox://styles/mapbox/streets-v11'
};
