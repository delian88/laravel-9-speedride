import React, { useState, useEffect } from 'react';
import { User, Ride, RideStatus } from '../types';
import { api, storeEvents } from '../services/store';
import { MapVisualizer } from '../components/MapVisualizer';

export const DriverPanel: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('drive');
  const [requests, setRequests] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isOnline, setIsOnline] = useState(user.isOnline);

  const refresh = async () => {
    const allRides = await api.getRides();
    
    // 1. Find rides waiting for acceptance (Driver view)
    const pending = allRides.filter(r => r.status === RideStatus.PENDING_ACCEPTANCE);
    setRequests(pending);

    // 2. Find MY active ride
    const myRide = allRides.find(r => 
        r.driverId === user.id && 
        [RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS].includes(r.status)
    );
    setActiveRide(myRide || null);

    const currentUser = api.getCurrentUser();
    setIsOnline(currentUser?.isOnline);
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 2000); // Poll simulated backend
    storeEvents.addEventListener('update', refresh);
    return () => {
        clearInterval(timer);
        storeEvents.removeEventListener('update', refresh);
    }
  }, [user.id]);

  const handleToggleOnline = () => {
    api.toggleOnline();
  };

  const handleAccept = (rideId: string) => {
    api.acceptRide(rideId);
  };

  const updateStatus = (newStatus: RideStatus) => {
    if(activeRide) api.updateRideStatus(activeRide.id, newStatus);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
        {/* Sidebar / Status Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
            {/* Online Toggle */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center">
                <button 
                    onClick={handleToggleOnline}
                    className={`w-24 h-24 rounded-full shadow-inner flex items-center justify-center text-3xl mb-4 transition-all duration-300 ${
                        isOnline 
                        ? 'bg-green-500 text-white shadow-green-200 ring-4 ring-green-100' 
                        : 'bg-slate-200 text-slate-400 shadow-slate-300'
                    }`}
                >
                    <i className="fas fa-power-off"></i>
                </button>
                <h2 className="font-bold text-xl text-slate-800">{isOnline ? 'You are Online' : 'You are Offline'}</h2>
                <p className="text-slate-500 text-sm">{isOnline ? 'Looking for nearby trips...' : 'Go online to receive requests'}</p>
            </div>

            {/* Request Card */}
            {isOnline && !activeRide && requests.map(req => (
                <div key={req.id} className="bg-black text-white p-6 rounded-2xl shadow-2xl animate-bounce-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <div className="h-full bg-yellow-400 w-2/3"></div> {/* Mock Timer */}
                    </div>
                    <div className="flex justify-between items-start mb-4 mt-2">
                        <div>
                            <h3 className="text-2xl font-bold">${req.fare}</h3>
                            <p className="text-slate-400 text-sm">{req.vehicleType}</p>
                        </div>
                        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                            4.5 mi
                        </div>
                    </div>
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-map-pin text-green-400"></i>
                            <span className="text-sm font-medium truncate">{req.pickup.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <i className="fas fa-location-arrow text-red-400"></i>
                            <span className="text-sm font-medium truncate">{req.dropoff.address}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleAccept(req.id)}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-lg"
                    >
                        Accept Trip
                    </button>
                </div>
            ))}

            {/* Stats Mini */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
                <h3 className="font-bold mb-4 text-slate-800">Today's Earnings</h3>
                <div className="text-4xl font-black text-slate-900 mb-2">$142.50</div>
                <div className="text-sm text-green-600 font-medium mb-6">
                    <i className="fas fa-arrow-up mr-1"></i> 12% vs yesterday
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Trips</span>
                        <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Online Hours</span>
                        <span className="font-bold">4.5h</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Map / Trip Area */}
        <div className="flex-1 bg-slate-100 rounded-3xl shadow-inner border border-slate-200 relative overflow-hidden flex flex-col">
             {activeRide ? (
                 <>
                    <div className="flex-1 relative">
                        <MapVisualizer activeRide={activeRide} isDriver />
                    </div>
                    <div className="bg-white p-6 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <i className="fas fa-user text-slate-400 text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Rider #{activeRide.riderId.split('_')[1]}</h3>
                                    <div className="flex gap-2 text-xs">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                            {activeRide.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                                    <i className="fas fa-phone"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             {activeRide.status === RideStatus.ACCEPTED && (
                                 <button onClick={() => updateStatus(RideStatus.ARRIVED)} className="col-span-2 py-4 bg-black text-white rounded-xl font-bold hover:opacity-90">
                                     Arrived at Pickup
                                 </button>
                             )}
                             {activeRide.status === RideStatus.ARRIVED && (
                                 <button onClick={() => updateStatus(RideStatus.IN_PROGRESS)} className="col-span-2 py-4 bg-green-600 text-white rounded-xl font-bold hover:opacity-90">
                                     Start Trip
                                 </button>
                             )}
                             {activeRide.status === RideStatus.IN_PROGRESS && (
                                 <button onClick={() => updateStatus(RideStatus.COMPLETED)} className="col-span-2 py-4 bg-red-600 text-white rounded-xl font-bold hover:opacity-90">
                                     Complete Trip
                                 </button>
                             )}
                        </div>
                    </div>
                 </>
             ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                     <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-map-marked-alt text-3xl text-slate-400"></i>
                     </div>
                     <p className="font-medium">Map View</p>
                     <p className="text-sm">Waiting for a trip...</p>
                 </div>
             )}
        </div>
    </div>
  );
};
