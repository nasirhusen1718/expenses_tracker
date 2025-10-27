
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Expense, Category } from '../types';
import { MoneyIcon, ChartBarIcon, CashIcon, CalendarIcon } from './Icons';

interface DashboardProps {
  expenses: Expense[];
  budget: number;
  totalExpenses: number;
}

const categoryColors: { [key in Category]: string } = {
  [Category.Food]: '#8884d8',
  [Category.Transport]: '#82ca9d',
  [Category.Utilities]: '#ffc658',
  [Category.Entertainment]: '#ff8042',
  [Category.Health]: '#0088FE',
  [Category.Shopping]: '#00C49F',
  [Category.Other]: '#FFBB28',
};

const Dashboard: React.FC<DashboardProps> = ({ expenses, budget, totalExpenses }) => {
  const remainingBudget = budget - totalExpenses;

  const dataForChart = useMemo(() => {
    const today = new Date();
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
      });

    const categoryTotals: { [key in Category]?: number } = {};
    for (const category of Object.values(Category)) {
        categoryTotals[category] = 0;
    }

    monthlyExpenses.forEach(expense => {
      if (categoryTotals[expense.category] !== undefined) {
        categoryTotals[expense.category]! += expense.amount;
      }
    });

    return Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);
  }, [expenses]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-700 dark:text-slate-200">Monthly Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex items-center">
          <div className="bg-blue-500/20 text-blue-500 p-3 rounded-full mr-4"><MoneyIcon className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Budget</p>
            <p className="text-xl font-bold">{formatCurrency(budget)}</p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex items-center">
          <div className="bg-red-500/20 text-red-500 p-3 rounded-full mr-4"><CashIcon className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
            <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex items-center">
          <div className="bg-green-500/20 text-green-500 p-3 rounded-full mr-4"><CalendarIcon className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
            <p className={`text-xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(remainingBudget)}</p>
          </div>
        </div>
      </div>

      <div className="h-80">
        <h3 className="text-lg font-semibold mb-4 text-slate-600 dark:text-slate-300">Spending by Category</h3>
        {dataForChart.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataForChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs"/>
              <YAxis tickFormatter={formatCurrency} tick={{ fill: 'currentColor' }} className="text-xs"/>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  borderColor: 'rgba(71, 85, 105, 1)', 
                  borderRadius: '0.5rem' 
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Spent" fill="#8884d8">
                {dataForChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.name as Category] || '#cccccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-700/50 rounded-lg">
             <div className="text-center text-slate-500 dark:text-slate-400">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                <p>No expenses recorded for this month yet.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
