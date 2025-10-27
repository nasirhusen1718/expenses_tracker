export enum Category {
  Food = 'Food',
  Transport = 'Transport',
  Utilities = 'Utilities',
  Entertainment = 'Entertainment',
  Health = 'Health',
  Shopping = 'Shopping',
  Other = 'Other',
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string; // ISO string format YYYY-MM-DD
}

export interface User {
  id: string;
  email: string;
  password?: string; // Stored in the main users list, but not in the currentUser state
  role: 'user' | 'admin';
}

export interface FullExpense extends Expense {
  ownerEmail: string;
  ownerId: string;
}

export interface OverBudgetInfo {
    userId: string;
    email: string;
    totalSpent: number;
    budget: number;
}
