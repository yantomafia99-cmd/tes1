import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, CalendarClock, UserMinus } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800';

  return (
    <div className="w-64 bg-blue-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-10">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold">ART Manager</h1>
        <p className="text-xs text-blue-300 mt-1">Household HR System</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/employees" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/employees')}`}>
          <Users size={20} />
          <span>Master Karyawan</span>
        </Link>
        <Link to="/balances" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/balances')}`}>
          <CalendarDays size={20} />
          <span>Saldo Cuti</span>
        </Link>
        <Link to="/leave-usage" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/leave-usage')}`}>
          <CalendarClock size={20} />
          <span>Pemakaian Cuti</span>
        </Link>
        <Link to="/termination" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/termination')}`}>
          <UserMinus size={20} />
          <span>Terminasi</span>
        </Link>
      </nav>
      <div className="p-4 text-xs text-blue-400 text-center">
        &copy; 2025 HR System
      </div>
    </div>
  );
};