# Expense Tracker Application

A modern expense tracking application built with React, TypeScript, Vite, and Flask. This application allows users to track their expenses, view spending patterns, and manage their finances effectively.

## Features

- User authentication (Login/Register)
- Role-based access control (User/Admin)
- Add, view, and manage expenses
- Visualize spending with interactive charts
- Responsive design for all devices
- RESTful API backend
- JWT Authentication

## Tech Stack

### Frontend
- **Framework**: React 19
- **State Management**: React Hooks
- **Charts**: Recharts
- **Build Tool**: Vite
- **Language**: TypeScript

### Backend
- **Framework**: Python Flask
- **Authentication**: JWT
- **Database**: SQLAlchemy ORM
- **API**: RESTful

## Prerequisites

### Frontend
- Node.js (v16 or later)
- npm (v7 or later) or Yarn

### Backend
- Python 3.8 or higher
- pip (Python package manager)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expenses_tracker.git
   cd expenses_tracker
   ```

### Frontend Setup

2. **Install frontend dependencies**
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   # or
   yarn
   ```

### Backend Setup

3. **Set up a virtual environment (recommended)**
   ```bash
   # Navigate to backend directory
   cd ../backend
   
   # Create a virtual environment
   python -m venv venv
   
   # Activate the virtual environment
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

4. **Start the backend server**
   ```bash
   # From the backend directory
   python app.py
   ```

5. **Start the frontend development server**
   ```bash
   # From the frontend directory
   npm run dev
   # or
   yarn dev
   ```

6. **Open in browser**
   The application should automatically open in your default browser at `http://localhost:5173`
   
   The backend API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Project Structure

```
/
# Frontend
frontend/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Application pages
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
├── index.tsx      # Application entry point
└── vite.config.ts # Vite configuration

# Backend
backend/
├── app/           # Application package
│   ├── __init__.py
│   ├── models.py  # Database models
│   ├── routes/    # API routes
│   ├── services/  # Business logic
│   └── utils/     # Utility functions
├── tests/         # Test files
├── .env           # Environment variables
├── config.py      # Configuration settings
└── app.py         # Application entry point
```

## License

This project is open source and available under the [MIT License](LICENSE).
