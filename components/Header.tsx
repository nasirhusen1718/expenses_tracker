
import React from 'react';
import { User } from '../types';

interface HeaderProps {
    user?: User;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          Expense Tracker
        </h1>
        {user && (
            <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                    {user.email}
                </span>
                <button
                    onClick={onLogout}
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Logout
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
