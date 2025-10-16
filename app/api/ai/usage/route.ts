import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase-server';
import { aiUsageQuerySchema } from '@/lib/validations';
import type { APIResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    const validatedData = aiUsageQuerySchema.parse({ name });

    // query ai_usage_count from users table
    const { data, error } = await supabase
      .from('users')
      .select('ai_usage_count')
      .eq('name', validatedData.name)
      .single();

    if (error) {
      console.error('Error fetching AI usage count:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json<APIResponse>(
          { success: false, error: 'Пользователь не найден' },
          { status: 404 }
        );
      }

      return NextResponse.json<APIResponse>(
        { success: false, error: 'Ошибка при получении данных' },
        { status: 500 }
      );
    }

    // return usage count
    return NextResponse.json<APIResponse<{ count: number }>>(
      { 
        success: true, 
        data: { count: (data as { ai_usage_count: number }).ai_usage_count }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/ai/usage:', error);

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
