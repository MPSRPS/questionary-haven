export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          id: number
          question_id: number | null
          selected_answer: number | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: number
          question_id?: number | null
          selected_answer?: number | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: number
          question_id?: number | null
          selected_answer?: number | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: number
          id: number
          instructions: string | null
          options: string[]
          subject: string
          text: string
        }
        Insert: {
          correct_answer: number
          id?: number
          instructions?: string | null
          options: string[]
          subject: string
          text: string
        }
        Update: {
          correct_answer?: number
          id?: number
          instructions?: string | null
          options?: string[]
          subject?: string
          text?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          chemistry_score: number | null
          created_at: string | null
          id: number
          mathematics_score: number | null
          physics_score: number | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          chemistry_score?: number | null
          created_at?: string | null
          id?: number
          mathematics_score?: number | null
          physics_score?: number | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          chemistry_score?: number | null
          created_at?: string | null
          id?: number
          mathematics_score?: number | null
          physics_score?: number | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          aggregate_score: number | null
          chemistry_score: number | null
          created_at: string
          end_time: string | null
          id: number
          is_complete: boolean | null
          mathematics_score: number | null
          physics_score: number | null
          start_time: string
        }
        Insert: {
          aggregate_score?: number | null
          chemistry_score?: number | null
          created_at?: string
          end_time?: string | null
          id?: never
          is_complete?: boolean | null
          mathematics_score?: number | null
          physics_score?: number | null
          start_time?: string
        }
        Update: {
          aggregate_score?: number | null
          chemistry_score?: number | null
          created_at?: string
          end_time?: string | null
          id?: never
          is_complete?: boolean | null
          mathematics_score?: number | null
          physics_score?: number | null
          start_time?: string
        }
        Relationships: []
      }
      user_responses: {
        Row: {
          created_at: string
          id: number
          question_id: number | null
          selected_option: number | null
        }
        Insert: {
          created_at?: string
          id?: never
          question_id?: number | null
          selected_option?: number | null
        }
        Update: {
          created_at?: string
          id?: never
          question_id?: number | null
          selected_option?: number | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
