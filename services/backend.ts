import { User as IUser, UserRole, Ride as IRide, RideStatus, VehicleType, CreateRideDto, UpdateRideStatusDto } from '../types';
import { MOCK_USERS, VEHICLE_RATES } from '../constants';

/**
 * LARAVEL 9 BACKEND SIMULATION
 * 
 * This file mimics the structure of a Laravel application.
 * It includes:
 * - Eloquent ORM (simulated via LocalStorage)
 * - Controllers (AuthController, RideController)
 * - API Routes
 */

// --- HELPER: RESPONSE CLASS ---
class JsonResponse {
    constructor(public data: any, public status: number = 200, public message: string = 'OK') {}
}

// --- HELPER: REQUEST CLASS ---
export class Request {
    constructor(public body: any = {}, public query: any = {}) {}
    
    input(key: string, defaultValue: any = null) {
        return this.body[key] !== undefined ? this.body[key] : defaultValue;
    }

    all() {
        return this.body;
    }
}

// --- ELOQUENT ORM SIMULATION ---
// Mimics Laravel's Model class functionality
class Model {
    static table: string;
    protected attributes: any = {};

    constructor(attributes: any = {}) {
        this.attributes = attributes;
    }

    static getStore(): any[] {
        const data = localStorage.getItem(`laravel_${this.table}`);
        return data ? JSON.parse(data) : [];
    }

    static setStore(data: any[]) {
        localStorage.setItem(`laravel_${this.table}`, JSON.stringify(data));
    }

    static all(): any[] {
        return this.getStore();
    }

    static find(id: string): any | null {
        const items = this.getStore();
        return items.find((i: any) => i.id === id) || null;
    }

    static where(field: string, value: any): any[] {
        return this.getStore().filter((i: any) => i[field] === value);
    }

    static create(attributes: any): any {
        const items = this.getStore();
        const newItem = {
            ...attributes,
            id: `${this.table}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        items.push(newItem);
        this.setStore(items);
        return newItem;
    }

    static update(id: string, attributes: any): any | null {
        const items = this.getStore();
        const index = items.findIndex((i: any) => i.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...attributes, updated_at: new Date().toISOString() };
        this.setStore(items);
        return items[index];
    }

    // Seeder
    static seed(data: any[]) {
        if (this.getStore().length === 0) {
            this.setStore(data);
        }
    }
}

// --- MODELS ---

class User extends Model {
    static table = 'users';
}

class Ride extends Model {
    static table = 'rides';
}

// Initialize Mock Data (Seeding)
User.seed(MOCK_USERS);

// --- CONTROLLERS ---

class AuthController {
    public async login(request: Request) {
        const email = request.input('email');
        const role = request.input('role');

        const users = User.where('email', email);
        const user = users.find((u: any) => u.role === role);

        if (user) {
            return new JsonResponse({ user, token: 'mock_jwt_token' }, 200);
        }

        return new JsonResponse({ error: 'Unauthorized' }, 401);
    }

    public async me(request: Request) {
        // Mocking token validation by just returning a user if ID is provided
        const id = request.input('id');
        const user = User.find(id);
        return user ? new JsonResponse(user) : new JsonResponse({}, 401);
    }
}

class RideController {
    public async index(request: Request) {
        // In a real app, we would paginate here
        const rides = Ride.all();
        return new JsonResponse(rides);
    }

    public async store(request: Request) {
        const { riderId, pickup, dropoff, vehicleType } = request.all();
        
        // Business Logic: Calculate Fare
        const distance = Math.floor(Math.random() * 15) + 2; 
        const rate = VEHICLE_RATES[vehicleType as VehicleType] || 1.5;
        const fare = Math.round(distance * rate * 100) / 100;

        const ride = Ride.create({
            riderId,
            pickup,
            dropoff,
            vehicleType,
            status: RideStatus.SEARCHING,
            fare,
            distance,
            estimatedDuration: Math.round(distance * 3),
        });

        // Simulation: Dispatch Job to match driver
        this.dispatchMatchJob(ride.id);

        return new JsonResponse(ride, 201);
    }

    public async update(request: Request) {
        const id = request.input('id');
        const updates = request.input('updates'); // Status, DriverId, etc.

        const ride = Ride.update(id, updates);
        
        if (!ride) return new JsonResponse({ error: 'Ride not found' }, 404);
        
        return new JsonResponse(ride);
    }

    // Mocking a Laravel Job/Queue
    private dispatchMatchJob(rideId: string) {
        setTimeout(() => {
            const ride = Ride.find(rideId);
            if (ride && ride.status === RideStatus.SEARCHING) {
                Ride.update(rideId, { status: RideStatus.PENDING_ACCEPTANCE });
            }
        }, 3000);
    }
}

class UserController {
    public async toggleOnline(request: Request) {
        const id = request.input('id');
        const isOnline = request.input('isOnline');
        
        const user = User.update(id, { isOnline });
        return new JsonResponse(user);
    }
}

// --- API ROUTES (routes/api.php) ---

const authController = new AuthController();
const rideController = new RideController();
const userController = new UserController();

export const Route = {
    dispatch: async (method: string, uri: string, body: any = {}): Promise<JsonResponse> => {
        const req = new Request(body);

        // Simulating Network Latency
        await new Promise(resolve => setTimeout(resolve, 400));

        try {
            // Route Definitions
            if (method === 'POST' && uri === '/api/login') return await authController.login(req);
            if (method === 'POST' && uri === '/api/user/online') return await userController.toggleOnline(req);
            
            if (method === 'GET' && uri === '/api/rides') return await rideController.index(req);
            if (method === 'POST' && uri === '/api/rides') return await rideController.store(req);
            if (method === 'PATCH' && uri.startsWith('/api/rides')) {
                 // Extract ID from params logic simulated here by passing it in body for simplicity
                 return await rideController.update(req);
            }

            return new JsonResponse({ error: 'Route not found' }, 404);
        } catch (e) {
            console.error(e);
            return new JsonResponse({ error: 'Internal Server Error' }, 500);
        }
    }
};
