
import React, { useState } from 'react';
import { UserRole } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface LoginPageProps {
  onLogin: (name: string, pass: string) => Promise<boolean>;
  onRegister: (name: string, pass: string, role: UserRole) => Promise<boolean>;
}

type AuthMode = 'signin' | 'signup';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Ward);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    let success = false;
    try {
        if (mode === 'signin') {
            success = await onLogin(name, password);
            if (!success) setError('Invalid credentials. Please try again.');
        } else {
            success = await onRegister(name, password, role);
            if (!success) setError('A user with this name already exists.');
        }
    } catch (err) {
        setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>

        <div className="flex justify-center border-b border-slate-200 dark:border-slate-700">
            <button onClick={() => { setMode('signin'); setError(null); }} className={`px-4 py-2 text-sm font-medium ${mode === 'signin' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Sign In</button>
            <button onClick={() => { setMode('signup'); setError(null); }} className={`px-4 py-2 text-sm font-medium ${mode === 'signup' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Sign Up</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input id="name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />
            </div>
            
            {mode === 'signup' && (
                <div>
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">I am a...</span>
                    <div className="mt-2 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setRole(UserRole.Ward)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${role === UserRole.Ward ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-700'}`}>Ward</button>
                        <button type="button" onClick={() => setRole(UserRole.Tutor)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${role === UserRole.Tutor ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-700'}`}>Tutor</button>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400">
                 {isLoading ? <SpinnerIcon className="w-5 h-5" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
