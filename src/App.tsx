/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CafeDashboard from './components/CafeDashboard.tsx';
import { Coffee, Sparkles, User, Mail, Lock, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { User as UserType } from './types.ts';

const AVATAR_COLORS = [
  '#8B4513', // Chocolate Brown
  '#4CAF50', // Forest Sage
  '#F48FB1', // Blossom Pink
  '#FFB74D', // Honey Peach
  '#26A69A', // Coastal Teal
];

export default function App() {
  const [phase, setPhase] = useState<'loading' | 'auth' | 'app'>('loading');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Form Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(AVATAR_COLORS[0]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // 1. Initial loading transition
  useEffect(() => {
    // Check if user session already exists in localStorage
    const storedSession = localStorage.getItem('active_session_user');
    const timer = setTimeout(() => {
      if (storedSession) {
        try {
          const userObj = JSON.parse(storedSession);
          setCurrentUser(userObj);
          setPhase('app');
        } catch {
          setPhase('auth');
        }
      } else {
        setPhase('auth');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // 2. Authentication handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email.trim() || !password.trim()) {
      setFormError('Please fill out all credentials.');
      return;
    }

    // Retrieve local user accounts
    const savedAccountsRaw = localStorage.getItem('accounts_list');
    const accounts: UserType[] = savedAccountsRaw ? JSON.parse(savedAccountsRaw) : [];

    if (authMode === 'signup') {
      if (!username.trim()) {
        setFormError('Please enter a username.');
        return;
      }

      const emailExists = accounts.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setFormError('An account with this email already exists.');
        return;
      }

      // Create new user profile with some default bonus funds ($50.00)
      const newUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        username: username.trim(),
        email: email.trim(),
        avatarColor: selectedAvatarColor,
        balance: 50.00, // Starter funds bonus
        loyaltyPoints: 100, // Welcome points gift
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      accounts.push(newUser);
      // Keep credentials secure locally for login mock
      localStorage.setItem(`pass_${newUser.id}`, password);
      localStorage.setItem('accounts_list', JSON.stringify(accounts));
      
      setFormSuccess('🌱 Profile sprout successful! Redirecting to dashboard...');
      
      // Auto log in new user after briefly displaying success
      setTimeout(() => {
        setCurrentUser(newUser);
        localStorage.setItem('active_session_user', JSON.stringify(newUser));
        setPhase('app');
        // Reset form inputs
        setUsername('');
        setEmail('');
        setPassword('');
      }, 1500);

    } else {
      // Find matching user
      const foundUser = accounts.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        setFormError('No account found with this email.');
        return;
      }

      const savedPass = localStorage.getItem(`pass_${foundUser.id}`);
      if (savedPass !== password) {
        setFormError('Invalid password credentials.');
        return;
      }

      setCurrentUser(foundUser);
      localStorage.setItem('active_session_user', JSON.stringify(foundUser));
      setPhase('app');
      setEmail('');
      setPassword('');
    }
  };

  // 3. Keep local storage synced when user attributes update
  const handleUpdateUser = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('active_session_user', JSON.stringify(updatedUser));

    // Update inside accounts list
    const savedAccountsRaw = localStorage.getItem('accounts_list');
    if (savedAccountsRaw) {
      const accounts: UserType[] = JSON.parse(savedAccountsRaw);
      const updatedAccounts = accounts.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('accounts_list', JSON.stringify(updatedAccounts));
    }
  };

  // 4. Log out mechanism
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_session_user');
    setPhase('auth');
    setAuthMode('signin');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF5EE]">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: CLASSIC REUSABLE INTRO LOADING SCREEN */}
        {phase === 'loading' && (
          <motion.div
            key="intro-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full bg-[#5D4037]"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.12, 1],
                rotate: [0, 8, -8, 0]
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8"
            >
              <Coffee size={80} className="text-[#FAF5EE]" />
            </motion.div>
            
            <h1 className="font-pixel text-lg md:text-xl text-[#FAF5EE] tracking-[0.25em] mb-4">GARDEN CAFE</h1>
            
            <div className="flex gap-2.5 mt-2">
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 bg-[#FAF5EE] rounded-full" />
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-[#FAF5EE] rounded-full" />
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-[#FAF5EE] rounded-full" />
            </div>
            
            <p className="text-[10px] text-[#EBDEB7]/60 font-medium tracking-widest uppercase mt-6 font-pixel">Loading fresh grains...</p>
          </motion.div>
        )}

        {/* PHASE 2: AUTH LANDING PAGE */}
        {phase === 'auth' && (
          <motion.div
            key="auth-landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-full w-full flex items-center justify-center p-4 bg-radial from-[#FAF5EE] to-[#EBE2D6] relative overflow-y-auto"
          >
            {/* Ambient visual leaves */}
            <div className="absolute top-12 left-12 opacity-10 rotate-3 animate-pulse text-[#4CAF50]"><Coffee size={120} /></div>
            <div className="absolute bottom-12 right-12 opacity-15 -rotate-12 animate-pulse text-[#8B4513]"><Coffee size={140} /></div>

            {/* Login Frame */}
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white max-w-md w-full rounded-3xl p-8 shadow-[0_15px_45px_0_rgba(139,69,19,0.1)] border border-[#EBDEB7] flex flex-col gap-6 z-10"
            >
              {/* Logo block */}
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#8B4513] text-white rounded-2xl flex items-center justify-center shadow-md mb-3">
                  <Coffee size={32} />
                </div>
                <h2 className="font-pixel text-sm text-brown-dark tracking-wider mb-1">GARDEN CAFE</h2>
                <p className="text-xs text-brown-main font-semibold tracking-wider uppercase">Order Hub Login</p>
              </div>

              {/* Form container */}
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                
                {/* Username for Signup only */}
                {authMode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Store Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Gardener Robin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#EBDEB7]/60 rounded-xl text-xs focus:outline-none focus:border-brown-main font-medium focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* Email input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Customer Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" 
                      placeholder="cafe@garden.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#EBDEB7]/60 rounded-xl text-xs focus:outline-none focus:border-brown-main font-medium focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#EBDEB7]/60 rounded-xl text-xs focus:outline-none focus:border-brown-main font-medium focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Avatar Color Picker for Signup */}
                {authMode === 'signup' && (
                  <div className="flex flex-col gap-2.5 mt-1 border-t border-dashed border-[#EBDEB7] pt-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">CHOOSE ACCENT AVATAR COLOR</label>
                    <div className="flex justify-between items-center bg-[#FAF5EE] p-2.5 rounded-2xl border border-[#EBDEB7]/60">
                      <div className="flex gap-2">
                        {AVATAR_COLORS.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setSelectedAvatarColor(col)}
                            className="w-7 h-7 rounded-full border-2 transition hover:scale-105 active:scale-95 flex items-center justify-center relative"
                            style={{ 
                              backgroundColor: col,
                              borderColor: selectedAvatarColor === col ? '#5D4037' : 'transparent' 
                            }}
                          >
                            {selectedAvatarColor === col && (
                              <Sparkles className="text-white scale-75" size={14} />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center select-none shrink-0 cursor-default" style={{ backgroundColor: selectedAvatarColor }}>
                        <User size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback Logs */}
                {formError && (
                  <div className="text-red-500 font-bold text-[10px] pl-1 tracking-tight">⚠️ {formError}</div>
                )}
                {formSuccess && (
                  <div className="text-green-600 font-bold text-[10px] pl-1 tracking-tight">{formSuccess}</div>
                )}

                {/* Actions */}
                <button
                  type="submit"
                  className="w-full font-pixel text-[10px] bg-[#8B4513] border-b-4 border-brown-dark hover:bg-brown-main text-white py-3.5 rounded-xl uppercase active:translate-y-0.5 mt-2 flex items-center justify-center gap-2"
                >
                  {authMode === 'signin' ? <LogIn size={14} /> : <UserPlus size={14} />}
                  <span>{authMode === 'signin' ? 'Sign In' : 'Sign Up As Member'}</span>
                </button>
              </form>

              {/* Mode Toggler */}
              <div className="text-center border-t border-gray-100 pt-4 mt-1">
                <p className="text-xs text-gray-400">
                  {authMode === 'signin' ? "Don't have a coffee user account?" : "Already a custom member?"}
                </p>
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setFormError('');
                    setFormSuccess('');
                  }}
                  className="mt-1 text-xs font-bold text-brown-main hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span>{authMode === 'signin' ? 'Create Account' : 'Sign In Back'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}

        {/* PHASE 3: INTERACTIVE CAFE DASHBOARD */}
        {phase === 'app' && currentUser && (
          <motion.div
            key="app-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full"
          >
            <CafeDashboard 
              currentUser={currentUser} 
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
