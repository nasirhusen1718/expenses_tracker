
import React, { useState, useEffect } from 'react';
import { Expense, Category } from '../types';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  editingExpense: Expense | null;
  clearEditing: () => void;
  budget: number;
  onSetBudget: (budget: number) => void;
  totalExpenses: number;
}

const BudgetTracker: React.FC<{ budget: number; onSetBudget: (b: number) => void; totalExpenses: number }> = ({ budget, onSetBudget, totalExpenses }) => {
  const [newBudget, setNewBudget] = useState(budget.toString());
  
  useEffect(() => {
    setNewBudget(budget.toString());
  }, [budget]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBudget(e.target.value);
  };

  const handleBudgetSet = () => {
    const parsedBudget = parseFloat(newBudget);
    if (!isNaN(parsedBudget) && parsedBudget >= 0) {
      onSetBudget(parsedBudget);
    }
  };

  const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const progressBarColor = percentage > 100 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';


  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Budget Tracker</h3>
      <div className="mb-4">
        <label htmlFor="budget" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Set Monthly Budget
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            id="budget"
            value={newBudget}
            onChange={handleBudgetChange}
            className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 2000"
          />
          <button
            onClick={handleBudgetSet}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Set
          </button>
        </div>
      </div>
      <div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-1">
          <div className={`h-2.5 rounded-full ${progressBarColor}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400">
          {percentage.toFixed(0)}% of budget used
        </p>
      </div>
    </div>
  );
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, onUpdateExpense, editingExpense, clearEditing, budget, onSetBudget, totalExpenses }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.Food);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
    } else {
      resetForm();
    }
  }, [editingExpense]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory(Category.Food);
    setDate(new Date().toISOString().split('T')[0]);
    clearEditing();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      description,
      amount: parseFloat(amount),
      category,
      date,
    };

    if (editingExpense) {
      onUpdateExpense({ ...expenseData, id: editingExpense.id });
    } else {
      onAddExpense(expenseData);
    }
    resetForm();
  };

  return (
    <div className="space-y-8">
      <BudgetTracker budget={budget} onSetBudget={onSetBudget} totalExpenses={totalExpenses} />
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Coffee"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 3.50"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingExpense && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
