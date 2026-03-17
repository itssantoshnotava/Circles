import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Key, LogIn, User } from 'lucide-react';
import { 
  validateAccessCode, 
  setAccessGranted, 
  setGuestMode, 
  getOrCreateUserId, 
  linkUserToCode,
  signInWithGoogle,
  isAccessGranted,
  getAuthUser
} from '../services/firebaseService';

interface AccessGateProps {
  onAccessGranted: () => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onAccessGranted }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'code' | 'auth'>('code');
  const [validatedCode, setValidatedCode] = useState('');

  useEffect(() => {
    if (isAccessGranted()) {
      console.log("Returning user -> skipping access code");
      setStep('auth');
    } else {
      console.log("First time user -> showing access code");
    }
  }, []);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    const result = await validateAccessCode(code);
    if (result.valid) {
      setValidatedCode(code);
      setAccessGranted(true);
      setStep('auth');
    } else {
      setError(result.error || 'Invalid code');
    }
    setLoading(false);
  };

  const handleGuestMode = () => {
    setGuestMode(true);
    setAccessGranted(true);
    onAccessGranted();
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      const userId = getOrCreateUserId();
      if (validatedCode) {
        await linkUserToCode(userId, validatedCode);
      }
      onAccessGranted();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleAppleLogin = () => {
    alert("Apple Sign-In is not configured yet. Please use Google.");
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 'code' ? (
          <motion.div
            key="code-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 space-y-8 border-white/5">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Key className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter">Enter <span className="text-emerald-500">Access Code</span></h1>
                <p className="text-white/40 text-sm font-medium">Please enter your 10-character code to continue</p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="AB12CD34EF"
                    maxLength={10}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-xl font-mono tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all uppercase"
                  />
                  {error && (
                    <p className="text-red-400 text-xs font-bold text-center uppercase tracking-wider">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 text-lg"
                  disabled={loading || code.length < 10}
                >
                  {loading ? 'Validating...' : 'Continue'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-[#050505] px-4 text-white/20 font-black">Or</span>
                </div>
              </div>

              <button
                onClick={handleGuestMode}
                className="w-full py-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-center gap-3 group"
              >
                <User className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                <span className="text-white/40 font-black uppercase tracking-widest text-sm group-hover:text-white/80 transition-colors">Continue as Guest</span>
              </button>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="auth-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 space-y-8 border-white/5">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <LogIn className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter">Choose <span className="text-emerald-500">Login</span></h1>
                <p className="text-white/40 text-sm font-medium">Access granted. Please sign in to save your progress.</p>
              </div>

              <div className="space-y-4">
                {/* Real Branded Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full h-[52px] bg-white rounded-xl flex items-center justify-center gap-3 hover:bg-[#f8f8f8] transition-all shadow-sm border border-[#dadce0]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[#3c4043] font-medium text-[15px]">Continue with Google</span>
                </button>

                {/* Real Branded Apple Button */}
                <button
                  onClick={handleAppleLogin}
                  className="w-full h-[52px] bg-black rounded-xl flex items-center justify-center gap-3 hover:bg-[#1a1a1a] transition-all shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.79 17.41 3.8 11.76 6.13 8.22c1.15-1.75 2.85-2.85 4.73-2.82 1.41.02 2.35.78 3.38.78 1.02 0 2.26-.87 3.9-.74 1.71.13 3.01.76 3.87 2.01-3.49 2.1-2.93 6.66.55 8.1-.74 1.84-1.76 3.66-3.51 5.33zM14.97 3.03c-.02 2.15-1.8 4.07-3.91 3.98-.23-2.2 1.81-4.12 3.91-3.98z"/>
                  </svg>
                  <span className="text-white font-medium text-[15px]">Continue with Apple</span>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
