export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          report_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          report_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          report_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          terms_accepted: boolean | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          terms_accepted?: boolean | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          terms_accepted?: boolean | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          additional_info: string | null
          city: string | null
          confidence_score: number | null
          created_at: string | null
          damage_type: string | null
          description: string | null
          estimated_completion: string | null
          id: string
          image_url: string | null
          is_urgent: boolean | null
          latitude: number | null
          longitude: number | null
          status: string | null
          title: string
          urgency_reason: string | null
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          city?: string | null
          confidence_score?: number | null
          created_at?: string | null
          damage_type?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          image_url?: string | null
          is_urgent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          title: string
          urgency_reason?: string | null
          user_id: string
        }
        Update: {
          additional_info?: string | null
          city?: string | null
          confidence_score?: number | null
          created_at?: string | null
          damage_type?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          image_url?: string | null
          is_urgent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          title?: string
          urgency_reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_materials: {
        Row: {
          assignment_id: string
          created_at: string | null
          id: string
          item_name: string
          quantity: number
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          id?: string
          item_name: string
          quantity?: number
          total_cost?: number | null
          unit_cost?: number
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          id?: string
          item_name?: string
          quantity?: number
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "work_materials_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "worker_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_assignments: {
        Row: {
          assigned_at: string | null
          change_request_note: string | null
          change_request_status: string | null
          completed_at: string | null
          completion_image_url: string | null
          completion_notes: string | null
          cost_per_hour: number | null
          estimated_hours: number | null
          id: string
          is_accepted: boolean | null
          is_completed: boolean | null
          materials_approved: boolean | null
          materials_submitted: boolean | null
          pay_change_requested: number | null
          rejected_reason: string | null
          report_id: string
          time_change_requested: number | null
          total_cost: number | null
          worker_id: string
        }
        Insert: {
          assigned_at?: string | null
          change_request_note?: string | null
          change_request_status?: string | null
          completed_at?: string | null
          completion_image_url?: string | null
          completion_notes?: string | null
          cost_per_hour?: number | null
          estimated_hours?: number | null
          id?: string
          is_accepted?: boolean | null
          is_completed?: boolean | null
          materials_approved?: boolean | null
          materials_submitted?: boolean | null
          pay_change_requested?: number | null
          rejected_reason?: string | null
          report_id: string
          time_change_requested?: number | null
          total_cost?: number | null
          worker_id: string
        }
        Update: {
          assigned_at?: string | null
          change_request_note?: string | null
          change_request_status?: string | null
          completed_at?: string | null
          completion_image_url?: string | null
          completion_notes?: string | null
          cost_per_hour?: number | null
          estimated_hours?: number | null
          id?: string
          is_accepted?: boolean | null
          is_completed?: boolean | null
          materials_approved?: boolean | null
          materials_submitted?: boolean | null
          pay_change_requested?: number | null
          rejected_reason?: string | null
          report_id?: string
          time_change_requested?: number | null
          total_cost?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_assignments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_assignments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_available: boolean | null
          name: string
          pay_rate: number | null
          phone: string | null
          specialization: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          pay_rate?: number | null
          phone?: string | null
          specialization?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          pay_rate?: number | null
          phone?: string | null
          specialization?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "worker" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "worker", "user"],
    },
  },
} as const
