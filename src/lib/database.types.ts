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
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          report_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          report_id: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          report_id?: string
          type?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
      }
      reports: {
        Row: {
          additional_info: string | null
          city: string | null
          confidence_score: number
          created_at: string
          damage_type: string
          description: string
          estimated_completion: string | null
          id: string
          image_url: string
          is_urgent: boolean
          latitude: number | null
          longitude: number | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          title: string
          urgency_reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          city?: string | null
          confidence_score?: number
          created_at?: string
          damage_type: string
          description: string
          estimated_completion?: string | null
          id?: string
          image_url: string
          is_urgent?: boolean
          latitude?: number | null
          longitude?: number | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          title: string
          urgency_reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_info?: string | null
          city?: string | null
          confidence_score?: number
          created_at?: string
          damage_type?: string
          description?: string
          estimated_completion?: string | null
          id?: string
          image_url?: string
          is_urgent?: boolean
          latitude?: number | null
          longitude?: number | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          title?: string
          urgency_reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
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
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          id?: string
          item_name: string
          quantity: number
          total_cost?: number | null
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          id?: string
          item_name?: string
          quantity?: number
          total_cost?: number | null
          unit_cost?: number
          updated_at?: string | null
        }
      }
      worker_assignments: {
        Row: {
          assigned_at: string
          change_request_note: string | null
          change_request_status: string | null
          completion_image_url: string | null
          completion_notes: string | null
          completed_at: string | null
          cost_per_hour: number | null
          estimated_hours: number | null
          id: string
          is_accepted: boolean | null
          is_completed: boolean
          materials_approved: boolean
          materials_submitted: boolean
          pay_change_requested: number | null
          rejected_reason: string | null
          report_id: string
          time_change_requested: number | null
          total_cost: number | null
          worker_id: string
        }
        Insert: {
          assigned_at?: string
          change_request_note?: string | null
          change_request_status?: string | null
          completion_image_url?: string | null
          completion_notes?: string | null
          completed_at?: string | null
          cost_per_hour?: number | null
          estimated_hours?: number | null
          id?: string
          is_accepted?: boolean | null
          is_completed?: boolean
          materials_approved?: boolean
          materials_submitted?: boolean
          pay_change_requested?: number | null
          rejected_reason?: string | null
          report_id: string
          time_change_requested?: number | null
          total_cost?: number | null
          worker_id: string
        }
        Update: {
          assigned_at?: string
          change_request_note?: string | null
          change_request_status?: string | null
          completion_image_url?: string | null
          completion_notes?: string | null
          completed_at?: string | null
          cost_per_hour?: number | null
          estimated_hours?: number | null
          id?: string
          is_accepted?: boolean | null
          is_completed?: boolean
          materials_approved?: boolean
          materials_submitted?: boolean
          pay_change_requested?: number | null
          rejected_reason?: string | null
          report_id?: string
          time_change_requested?: number | null
          total_cost?: number | null
          worker_id?: string
        }
      }
      workers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_available: boolean
          name: string
          pay_rate: number | null
          phone: string
          specialization: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_available?: boolean
          name: string
          pay_rate?: number | null
          phone: string
          specialization: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_available?: boolean
          name?: string
          pay_rate?: number | null
          phone?: string
          specialization?: string
          updated_at?: string | null
          user_id?: string | null
        }
      }
      work_requests: {
        Row: {
          created_at: string
          estimated_cost: number
          estimated_hours: number
          id: string
          notes: string | null
          proposed_completion_date: string
          report_id: string
          status: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          estimated_cost: number
          estimated_hours: number
          id?: string
          notes?: string | null
          proposed_completion_date: string
          report_id: string
          status?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number
          estimated_hours?: number
          id?: string
          notes?: string | null
          proposed_completion_date?: string
          report_id?: string
          status?: string
          updated_at?: string
          worker_id?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
