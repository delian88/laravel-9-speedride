import { User, UserRole, Ride, RideStatus, VehicleType } from '../types';
import { Route } from './backend';

// This file acts as the "Frontend API Client" (Axios Wrapper)

export const storeEvents = new EventTarget();

class ApiClient {
  private currentUser: User | null = null;

  // --- AUTH ---
  async login(email: string, role: UserRole): Promise<User | null> {
    const res = await Route.dispatch('POST', '/api/login', { email, role });
    
    if (res.status === 200) {
      this.currentUser = res.data.user;
      this.notify();
      return res.data.user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
    this.notify();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // --- RIDES ---
  async requestRide(pickup: any, dropoff: any, vehicleType: VehicleType) {
    if (!this.currentUser) return;
    const res = await Route.dispatch('POST', '/api/rides', {
      riderId: this.currentUser.id,
      pickup,
      dropoff,
      vehicleType
    });
    this.notify();
    return res.data;
  }

  async getRides() {
    const res = await Route.dispatch('GET', '/api/rides');
    return res.data || [];
  }

  async acceptRide(rideId: string) {
    if (!this.currentUser) return;
    
    await Route.dispatch('PATCH', `/api/rides/${rideId}`, {
        id: rideId,
        updates: {
            status: RideStatus.ACCEPTED,
            driverId: this.currentUser.id
        }
    });
    this.notify();
  }

  async updateRideStatus(rideId: string, status: RideStatus) {
    await Route.dispatch('PATCH', `/api/rides/${rideId}`, {
        id: rideId,
        updates: { status }
    });
    this.notify();
  }

  // --- DRIVER ---
  async toggleOnline() {
    if (!this.currentUser) return;
    const res = await Route.dispatch('POST', '/api/user/online', {
        id: this.currentUser.id,
        isOnline: !this.currentUser.isOnline
    });
    this.currentUser = res.data;
    this.notify();
  }

  private notify() {
    storeEvents.dispatchEvent(new Event('update'));
  }
}

export const api = new ApiClient();
