import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative">
        <div className="glass p-8 rounded-3xl shadow-2xl border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-sky-500/20 mb-4 transform -rotate-6">
              <TrendingUp className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Profit Desk</h1>
            <p className="text-slate-400 mt-2">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  className="input-field pl-11"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  className="input-field pl-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? <span className="text-sky-500 cursor-pointer hover:underline">Contact your administrator</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
