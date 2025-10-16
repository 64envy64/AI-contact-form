'use client';

import { useState, useEffect } from 'react';
import { contactFormSchema, type ContactFormInput } from '@/lib/validations';
import type { APIResponse } from '@/types';
import AIImprover from './AIImprover';

interface ContactFormProps {
  userName: string;
}

const SUBJECT_OPTIONS = [
  'Общий запрос',
  'Сообщение об ошибке',
  'Запрос функции',
  'Вопрос о выставлении счета'
] as const;

export default function ContactForm({ userName }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormInput>({
    name: userName,
    email: '',
    subject: '' as ContactFormInput['subject'],
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update name field when userName prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, name: userName }));
  }, [userName]);

  // Real-time validation
  const validateField = (name: keyof ContactFormInput, value: string) => {
    try {
      const fieldSchema = contactFormSchema.shape[name];
      fieldSchema.parse(value);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> };
        setErrors(prev => ({
          ...prev,
          [name]: zodError.issues[0]?.message || 'Ошибка валидации'
        }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof ContactFormInput, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validation = contactFormSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result: APIResponse<{ id: string }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка при отправке формы');
      }

      // Success - clear form and show success message
      setFormData({
        name: userName,
        email: '',
        subject: '' as ContactFormInput['subject'],
        message: ''
      });
      setErrors({});
      setSubmitSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Произошла ошибка при отправке'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLength = formData.message.length;
  const hasErrors = Object.keys(errors).length > 0 || !formData.subject;
  const isFormValid = !hasErrors && formData.name && formData.email && formData.message;

  return (
    <section aria-labelledby="contact-form-title" className="w-full mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60">
      <header className="px-6 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 lg:px-12 lg:py-10">
        <h2 id="contact-form-title" className="text-2xl font-semibold text-slate-900">Контактная форма</h2>
      </header>

      {submitSuccess && (
        <div className="mx-6 sm:mx-8 md:mx-10 lg:mx-12 mb-6 sm:mb-8 rounded-xl border border-emerald-200 bg-emerald-50/80">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 text-emerald-700">
            <span className="text-base">✓</span>
            <span className="text-sm sm:text-base">Сообщение успешно отправлено!</span>
          </div>
          <div className="h-px bg-emerald-200/70" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-6 pb-6 sm:px-8 sm:pb-8 md:px-10 md:pb-10 lg:px-12 lg:pb-12 space-y-6 sm:space-y-7" noValidate>
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-3">
            Имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-5 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
              }`}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-3">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-5 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
              }`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Subject field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-3">
            Тема обращения
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-5 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 ${errors.subject ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
              }`}
          >
            <option value="">Выберите тему</option>
            {SUBJECT_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Message field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-3">
            Сообщение
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={`w-full px-5 py-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all text-slate-900 ${errors.message ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
              }`}
          />
          <div className="flex justify-between items-center mt-2">
            <div>
              {errors.message && (
                <p className="text-sm text-red-600">{errors.message}</p>
              )}
            </div>
            <p className={`text-xs font-medium ${messageLength < 50 || messageLength > 1000 ? 'text-red-600' : 'text-slate-500'
              }`}>
              {messageLength}/1000
            </p>
          </div>

          {/* AI Improver */}
          <div className="mt-4">
            <AIImprover
              currentMessage={formData.message}
              onImprove={(improved) => {
                setFormData(prev => ({ ...prev, message: improved }));
                validateField('message', improved);
              }}
              userName={userName}
            />
          </div>
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit button */}
        <div className="pt-2 sm:pt-3" />
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all ${!isFormValid || isSubmitting
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]'
            }`}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </section>
  );
}
