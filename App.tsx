import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { api, storeEvents } from './services/store';
import { Sidebar } from './components/Sidebar';
import { RiderPanel } from './pages/RiderPanel';
import { DriverPanel } from './pages/DriverPanel';
import { AdminPanel } from './pages/AdminPanel';
import { GeminiAssistant } from './components/GeminiAssistant';

// Layout Component
const Layout = ({ children, user, activeTab, onTabChange, onLogout }: any) => (
  <div className="flex min-h-screen bg-gray-100 font-sans text-slate-900">
    <Sidebar user={user} activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen relative">
      {children}
    </main>
    <GeminiAssistant contextStr={`Role: ${user.role}`} />
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateState = () => setUser(api.getCurrentUser());
    storeEvents.addEventListener('update', updateState);
    return () => storeEvents.removeEventListener('update', updateState);
  }, []);

  const handleLogin = async (role: UserRole) => {
    setLoading(true);
    const demoUser = MOCK_USERS.find(u => u.role === role);
    if (demoUser) {
        await api.login(demoUser.email, role);
        // Routing Logic
        if (role === UserRole.RIDER) setActiveTab('book');
        else if (role === UserRole.DRIVER) setActiveTab('dashboard');
        else setActiveTab('overview');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  // Auth/Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/city-fields.png')]"></div>
        
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex overflow-hidden z-10 min-h-[600px]">
            {/* Left: Brand */}
            <div className="w-5/12 bg-red-600 text-white p-12 flex flex-col justify-between relative">
                <div className="z-10">
                    <h1 className="text-5xl font-black tracking-tighter mb-4">GoCab</h1>
                    <p className="text-red-100 text-lg">Powered by Laravel 9</p>
                </div>
                <div className="z-10 space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center"><i className="fas fa-check text-white"></i></div>
                        <p className="font-medium">Eloquent ORM Data Layer</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center"><i className="fas fa-check text-white"></i></div>
                        <p className="font-medium">Robust API Controllers</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center"><i className="fas fa-check text-white"></i></div>
                        <p className="font-medium">Secure Authentication</p>
                    </div>
                </div>
                {/* Abstract Graphic */}
                <div className="absolute bottom-0 right-0 opacity-20 text-9xl">
                    <i className="fab fa-laravel"></i>
                </div>
            </div>

            {/* Right: Login */}
            <div className="w-7/12 p-12 flex flex-col justify-center bg-gray-50">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">System Login</h2>
                <p className="text-slate-500 mb-10">Select a role to verify the architecture.</p>
                
                <div className="grid gap-4">
                    {[
                        { role: UserRole.RIDER, label: 'Rider App', icon: 'fa-user', desc: 'Book rides via API' },
                        { role: UserRole.DRIVER, label: 'Driver App', icon: 'fa-car', desc: 'Accept jobs via API' },
                        { role: UserRole.SUPER_ADMIN, label: 'Admin Panel', icon: 'fa-server', desc: 'View Analytics' }
                    ].map((item) => (
                        <button 
                            key={item.role}
                            onClick={() => handleLogin(item.role)}
                            disabled={loading}
                            className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-red-600 hover:shadow-lg transition-all text-left group disabled:opacity-50"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <i className={`fas ${item.icon}`}></i>
                            </div>
                            <div className="ml-4">
                                <h3 className="font-bold text-slate-900">{item.label}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                            <i className="fas fa-arrow-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-600"></i>
                        </button>
                    ))}
                </div>
                {loading && <p className="text-center text-sm text-slate-400 mt-6 animate-pulse">Handshaking with Laravel Backend...</p>}
            </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
        {user.role === UserRole.RIDER && <RiderPanel user={user} />}
        {user.role === UserRole.DRIVER && <DriverPanel user={user} />}
        {user.role === UserRole.SUPER_ADMIN && <AdminPanel />}
    </Layout>
  );
};

export default App;
