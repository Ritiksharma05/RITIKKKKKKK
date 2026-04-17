import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-['Inter']">
      <nav className="border-b border-white/5 p-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={24} />
            </div>
            <span className="text-xl font-bold">UserDashboard</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-[#111] rounded-2xl border-4 border-[#111]">
               <div className="w-24 h-24 bg-zinc-800 rounded-xl flex items-center justify-center text-3xl font-bold">
                 {user?.email?.[0].toUpperCase()}
               </div>
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <h1 className="text-3xl font-bold mb-1">{user?.email?.split('@')[0]}</h1>
            <p className="text-zinc-500 mb-8">{user?.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Mail className="text-zinc-500" size={20} />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Email</p>
                    <p className="text-sm">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Shield className="text-zinc-500" size={20} />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Account Type</p>
                    <p className="text-sm capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Calendar className="text-zinc-500" size={20} />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Member Since</p>
                    <p className="text-sm">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    Go to Admin Panel
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
