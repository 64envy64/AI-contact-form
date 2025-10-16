import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase-server';
import { submissionsQuerySchema } from '@/lib/validations';
import type { APIResponse, Submission } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Параметр name обязателен' },
        { status: 400 }
      );
    }

    const validatedQuery = submissionsQuerySchema.parse({ name });

    // fetch submissions for the user, sorted by created_at DESC
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_name', validatedQuery.name)
      .order('created_at', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Ошибка при получении отправок' },
        { status: 500 }
      );
    }

    return NextResponse.json<APIResponse<{ submissions: Submission[] }>>(
      { success: true, data: { submissions: submissions || [] } },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/submissions:', error);

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
