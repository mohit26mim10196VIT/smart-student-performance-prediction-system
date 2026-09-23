import React, { useState } from 'react';
import { AlertCircle, ArrowRight, GraduationCap, LockKeyhole, UserRound } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<string | null>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const loginError = await onLogin(username, password);
    if (loginError) setError(loginError);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-300/30">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white"><GraduationCap className="h-6 w-6" /></div>
          <div><p className="text-lg font-bold text-slate-900">VITyarthi AI</p><p className="text-xs font-medium text-slate-500">Academic performance portal</p></div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to continue</h1>
        <p className="mt-2 text-sm text-slate-500">Access student analytics, predictions, and study recommendations.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Username
            <span className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <UserRound className="h-4 w-4 text-slate-400" /><input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full bg-transparent px-3 py-3 text-sm font-normal text-slate-900 outline-none" autoComplete="username" required />
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-700">Password
            <span className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <LockKeyhole className="h-4 w-4 text-slate-400" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent px-3 py-3 text-sm font-normal text-slate-900 outline-none" autoComplete="current-password" required />
            </span>
          </label>
          {error && <p className="flex items-center gap-2 text-sm font-medium text-rose-600"><AlertCircle className="h-4 w-4" />{error}</p>}
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Signing in...' : 'Sign in'} {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">Use the credentials configured on the server.</p>
      </section>
    </main>
  );
};