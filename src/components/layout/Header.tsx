import React from 'react';
import { Activity, RotateCcw } from 'lucide-react';

export const Header: React.FC = () => {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Ubermensch</h1>
            <p className="text-sm text-purple-100">Personal Evolution Tracker</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-700 border border-purple-500 rounded-md shadow-sm hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Data</span>
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-700 border border-purple-500 rounded-md shadow-sm hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            Export Data
          </button>
        </div>
      </div>
    </header>
  );
};