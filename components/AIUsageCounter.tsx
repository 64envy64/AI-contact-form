'use client';

import { useState, useEffect } from 'react';
import type { APIResponse } from '@/types';

interface AIUsageCounterProps {
  userName: string;
  onCountUpdate?: (count: number) => void;
}

export default function AIUsageCounter({ userName, onCountUpdate }: AIUsageCounterProps) {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageCount = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/usage?name=${encodeURIComponent(userName)}`);
      const result: APIResponse<{ count: number }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Не удалось загрузить счетчик');
      }

      if (result.data?.count !== undefined) {
        setUsageCount(result.data.count);
        onCountUpdate?.(result.data.count);
      }
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Ошибка при загрузке счетчика'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // load counter on mount
  useEffect(() => {
    if (userName) {
      fetchUsageCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchUsageCount();
    };

    // listen to custom events to upd counter
    window.addEventListener('ai-usage-updated', handleRefresh);

    return () => {
      window.removeEventListener('ai-usage-updated', handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 text-slate-600">
        <span className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm">Загрузка...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-2xl">✨</span>
      <p className="text-sm text-slate-700">
        Использований AI: <span className="font-semibold text-indigo-600">{usageCount}</span> {getUsageText(usageCount)}
      </p>
    </div>
  );
}

function getUsageText(count: number): string {
  if (count === 1) {
    return 'раз';
  } else if (count >= 2 && count <= 4) {
    return 'раза';
  } else {
    return 'раз';
  }
}
