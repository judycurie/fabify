import React, { useState } from 'react';
import { AppTheme } from '../types/tag';
import { UserProfile } from '../types/auth';
import { loginWithGoogle, loginWithEmail } from '../utils/auth';
import { X, Check, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  theme: AppTheme;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  theme,
  title = 'Sign in to download free STLs',
  subtitle = 'Sign in or create a free maker account to download free community 3D printable STLs.',
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const user = loginWithGoogle('judymariecurie@gmail.com', 'Judy Curie');
      setIsSubmitting(false);
      onLoginSuccess(user);
      onClose();
    }, 250);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const user = loginWithEmail(email, name);
      setIsSubmitting(false);
      onLoginSuccess(user);
      onClose();
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/60'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Free Maker Account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs mb-5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {subtitle}
        </p>

        {/* Benefits bullets */}
        <div className={`p-3 rounded-2xl border mb-5 space-y-2 text-xs ${
          isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Instant 1-click binary STL downloads</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Unlimited free community tags and desk trays</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Saved customized parametric parameters</span>
          </div>
        </div>

        {/* Sign In Options */}
        <div className="space-y-3">
          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className={`w-full h-12 rounded-2xl border font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm ${
              isLight
                ? 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 shadow-zinc-200/50'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white shadow-black'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSubmitting ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className={`flex-1 h-px ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
            <span className="text-[10px] font-mono uppercase text-zinc-400">or</span>
            <div className={`flex-1 h-px ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
          </div>

          {/* Email Login Option */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className={`w-full h-11 rounded-2xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                isLight
                  ? 'border-zinc-300 hover:border-zinc-400 text-zinc-700 bg-white'
                  : 'border-zinc-800 hover:border-zinc-700 text-zinc-300 bg-zinc-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Continue with Email</span>
            </button>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-zinc-600 dark:text-zinc-400">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="maker@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-11 px-3 rounded-xl text-xs border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-900'
                      : 'bg-zinc-950 border-zinc-700 text-white focus:border-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1 text-zinc-600 dark:text-zinc-400">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Alex Maker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full h-11 px-3 rounded-xl text-xs border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-zinc-900'
                      : 'bg-zinc-950 border-zinc-700 text-white focus:border-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isLight
                    ? 'bg-zinc-900 hover:bg-black text-white'
                    : 'bg-white hover:bg-zinc-200 text-zinc-950'
                }`}
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In & Download Free STL'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <p className="text-[10px] text-center text-zinc-400 mt-5">
          By signing in, you agree to the Fabify Free Community Maker terms.
        </p>
      </div>
    </div>
  );
};
