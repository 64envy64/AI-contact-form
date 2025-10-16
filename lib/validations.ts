import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  subject: z.enum([
    'Общий запрос',
    'Сообщение об ошибке',
    'Запрос функции',
    'Вопрос о выставлении счета'
  ], {
    message: 'Выберите тему обращения'
  }),
  message: z.string()
    .min(50, 'Сообщение должно содержать минимум 50 символов')
    .max(1000, 'Сообщение не должно превышать 1000 символов')
});

export const aiImproveSchema = z.object({
  message: z.string().min(1, 'Сообщение не может быть пустым'),
  userName: z.string().min(1, 'Имя пользователя обязательно')
});

export const userNameSchema = z.string().min(1, 'Имя не может быть пустым');

export const submissionsQuerySchema = z.object({
  name: z.string().min(1, 'Имя пользователя обязательно')
});

export const aiUsageQuerySchema = z.object({
  name: z.string().min(1, 'Имя пользователя обязательно')
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type AIImproveInput = z.infer<typeof aiImproveSchema>;
export type SubmissionsQueryInput = z.infer<typeof submissionsQuerySchema>;
export type AIUsageQueryInput = z.infer<typeof aiUsageQuerySchema>;
