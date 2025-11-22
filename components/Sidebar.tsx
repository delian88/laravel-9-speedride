import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  const getMenuItems = () => {
    switch (user.role) {
      case UserRole.RIDER:
        return [
          { id: 'book', icon: 'fa-car', label: 'Book a Ride' },
          { id: 'history', icon: 'fa-clock', label: 'My Trips' },
          { id: 'wallet', icon: 'fa-wallet', label: 'Wallet' },
        ];
      case UserRole.DRIVER:
        return [
          { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
          { id: 'requests', icon: 'fa-bell', label: 'Ride Requests' },
          { id: 'history', icon: 'fa-history', label: 'Trip History' },
        ];
      case UserRole.SUPER_ADMIN:
        return [
          { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
          { id: 'rides', icon: 'fa-car-side', label: 'All Rides' },
          { id: 'users', icon: 'fa-users', label: 'Users' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-yellow-500 tracking-tight">
          <i className="fas fa-taxi mr-2"></i>GoCab
        </h1>
        <div className="mt-4 flex items-center space-x-3">
          <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-yellow-500" />
          <div>
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {getMenuItems().map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-yellow-500 text-slate-900 font-bold shadow-lg'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
        >
          <i className="fas fa-sign-out-alt w-5"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
