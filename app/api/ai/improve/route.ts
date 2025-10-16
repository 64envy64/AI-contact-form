import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSupabaseClient } from '@/lib/supabase-server';
import { aiImproveSchema } from '@/lib/validations';
import type { APIResponse, AIImproveResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseClient();

        // validate gemini API key
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return NextResponse.json<APIResponse>(
                { success: false, error: 'AI сервис временно недоступен' },
                { status: 500 }
            );
        }

        // parse and validate request body
        const body = await request.json();
        const validatedData = aiImproveSchema.parse(body);

        const { message, userName } = validatedData;

        // initialize gemini API
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Ты помогаешь пользователю улучшить его сообщение, которое он отправляет в службу поддержки или контактную форму компании.

Перепиши следующее сообщение пользователя так, чтобы оно звучало более профессионально и понятно, но сохраняло тот же смысл и намерение. Исправь грамматические и орфографические ошибки. Сделай текст вежливым, но не слишком формальным. Сохрани точку зрения пользователя (от первого лица).

Исходное сообщение пользователя: ${message}

Верни только улучшенную версию сообщения без дополнительных комментариев или пояснений.`;


        let improvedMessage: string;
        let tokensUsed: number | undefined;

        try {
            const result = await Promise.race([
                model.generateContent(prompt),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 30000)
                )
            ]);

            const response = result.response;
            improvedMessage = response.text();

            if (response.usageMetadata) {
                tokensUsed = response.usageMetadata.totalTokenCount;
            }

        } catch (geminiError: unknown) {
            console.error('Gemini API error:', geminiError);

            const error = geminiError as { message?: string; status?: number };

            if (error.message === 'timeout') {
                return NextResponse.json<APIResponse>(
                    { success: false, error: 'Сервис временно недоступен. Попробуйте позже.' },
                    { status: 504 }
                );
            }

            if (error.status === 429 || error.message?.includes('quota')) {
                return NextResponse.json<APIResponse>(
                    { success: false, error: 'Превышен лимит запросов. Попробуйте позже.' },
                    { status: 429 }
                );
            }

            if (error.status === 401 || error.message?.includes('API key')) {
                console.error('Invalid Gemini API key');
                return NextResponse.json<APIResponse>(
                    { success: false, error: 'AI сервис временно недоступен' },
                    { status: 500 }
                );
            }

            // generic gemini error
            return NextResponse.json<APIResponse>(
                { success: false, error: 'Не удалось улучшить сообщение. Попробуйте позже.' },
                { status: 500 }
            );
        }

        // AI usage count for the user
        // get the current count
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('ai_usage_count')
            .eq('name', userName)
            .single();

        if (fetchError) {
            console.error('Error fetching user for AI usage update:', fetchError);
            // don't fail the request if counter update fails, just log it
        } else if (userData) {
            const newCount = (userData as { ai_usage_count: number }).ai_usage_count + 1;
            const { error: updateError } = await supabase
                .from('users')
                .update({ ai_usage_count: newCount } as never)
                .eq('name', userName);

            if (updateError) {
                console.error('Error updating AI usage count:', updateError);
                // don't fail the request if counter update fails, just log it
            }
        }

        // return improved message
        const responseData: AIImproveResponse = {
            improvedMessage,
            tokensUsed
        };

        return NextResponse.json<APIResponse<AIImproveResponse>>(
            { success: true, data: responseData },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in /api/ai/improve:', error);

        // zod validation errors
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((issue) => issue.message).join(', ');
            return NextResponse.json<APIResponse>(
                {
                    success: false,
                    error: 'Некорректные данные: ' + errorMessages
                },
                { status: 400 }
            );
        }

        // other errors
        return NextResponse.json<APIResponse>(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
