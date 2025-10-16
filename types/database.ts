// ДБ тайпы для Supabase тайпов
// Тейблы, Матчатся с supabase тейблами

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          ai_usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          ai_usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          ai_usage_count?: number
          created_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          email?: string
          subject?: string
          message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
