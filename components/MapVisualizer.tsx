import React, { useEffect, useState } from 'react';
import { Ride, RideStatus } from '../types';

interface MapVisualizerProps {
  activeRide?: Ride;
  isDriver?: boolean;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ activeRide, isDriver }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!activeRide) {
        setProgress(0);
        return;
    }
    
    let target = 0;
    // Map status to progress
    switch(activeRide.status) {
        case RideStatus.SEARCHING: target = 0; break;
        case RideStatus.ACCEPTED: target = 15; break;
        case RideStatus.ARRIVED: target = 0; break; // Driver is AT pickup
        case RideStatus.IN_PROGRESS: target = 100; break; // Moving to Dropoff
        case RideStatus.COMPLETED: target = 100; break;
        default: target = 0;
    }

    // If in progress, animate smoothly from 0 to 100 over time (mocking GPS)
    if (activeRide.status === RideStatus.IN_PROGRESS) {
        const interval = setInterval(() => {
            setProgress(p => (p < 100 ? p + 0.5 : 100));
        }, 100);
        return () => clearInterval(interval);
    } else {
        setProgress(target);
    }
  }, [activeRide?.status, activeRide?.id]);

  // Coordinates simulation
  const startX = 20; const startY = 70;
  const endX = 80; const endY = 30;
  
  const currentX = startX + (endX - startX) * (progress / 100);
  const currentY = startY + (endY - startY) * (progress / 100);

  return (
    <div className="w-full h-full bg-slate-100 relative map-pattern overflow-hidden">
        {/* --- Map Background Layers --- */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
                {/* Grid/Blocks */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        {/* --- Route Line --- */}
        {activeRide && activeRide.status !== RideStatus.SEARCHING && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Path Shadow */}
                <path d={`M${startX} ${startY} Q 50 80 ${endX} ${endY}`} stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="none" />
                {/* Actual Path */}
                <path d={`M${startX} ${startY} Q 50 80 ${endX} ${endY}`} stroke="#1f2937" strokeWidth="2" strokeDasharray="4" fill="none" />
                
                {/* Pickup Point */}
                <circle cx={startX} cy={startY} r="1.5" fill="black" />
                <text x={startX} y={startY + 5} fontSize="3" textAnchor="middle" className="font-bold">PICKUP</text>

                {/* Dropoff Point */}
                <circle cx={endX} cy={endY} r="1.5" fill="black" />
                <text x={endX} y={endY + 5} fontSize="3" textAnchor="middle" className="font-bold">DROP</text>
            </svg>
        )}

        {/* --- Vehicle Marker --- */}
        {activeRide && activeRide.status !== RideStatus.SEARCHING && (
            <div 
                className="absolute w-12 h-12 z-20 transition-all duration-300 ease-out flex flex-col items-center justify-center"
                style={{ 
                    left: `${activeRide.status === RideStatus.IN_PROGRESS ? currentX : (activeRide.status === RideStatus.ARRIVED ? startX : 50)}%`, 
                    top: `${activeRide.status === RideStatus.IN_PROGRESS ? currentY : (activeRide.status === RideStatus.ARRIVED ? startY : 50)}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="bg-black text-white p-2 rounded-lg shadow-xl transform -rotate-12">
                    <i className="fas fa-car-side text-lg"></i>
                </div>
                {activeRide.status === RideStatus.IN_PROGRESS && (
                    <div className="absolute -bottom-6 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap">
                        2 min away
                    </div>
                )}
            </div>
        )}

        {/* --- Searching Radar Animation --- */}
        {activeRide?.status === RideStatus.SEARCHING && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-blue-500/5 rounded-full animate-ping absolute"></div>
                <div className="w-48 h-48 bg-blue-500/10 rounded-full animate-ping delay-100 absolute"></div>
                <div className="z-10 bg-white p-4 rounded-full shadow-xl">
                    <i className="fas fa-search-location text-3xl text-blue-600"></i>
                </div>
            </div>
        )}
    </div>
  );
};
