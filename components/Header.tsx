import React from 'react';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.268l4.992 2.496a1 1 0 01.008 1.788l-4.992 2.496V13a1 1 0 01-1.447.894L5 11.583V16a1 1 0 01-2 0V4.5a1 1 0 011-1h5.539a1 1 0 01.761.365l1.64 2.186a1 1 0 01-1.522 1.14l-1.64-2.186a1 1 0 01-.761-.365H5V9.417l5.553 2.776a1 1 0 00.894 0L16 9.417V6.923l-4.992-2.496a1 1 0 00-.008-1.788l3.65-1.825A1 1 0 0111.3 1.046z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">AI Learning Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
                <button 
                  onClick={onLogout}
                  className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Logout
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;