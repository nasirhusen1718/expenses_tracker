import React, { useState, useMemo, useEffect } from 'react';
import { Expense, Category, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Notification from '../components/Notification';

type NotificationType = 'warning' | 'info' | 'success';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`expenses_${user.id}`, []);
  const [budget, setBudget] = useLocalStorage<number>(`budget_${user.id}`, 2000);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // State for notifications
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  const triggerNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    setEditingExpense(null);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const totalExpenses = useMemo(() => {
    const today = new Date();
    return expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
      })
      .reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);
  
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
        const matchesStartDate = !startDate || expenseDate >= startDate;
        const matchesEndDate = !endDate || expenseDate <= endDate;
        
        return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, filterCategory, dateRange]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Effect for budget notifications
  useEffect(() => {
    const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
    const currentBudgetMessageType = notification?.message.includes('exceeded') ? 'exceeded' : notification?.message.includes('90%') ? 'approaching' : null;

    if (percentage >= 100) {
        if (currentBudgetMessageType !== 'exceeded') {
             triggerNotification(
                `Warning: You've exceeded your budget of ${formatCurrency(budget)}.`, 
                'warning' 
            );
        }
    } else if (percentage >= 90) {
        if (currentBudgetMessageType !== 'approaching') {
            triggerNotification(
                `You are approaching your budget limit, with over 90% spent.`, 
                'warning' 
            );
        }
    } else {
        if (notification && (notification.message.includes('budget') || notification.message.includes('90%'))) {
            setNotification(null);
        }
    }
  }, [totalExpenses, budget]);

  // Effect to check for admin-sent notifications on mount
  useEffect(() => {
    const notificationKey = `notification_for_${user.id}`;
    const storedNotification = localStorage.getItem(notificationKey);
    if (storedNotification) {
      try {
        const parsed: { message: string, type: NotificationType } = JSON.parse(storedNotification);
        triggerNotification(parsed.message, parsed.type);
        localStorage.removeItem(notificationKey); // Clear after showing
      } catch (e) {
        console.error("Could not parse user notification", e);
        localStorage.removeItem(notificationKey); // Clear if corrupted
      }
    }
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Dashboard expenses={expenses} budget={budget} totalExpenses={totalExpenses} />
            <ExpenseList 
              expenses={filteredExpenses} 
              onEdit={handleEdit} 
              onDelete={deleteExpense}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
          <div className="lg:col-span-1">
            <ExpenseForm 
              onAddExpense={addExpense} 
              onUpdateExpense={updateExpense}
              editingExpense={editingExpense}
              clearEditing={() => setEditingExpense(null)}
              budget={budget}
              onSetBudget={setBudget}
              totalExpenses={totalExpenses}
            />
          </div>
        </div>
      </main>
      {notification && (
        <Notification 
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;