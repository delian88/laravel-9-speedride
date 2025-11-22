import React, { useEffect, useState } from 'react';
import { api, storeEvents } from '../services/store';
import { Ride, RideStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyzeRideData } from '../services/geminiService';

export const AdminPanel: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        const data = await api.getRides();
        setRides(data);
    };
    fetchData();
    storeEvents.addEventListener('update', fetchData);
    return () => storeEvents.removeEventListener('update', fetchData);
  }, []);

  const totalRevenue = rides.reduce((acc, r) => acc + r.fare, 0);
  const completedRides = rides.filter(r => r.status === RideStatus.COMPLETED).length;
  const activeRides = rides.filter(r => r.status === RideStatus.IN_PROGRESS).length;

  // Chart Data
  const statusData = [
      { name: 'Completed', value: completedRides, color: '#10b981' },
      { name: 'Cancelled', value: rides.filter(r => r.status === RideStatus.CANCELLED).length, color: '#ef4444' },
      { name: 'Active', value: activeRides, color: '#3b82f6' }
  ];

  const weeklyData = [
      { name: 'Mon', rides: 120 },
      { name: 'Tue', rides: 145 },
      { name: 'Wed', rides: 130 },
      { name: 'Thu', rides: 180 },
      { name: 'Fri', rides: 250 },
      { name: 'Sat', rides: 290 },
      { name: 'Sun', rides: 210 },
  ];

  const handleAnalysis = async () => {
      setLoadingInsight(true);
      const dataSummary = {
          totalRevenue,
          rideCount: rides.length,
          conversionRate: '85%',
          avgFare: (totalRevenue / (rides.length || 1)).toFixed(2)
      };
      const insight = await analyzeRideData(JSON.stringify(dataSummary));
      setAiInsight(insight);
      setLoadingInsight(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
          <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500">Real-time platform metrics</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm font-bold uppercase mb-2">Total Revenue</p>
            <h2 className="text-3xl font-black text-slate-900">${totalRevenue.toFixed(2)}</h2>
            <div className="text-green-500 text-sm font-medium mt-2">+12.5% this week</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm font-bold uppercase mb-2">Total Trips</p>
            <h2 className="text-3xl font-black text-slate-900">{rides.length}</h2>
            <div className="text-slate-400 text-sm font-medium mt-2">Lifetime volume</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm font-bold uppercase mb-2">Active Now</p>
            <h2 className="text-3xl font-black text-blue-600">{activeRides}</h2>
            <div className="text-blue-400 text-sm font-medium mt-2">Live trips</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm font-bold uppercase mb-2">Completion Rate</p>
            <h2 className="text-3xl font-black text-green-600">94.2%</h2>
            <div className="text-slate-400 text-sm font-medium mt-2">High reliability</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Ride Volume Trends</h3>
                  <select className="bg-slate-50 border-none text-sm rounded-lg p-2 outline-none"><option>This Week</option></select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="rides" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
          </div>
          
          {/* AI Insights Panel */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col">
              <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <i className="fas fa-magic text-purple-400"></i>
                  </div>
                  <h3 className="font-bold text-lg">Gemini Analytics</h3>
              </div>
              
              <div className="flex-1 bg-white/5 rounded-xl p-4 mb-4 text-slate-300 text-sm leading-relaxed overflow-y-auto">
                  {loadingInsight ? (
                      <div className="flex items-center justify-center h-full">
                          <i className="fas fa-circle-notch fa-spin text-2xl"></i>
                      </div>
                  ) : aiInsight ? (
                      aiInsight
                  ) : (
                      "AI Analysis ready. Click below to generate insights based on current platform performance metrics."
                  )}
              </div>

              <button 
                onClick={handleAnalysis}
                disabled={loadingInsight}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                  Generate Report
              </button>
          </div>
      </div>

      {/* Live Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Live Transactions</h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                      <th className="p-4 font-semibold">Ride ID</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Fare</th>
                      <th className="p-4 font-semibold">Time</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {rides.slice().reverse().map(ride => (
                      <tr key={ride.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-500">#{ride.id.slice(-8)}</td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                  ride.status === RideStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                  ride.status === RideStatus.SEARCHING ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                              }`}>
                                  {ride.status}
                              </span>
                          </td>
                          <td className="p-4 text-sm font-medium">{ride.vehicleType}</td>
                          <td className="p-4 font-bold text-slate-700">${ride.fare}</td>
                          <td className="p-4 text-xs text-slate-400">{new Date(ride.createdAt).toLocaleTimeString()}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};
