
import React from 'react';
import { Expense, Category } from '../types';
import { PencilIcon, TrashIcon, DownloadIcon, SearchIcon, XCircleIcon } from './Icons';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: Category | 'all';
  setFilterCategory: (category: Category | 'all') => void;
  dateRange: { start: string, end: string };
  setDateRange: (range: { start: string, end: string }) => void;
}

const categoryStyles: { [key in Category]: string } = {
    [Category.Food]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [Category.Transport]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [Category.Utilities]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [Category.Entertainment]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    [Category.Health]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [Category.Shopping]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    [Category.Other]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};


const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  onEdit, 
  onDelete,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  dateRange,
  setDateRange 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const exportToCSV = () => {
    const headers = 'ID,Description,Amount,Category,Date\n';
    const rows = expenses.map(e => 
      `${e.id},"${e.description.replace(/"/g, '""')}",${e.amount},${e.category},${e.date}`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'expenses.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setDateRange({ start: '', end: '' });
  };
  
  const areFiltersActive = searchTerm || filterCategory !== 'all' || dateRange.start || dateRange.end;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Expense History</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          disabled={expenses.length === 0}
        >
          <DownloadIcon className="w-4 h-4 mr-2"/>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="relative md:col-span-2 lg:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder="Filter by description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as Category | 'all')}
            className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Categories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                id="end-date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
        </div>
        <div>
          {areFiltersActive && (
              <button 
                  onClick={handleResetFilters}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  <XCircleIcon className="w-5 h-5"/>
                  Reset
              </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {expenses.length === 0 ? (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">
            {areFiltersActive ? "No expenses match your filters." : "No expenses found. Add one to get started!"}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryStyles[expense.category]}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => onEdit(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDelete(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
