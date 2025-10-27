import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Expense, FullExpense } from './types';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

type Page = 'login' | 'register' | 'dashboard' | 'admin';

const App: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [page, setPage] = useState<Page>(currentUser ? (currentUser.role === 'admin' ? 'admin' : 'dashboard') : 'login');
  // A dummy state to force re-renders when localStorage is manually changed by admin actions
  const [updateTrigger, setUpdateTrigger] = useState(0);


  const handleLogin = (email: string, password: string, role: 'user' | 'admin'):boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && user.role === role) {
      const { password: _, ...userToStore } = user;
      setCurrentUser(userToStore);
      setPage(userToStore.role === 'admin' ? 'admin' : 'dashboard');
      return true;
    }
    return false;
  };
  
  const handleRegister = (email: string, password: string, role: 'user' | 'admin'):boolean => {
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = { 
      id: crypto.randomUUID(), 
      email, 
      password, 
      role: role 
    };
    setUsers(prev => [...prev, newUser]);

    const { password: _, ...userToStore } = newUser;
    setCurrentUser(userToStore);
    setPage(userToStore.role === 'admin' ? 'admin' : 'dashboard');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
  };
  
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
        alert("You cannot delete your own account.");
        return;
    }
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && window.confirm(`Are you sure you want to delete user ${userToDelete.email}? This action is irreversible.`)) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        
        // Clean up associated data from localStorage
        localStorage.removeItem(`expenses_${userId}`);
        localStorage.removeItem(`budget_${userId}`);

        // This trigger is necessary to ensure all components that depend on
        // localStorage (like the allExpenses memo) are reliably updated.
        setUpdateTrigger(v => v + 1);
    }
  };

  const handleDeleteExpense = (expense: FullExpense) => {
    if (window.confirm(`Are you sure you want to delete the expense "${expense.description}" by user ${expense.ownerEmail}? This action cannot be undone.`)) {
        const key = `expenses_${expense.ownerId}`;
        const userExpenses: Expense[] = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedExpenses = userExpenses.filter(e => e.id !== expense.id);
        localStorage.setItem(key, JSON.stringify(updatedExpenses));
        setUpdateTrigger(v => v + 1); // Trigger a re-render for components that depend on localStorage reads
    }
  };

  // Moved useMemo to the top level to comply with Rules of Hooks.
  // This calculates all expenses which are then passed to the AdminPage if the user is an admin.
  const allExpenses: FullExpense[] = useMemo(() => {
    return users.flatMap(user => {
        if (user.role === 'admin') return []; // Don't include admin's personal expenses in global view
        const userExpenses: Expense[] = JSON.parse(localStorage.getItem(`expenses_${user.id}`) || '[]');
        return userExpenses.map(expense => ({
            ...expense,
            ownerEmail: user.email,
            ownerId: user.id
        }));
    });
  }, [users, updateTrigger]);
  
  const navigate = (p: 'login' | 'register') => setPage(p);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        {page === 'login' ? (
          <LoginPage onLogin={handleLogin} onNavigate={navigate} />
        ) : (
          <RegisterPage onRegister={handleRegister} onNavigate={navigate} />
        )}
      </div>
    );
  }
  
  if (currentUser.role === 'admin') {
    const otherUsers = users.filter(u => u.id !== currentUser.id);

    return (
        <AdminPage 
            user={currentUser} 
            onLogout={handleLogout} 
            users={otherUsers}
            expenses={allExpenses}
            onDeleteUser={handleDeleteUser}
            onDeleteExpense={handleDeleteExpense}
        />
    );
  }


  return <DashboardPage user={currentUser} onLogout={handleLogout} />;
};

export default App;