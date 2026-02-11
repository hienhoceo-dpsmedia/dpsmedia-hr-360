import React from 'react';
import { ViewMode, StaffInfo } from '../types';
import { LayoutDashboard, Users, Trophy, ChevronRight, BarChart2, UserCheck, LogOut, X } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  currentUser: StaffInfo | null;
  onLogout: () => void;
  isOpen: boolean; // Mobile state
  onClose: () => void; // Mobile action
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, currentUser, onLogout, isOpen, onClose }) => {
  
  const menuItems: { id: ViewMode; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'my_dashboard', label: 'My Dashboard', icon: <UserCheck size={20} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
    { id: 'global_ranking', label: 'Global Ranking', icon: <BarChart2 size={20} /> },
    // Admin Only Items
    { id: 'individual', label: 'Staff Management', icon: <Users size={20} />, adminOnly: true },
    { id: 'comparison', label: 'Comparison', icon: <LayoutDashboard size={20} />, adminOnly: true },
  ];

  // Filter menu based on role
  const visibleItems = menuItems.filter(item => !item.adminOnly || currentUser?.role === 'admin');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-screen w-72 glass-sidebar flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl lg:shadow-none
      `}>
        {/* Brand Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-primary/30">d</div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                dps<span className="text-primary">.media</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-10">HR Intelligence</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent my-2"></div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                onClose();
              }}
              className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 border ${
                currentView === item.id
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_20px_rgba(0,210,106,0.1)]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={currentView === item.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {currentView === item.id && <ChevronRight size={16} className="text-primary" />}
            </button>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 m-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
                 {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-900 dark:text-white font-bold">{currentUser?.name.charAt(0)}</div>}
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate w-32">{currentUser?.name}</p>
              <p className="text-[10px] text-primary uppercase font-semibold">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-red-500 dark:hover:text-white py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;