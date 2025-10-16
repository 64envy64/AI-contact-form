'use client';

import { useState } from 'react';
import type { AIImproveResponse, APIResponse } from '@/types';

interface AIImproverProps {
  currentMessage: string;
  onImprove: (improved: string) => void;
  userName: string;
}

export default function AIImprover({ currentMessage, onImprove, userName }: AIImproverProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [improvedMessage, setImprovedMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!currentMessage.trim()) {
      setError('Введите сообщение для улучшения');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          userName: userName
        })
      });

      const result: APIResponse<AIImproveResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Не удалось улучшить сообщение');
      }

      if (result.data?.improvedMessage) {
        setImprovedMessage(result.data.improvedMessage);
        setShowPreview(true);
        
        window.dispatchEvent(new Event('ai-usage-updated'));
      }
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Не удалось улучшить сообщение. Попробуйте позже.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseImproved = () => {
    if (improvedMessage) {
      onImprove(improvedMessage);
      setShowPreview(false);
      setImprovedMessage(null);
      setError(null);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setImprovedMessage(null);
    setError(null);
  };

  return (
    <>
      {/* AI Improve Button */}
      <button
        type="button"
        onClick={handleImprove}
        disabled={isLoading || !currentMessage.trim()}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
          isLoading || !currentMessage.trim()
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md hover:shadow-lg active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Улучшение...
          </>
        ) : (
          <>
            <span>✨</span>
            Улучшить с помощью AI
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && improvedMessage && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-5 sm:px-7 sm:py-5 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">
                Улучшенное сообщение
              </h3>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5 sm:px-7 sm:py-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-5">
                {/* Original Message */}
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-3">
                    Исходное сообщение:
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-sm leading-relaxed">
                    {currentMessage}
                  </div>
                </div>

                {/* Improved Message */}
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-3">
                    Улучшенная версия:
                  </h4>
                  <div className="p-4 bg-violet-50 rounded-lg border border-violet-200 text-slate-800 text-sm leading-relaxed">
                    {improvedMessage}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 sm:px-7 sm:py-4 border-t border-slate-200 flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-all text-sm"
              >
                Отменить
              </button>
              <button
                type="button"
                onClick={handleUseImproved}
                className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold transition-all shadow-md hover:shadow-lg text-sm"
              >
                Использовать это
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
