'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubmissionsList from '@/components/SubmissionsList';

export default function SubmissionsPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localstorage check for name
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    setIsLoading(false);
  }, []);

  // loading status while checking localstorage
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

  // redirect to home if no username
  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Необходима авторизация
          </h2>
          <p className="text-gray-600 mb-6">
            Пожалуйста, вернитесь на главную страницу и введите ваше имя
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                История отправок
              </h1>
              <p className="text-gray-600 mt-1">
                Пользователь: <span className="font-semibold">{userName}</span>
              </p>
            </div>
            
            {/* navigation back to home */}
            <Link
              href="/"
              className="px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base shadow-md hover:shadow-lg"
            >
              ← Вернуться к форме
            </Link>
          </div>
        </header>

        {/* submissions List */}
        <main className="bg-white rounded-2xl shadow-sm p-12">
          <SubmissionsList userName={userName} />
        </main>
      </div>
    </div>
  );
}
