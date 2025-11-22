import React, { useState, useEffect } from 'react';
import { User, Ride, VehicleType, RideStatus } from '../types';
import { api, storeEvents } from '../services/store';
import { MapVisualizer } from '../components/MapVisualizer';
import { VEHICLE_RATES } from '../constants';

export const RiderPanel: React.FC<{ user: User }> = ({ user }) => {
  const [pickup, setPickup] = useState('Times Square, NY');
  const [dropoff, setDropoff] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.UBER_X);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const refreshData = async () => {
    const allRides = await api.getRides();
    // Filter client-side for now, usually Backend handles this
    const myRides = allRides.filter(r => r.riderId === user.id);
    setRides(myRides);
    
    const active = myRides.find(r => 
      ![RideStatus.COMPLETED, RideStatus.CANCELLED].includes(r.status)
    );
    
    setActiveRide(active || null);
    if (active && active.status !== RideStatus.SEARCHING) {
        setIsSearching(false);
    } else if (active && active.status === RideStatus.SEARCHING) {
        setIsSearching(true);
    } else {
        setIsSearching(false);
    }
  };

  useEffect(() => {
    refreshData();
    storeEvents.addEventListener('update', refreshData);
    return () => storeEvents.removeEventListener('update', refreshData);
  }, []);

  const handleRequestRide = async () => {
    if (!dropoff) return;
    setIsSearching(true);
    await api.requestRide(
        { address: pickup, lat: 0, lng: 0 },
        { address: dropoff, lat: 0, lng: 0 },
        selectedVehicle
    );
  };

  // Calculate estimated price
  const baseDist = 5; // Mock distance
  const estimatedPrice = (baseDist * VEHICLE_RATES[selectedVehicle]).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Left: Booking / Status */}
        <div className="lg:col-span-1 flex flex-col gap-6 z-20">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                {activeRide ? (
                    // --- ACTIVE RIDE VIEW ---
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Trip Status</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                activeRide.status === RideStatus.SEARCHING ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                activeRide.status === RideStatus.ARRIVED ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {activeRide.status.replace('_', ' ')}
                            </span>
                        </div>

                        {activeRide.status === RideStatus.SEARCHING && (
                             <div className="text-center py-8">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600 font-medium">Finding you a nearby driver...</p>
                             </div>
                        )}

                        {activeRide.driverId && (
                            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=driver_${activeRide.driverId}`} className="w-12 h-12 rounded-full bg-white shadow-sm" alt="Driver" />
                                <div>
                                    <p className="text-sm text-slate-500">Your Driver</p>
                                    <p className="font-bold text-slate-900">Bob Driver</p>
                                    <div className="flex items-center text-xs text-yellow-500">
                                        <i className="fas fa-star"></i> 4.9
                                    </div>
                                </div>
                                <div className="ml-auto">
                                     <div className="text-right">
                                         <p className="text-xs text-slate-500">Vehicle</p>
                                         <p className="font-bold text-slate-800">Toyota Camry</p>
                                         <p className="text-xs text-slate-400">ABC-123</p>
                                     </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-sm"></div>
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Pickup</p>
                                <p className="font-medium text-slate-800">{activeRide.pickup.address}</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-sm"></div>
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Dropoff</p>
                                <p className="font-medium text-slate-800">{activeRide.dropoff.address}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- BOOKING VIEW ---
                    <>
                        <h2 className="text-3xl font-bold mb-6">Get a ride</h2>
                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-100 transition-colors cursor-text">
                                <i className="fas fa-circle text-xs text-slate-900"></i>
                                <input 
                                    className="bg-transparent w-full outline-none font-medium text-slate-700 placeholder-slate-400"
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-100 transition-colors">
                                <i className="fas fa-square text-xs text-slate-900"></i>
                                <input 
                                    className="bg-transparent w-full outline-none font-medium text-slate-700 placeholder-slate-400"
                                    placeholder="Enter destination"
                                    value={dropoff}
                                    onChange={(e) => setDropoff(e.target.value)}
                                />
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-900 mb-3">Choose a ride</h3>
                        <div className="space-y-3 mb-8">
                            {Object.values(VehicleType).map(type => (
                                <div 
                                    key={type}
                                    onClick={() => setSelectedVehicle(type)}
                                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                                        selectedVehicle === type 
                                        ? 'border-black bg-slate-50 shadow-sm' 
                                        : 'border-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="w-16 flex justify-center">
                                        {/* Icons for car types */}
                                        <i className={`fas fa-car text-2xl ${
                                            type === VehicleType.UBER_BLACK ? 'text-black' : 'text-slate-600'
                                        }`}></i>
                                    </div>
                                    <div className="flex-1 px-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{type}</span>
                                            <i className="fas fa-user text-xs text-slate-400"></i>
                                            <span className="text-xs text-slate-400">4</span>
                                        </div>
                                        <p className="text-xs text-slate-500">5 mins away</p>
                                    </div>
                                    <div className="font-bold text-slate-900">
                                        ${(baseDist * VEHICLE_RATES[type]).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleRequestRide}
                            disabled={!dropoff}
                            className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                        >
                            Request {selectedVehicle}
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-2 bg-slate-200 rounded-3xl overflow-hidden relative shadow-inner h-[500px] lg:h-auto">
             <MapVisualizer activeRide={activeRide || undefined} />
             
             {/* Overlay Controls */}
             <div className="absolute top-4 right-4 flex flex-col gap-2">
                 <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-black"><i className="fas fa-location-crosshairs"></i></button>
                 <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-black"><i className="fas fa-plus"></i></button>
             </div>
        </div>
    </div>
  );
};
