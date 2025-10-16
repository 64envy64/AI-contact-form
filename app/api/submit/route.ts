import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase-server';
import { contactFormSchema } from '@/lib/validations';
import type { APIResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const body = await request.json();
    const validatedData = contactFormSchema.parse(body);

    const { name, email, subject, message } = validatedData;

    // check if user exists, if not create one
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('name')
      .eq('name', name)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking user:', userCheckError);
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Ошибка при проверке пользователя' },
        { status: 500 }
      );
    }

    // create user if doesn't exist
    if (!existingUser) {
      const { error: userCreateError } = await supabase
        .from('users')
        .insert({ name, ai_usage_count: 0 } as never);

      if (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return NextResponse.json<APIResponse>(
          { success: false, error: 'Ошибка при создании пользователя' },
          { status: 500 }
        );
      }
    }

    // create submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_name: name,
        email,
        subject,
        message
      } as never)
      .select('id')
      .single();

    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Ошибка при сохранении отправки' },
        { status: 500 }
      );
    }

    if (!submission) {
      return NextResponse.json<APIResponse>(
        { success: false, error: 'Не удалось создать отправку' },
        { status: 500 }
      );
    }

    return NextResponse.json<APIResponse>(
      { success: true, data: { id: (submission as { id: string }).id } },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/submit:', error);

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
