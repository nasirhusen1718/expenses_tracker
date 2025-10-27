import React, { useMemo, useState, useEffect } from 'react';
import { User, Expense, Category, FullExpense, OverBudgetInfo } from '../types';
import Header from '../components/Header';
import Notification from '../components/Notification';
import { UsersIcon, CashIcon, TrashIcon, MoneyIcon, MegaphoneIcon } from '../components/Icons';

type NotificationType = 'warning' | 'info' | 'success';

interface AdminPageProps {
  user: User;
  onLogout: () => void;
  users: User[];
  expenses: FullExpense[];
  onDeleteUser: (userId: string) => void;
  onDeleteExpense: (expense: FullExpense) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// --- Sub-components for Admin Page ---

const UserList: React.FC<{ users: User[], onDeleteUser: (id: string) => void }> = ({ users, onDeleteUser }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">User Management</h3>
        <div className="overflow-x-auto">
            {users.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className="text-center py-4 text-slate-500 dark:text-slate-400">No other users found.</p>}
        </div>
    </div>
);

const AllExpensesList: React.FC<{ expenses: FullExpense[], onDeleteExpense: (expense: FullExpense) => void }> = ({ expenses, onDeleteExpense }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">All User Expenses</h3>
        <div className="overflow-x-auto">
            {expenses.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {expenses.map(expense => (
                            <tr key={expense.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{expense.ownerEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{expense.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{formatCurrency(expense.amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onDeleteExpense(expense)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className="text-center py-4 text-slate-500 dark:text-slate-400">No expenses recorded by users yet.</p>}
        </div>
    </div>
);

const BudgetMonitor: React.FC<{ users: OverBudgetInfo[], onSendAlert: (userId: string) => void }> = ({ users, onSendAlert }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Budget Monitoring</h3>
        <div className="overflow-x-auto">
            {users.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Spending</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Budget</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.userId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400 font-semibold">{formatCurrency(user.totalSpent)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{formatCurrency(user.budget)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      onClick={() => onSendAlert(user.userId)} 
                                      className="flex items-center gap-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                      title={`Send alert to ${user.email}`}
                                    >
                                        <MegaphoneIcon className="w-4 h-4" />
                                        Alert
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className="text-center py-4 text-slate-500 dark:text-slate-400">No users are currently over budget.</p>}
        </div>
    </div>
);


// --- Main Admin Page Component ---

const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout, users, expenses, onDeleteUser, onDeleteExpense }) => {
  const [adminNotification, setAdminNotification] = useState<{ message: string, type: NotificationType } | null>(null);
  
  const totalUsers = users.length;
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const overBudgetUsers: OverBudgetInfo[] = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return users.map(u => {
      const budget = parseFloat(localStorage.getItem(`budget_${u.id}`) || '0');
      if (budget === 0) return null;

      const userExpenses: Expense[] = JSON.parse(localStorage.getItem(`expenses_${u.id}`) || '[]');
      const totalSpentThisMonth = userExpenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      if (totalSpentThisMonth > budget) {
        return {
          userId: u.id,
          email: u.email,
          totalSpent: totalSpentThisMonth,
          budget
        };
      }
      return null;
    }).filter((u): u is OverBudgetInfo => u !== null);
  }, [users]); // This will re-calculate when the list of users changes

  const averageBudget = () => {
      const budgets = users.map(u => parseFloat(localStorage.getItem(`budget_${u.id}`) || '0')).filter(b => b > 0);
      if (budgets.length === 0) return 0;
      return budgets.reduce((acc, b) => acc + b, 0) / budgets.length;
  };
  
  const handleSendAlert = (userId: string) => {
    const notification = {
        message: "An administrator has noted that you are over your monthly budget. Please review your expenses.",
        type: "warning" as NotificationType
    };
    localStorage.setItem(`notification_for_${userId}`, JSON.stringify(notification));
    
    // Show confirmation to admin
    setAdminNotification({ message: "Alert successfully sent to user.", type: 'success' });
    setTimeout(() => setAdminNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Admin Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg flex items-center shadow-lg">
                <div className="bg-blue-500/20 text-blue-500 p-3 rounded-full mr-4"><UsersIcon className="w-6 h-6"/></div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                    <p className="text-xl font-bold">{totalUsers}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg flex items-center shadow-lg">
                <div className="bg-red-500/20 text-red-500 p-3 rounded-full mr-4"><CashIcon className="w-6 h-6"/></div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses Logged</p>
                    <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                </div>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg flex items-center shadow-lg">
                <div className="bg-green-500/20 text-green-500 p-3 rounded-full mr-4"><MoneyIcon className="w-6 h-6"/></div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Average User Budget</p>
                    <p className="text-xl font-bold">{formatCurrency(averageBudget())}</p>
                </div>
            </div>
        </div>
        
        {/* Management Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-8">
                <UserList users={users} onDeleteUser={onDeleteUser} />
                <BudgetMonitor users={overBudgetUsers} onSendAlert={handleSendAlert} />
            </div>
            <div className="space-y-8">
                <AllExpensesList expenses={expenses} onDeleteExpense={onDeleteExpense} />
            </div>
        </div>

      </main>
      {adminNotification && (
        <Notification 
            message={adminNotification.message}
            type={adminNotification.type}
            onClose={() => setAdminNotification(null)}
        />
      )}
    </div>
  );
};

export default AdminPage;