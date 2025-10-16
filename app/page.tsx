'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserNamePrompt from '@/components/UserNamePrompt';
import ContactForm from '@/components/ContactForm';
import AIUsageCounter from '@/components/AIUsageCounter';

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localstorage check
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    setIsLoading(false);
  }, []);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
  };

  // load state while checking localstorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-block w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Show UserNamePrompt if no userName */}
      {!userName && <UserNamePrompt onNameSubmit={handleNameSubmit} />}

      {/* Main content */}
      <div className="container mx-auto px-4 py-10 sm:py-12 max-w-3xl">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6 sm:mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Контактная форма с AI
              </h1>
              {userName && (
                <p className="text-base text-slate-600">
                  Привет, <span className="font-semibold text-indigo-600">{userName}</span>
                </p>
              )}
            </div>
            
            {/* navigation to submissions page */}
            {userName && (
              <Link
                href="/submissions"
                className="px-6 py-3.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold border border-slate-200 shadow-md hover:shadow-lg text-base"
              >
                История отправок
              </Link>
            )}
          </div>

          {/* AI Usage Counter */}
          {userName && (
            <section aria-label="Счетчик использования AI" className="p-4 sm:p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60">
              <AIUsageCounter userName={userName} />
            </section>
          )}
        </header>

        {/* Contact Form */}
        {userName && (
          <main>
            <ContactForm userName={userName} />
          </main>
        )}
      </div>
    </div>
  );
}
