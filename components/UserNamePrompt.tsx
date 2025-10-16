'use client';

import { useState, FormEvent } from 'react';

interface UserNamePromptProps {
  onNameSubmit: (name: string) => void;
}

export default function UserNamePrompt({ onNameSubmit }: UserNamePromptProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Имя обязательно');
      return;
    }
    
    localStorage.setItem('userName', trimmedName);
    onNameSubmit(trimmedName);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 animate-fade-in">
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-7 sm:pb-4">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900">Добро пожаловать!</h2>
          <p className="text-slate-600 mb-6">
          Пожалуйста, введите ваше имя, чтобы продолжить
          </p>
        </div>
        
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2.5">
                Ваше имя
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className={`w-full px-5 py-3.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 ${
                  error ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder="Введите ваше имя"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="mt-3 w-full bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-base shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Продолжить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
