'use client';

import { useState, useEffect } from 'react';
import type { APIResponse, Submission } from '@/types';

interface SubmissionsListProps {
  userName: string;
}

export default function SubmissionsList({ userName }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/submissions?name=${encodeURIComponent(userName)}`);
        const result: APIResponse<{ submissions: Submission[] }> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Не удалось загрузить отправки');
        }

        if (result.data?.submissions) {
          setSubmissions(result.data.submissions);
        }
      } catch (error) {
        setError(
          error instanceof Error 
            ? error.message 
            : 'Ошибка при загрузке отправок'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userName) {
      fetchSubmissions();
    }
  }, [userName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Загрузка отправок...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          У вас пока нет отправок
        </h3>
        <p className="text-gray-500">
          Отправьте свою первую контактную форму, чтобы увидеть её здесь
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        История отправок ({submissions.length})
      </h2>
      
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {submission.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatTimestamp(submission.created_at)}
                </p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {submission.email}
              </span>
            </div>
            
            <div className="mt-3">
              <p className="text-gray-700 line-clamp-3">
                {getMessagePreview(submission.message)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${getMinutesText(diffInMinutes)} назад`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${getHoursText(diffInHours)} назад`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${getDaysText(diffInDays)} назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function getMinutesText(count: number): string {
  if (count === 1) {
    return 'минуту';
  } else if (count >= 2 && count <= 4) {
    return 'минуты';
  } else {
    return 'минут';
  }
}

function getHoursText(count: number): string {
  if (count === 1) {
    return 'час';
  } else if (count >= 2 && count <= 4) {
    return 'часа';
  } else {
    return 'часов';
  }
}

function getDaysText(count: number): string {
  if (count === 1) {
    return 'день';
  } else if (count >= 2 && count <= 4) {
    return 'дня';
  } else {
    return 'дней';
  }
}

function getMessagePreview(message: string, maxLength: number = 150): string {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength).trim() + '...';
}
