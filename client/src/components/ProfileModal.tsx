import React, { useState } from 'react';
import { X, User, Lock, LogOut, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { userApi } from '../utils/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { state, dispatch } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Simple login simulation - in real app, this would authenticate
        const user = {
          id: Date.now(),
          email: formData.email,
          name: formData.name || formData.email.split('@')[0],
          language: state.language,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email.split('@')[0])}&background=000000&color=ffffff`
        };
        
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        // Registration
        const user = await userApi.createUser({
          email: formData.email,
          name: formData.name,
          language: state.language,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=000000&color=ffffff`
        });
        
        dispatch({ type: 'SET_USER', payload: user });
      }
      
      onClose();
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_WATCH_PROGRESS', payload: [] });
    dispatch({ type: 'SET_MY_LIST', payload: [] });
    onClose();
  };

  const handleDeleteAccount = () => {
    if (confirm('Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.')) {
      handleLogout();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {state.user ? 'Profilo' : isLogin ? 'Accedi' : 'Registrati'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {state.user ? (
            // User profile
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                {state.user.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{state.user.name}</h3>
              <p className="text-gray-400 text-sm mb-8">{state.user.email}</p>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Esci</span>
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors w-full"
                >
                  <Trash2 size={20} />
                  <span>Elimina account</span>
                </button>
              </div>
            </div>
          ) : (
            // Login/Register form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
                  placeholder="La tua email"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
                      placeholder="Il tuo nome"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
                    placeholder="La tua password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Caricamento...' : isLogin ? 'Accedi' : 'Registrati'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
