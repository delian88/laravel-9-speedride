export enum UserRole {
  RIDER = 'RIDER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum RideStatus {
  SEARCHING = 'SEARCHING', // Rider looking for driver
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE', // Offered to a driver
  ACCEPTED = 'ACCEPTED', // Driver accepted
  ARRIVED = 'ARRIVED', // Driver at pickup
  IN_PROGRESS = 'IN_PROGRESS', // Driving to destination
  COMPLETED = 'COMPLETED', // Done
  CANCELLED = 'CANCELLED'
}

export enum VehicleType {
  UBER_X = 'UberX',
  UBER_BLACK = 'Uber Black',
  UBER_VAN = 'Uber Van'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  rating?: number;
  walletBalance?: number;
  isOnline?: boolean;
  totalTrips?: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: Location;
  dropoff: Location;
  status: RideStatus;
  fare: number;
  distance: number;
  vehicleType: VehicleType;
  createdAt: number;
  updatedAt: number;
  estimatedDuration: number; // minutes
}

// DTOs (Data Transfer Objects) - Mimicking Nest.js Patterns
export interface CreateRideDto {
  riderId: string;
  pickup: Location;
  dropoff: Location;
  vehicleType: VehicleType;
}

export interface UpdateRideStatusDto {
  rideId: string;
  status: RideStatus;
  driverId?: string;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message?: string;
}
