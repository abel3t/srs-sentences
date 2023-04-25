export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      sentences: {
        Row: {
          id: number
          user_id: string
          text: string | null
          is_ignored?: boolean | null
          latest_study_at: string
          inserted_at: string
        }
        Insert: {
          id?: number
          user_id: string
          text?: string | null
          is_ignored?: boolean | null
          latest_study_at: string
          inserted_at: string
        }
        Update: {
          id?: number
          user_id?: string
          text?: string | null
          is_ignored?: boolean | null
          latest_study_at: string
          inserted_at?: string
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
