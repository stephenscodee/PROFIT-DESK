import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Clock, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/time-tracking', icon: Clock, label: 'Time Tracking' },
  ];

  return (
    <aside className="w-64 glass h-screen sticky top-0 flex flex-col p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Profit Desk</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10">
        <div className="mb-4 px-4">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Logged in as</p>
          <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 transition-colors uppercase text-xs font-bold"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
