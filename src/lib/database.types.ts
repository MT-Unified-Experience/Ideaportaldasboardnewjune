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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_configs: {
        Row: {
          id: string
          product: string
          quarter: string
          user_id: string | null
          widget_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          quarter: string
          user_id?: string | null
          widget_settings: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          quarter?: string
          user_id?: string | null
          widget_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      features: {
        Row: {
          id: string
          product: string
          quarter: string
          feature_name: string
          vote_count: number
          status: string
          status_updated_at: string | null
          client_voters: string[]
          estimated_impact: string | null
          resource_requirement: string | null
          strategic_alignment: number | null
          risks: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          quarter: string
          feature_name: string
          vote_count: number
          status: string
          status_updated_at?: string | null
          client_voters: string[]
          estimated_impact?: string | null
          resource_requirement?: string | null
          strategic_alignment?: number | null
          risks?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          quarter?: string
          feature_name?: string
          vote_count?: number
          status?: string
          status_updated_at?: string | null
          client_voters?: string[]
          estimated_impact?: string | null
          resource_requirement?: string | null
          strategic_alignment?: number | null
          risks?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      responsiveness_trends: {
        Row: {
          id: string
          product: string
          quarter: string
          percentage: number
          total_ideas: number
          ideas_moved_out_of_review: number
          ideas_list: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          quarter: string
          percentage: number
          total_ideas: number
          ideas_moved_out_of_review: number
          ideas_list?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          quarter?: string
          percentage?: number
          total_ideas?: number
          ideas_moved_out_of_review?: number
          ideas_list?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      commitment_trends: {
        Row: {
          id: string
          product: string
          year: string
          committed: number | null
          delivered: number | null
          quarter: string | null
          quarterly_delivered: number | null
          idea_id: string | null
          idea_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          year: string
          committed?: number | null
          delivered?: number | null
          quarter?: string | null
          quarterly_delivered?: number | null
          idea_id?: string | null
          idea_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          year?: string
          committed?: number | null
          delivered?: number | null
          quarter?: string | null
          quarterly_delivered?: number | null
          idea_id?: string | null
          idea_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      continued_engagement: {
        Row: {
          id: string
          product: string
          quarter: string
          rate: number
          numerator: number
          denominator: number
          idea_id: string | null
          idea_name: string | null
          initial_status_change: string | null
          subsequent_changes: Json | null
          days_between: number | null
          included: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          quarter: string
          rate: number
          numerator: number
          denominator: number
          idea_id?: string | null
          idea_name?: string | null
          initial_status_change?: string | null
          subsequent_changes?: Json | null
          days_between?: number | null
          included?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          quarter?: string
          rate?: number
          numerator?: number
          denominator?: number
          idea_id?: string | null
          idea_name?: string | null
          initial_status_change?: string | null
          subsequent_changes?: Json | null
          days_between?: number | null
          included?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_submissions: {
        Row: {
          id: string
          product: string
          quarter: string
          clients_representing: number | null
          client_names: string[] | null
          idea_id: string | null
          idea_summary: string | null
          idea_client_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          quarter: string
          clients_representing?: number | null
          client_names?: string[] | null
          idea_id?: string | null
          idea_summary?: string | null
          idea_client_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          quarter?: string
          clients_representing?: number | null
          client_names?: string[] | null
          idea_id?: string | null
          idea_summary?: string | null
          idea_client_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cross_client_collaboration: {
        Row: {
          id: string
          product: string
          quarter: string
          year: string | null
          collaborative_ideas_count: number | null
          total_ideas_count: number | null
          collaboration_rate: number | null
          idea_id: string | null
          idea_name: string | null
          original_submitter: string | null
          contributors: string[] | null
          submission_date: string | null
          collaboration_score: number | null
          status: string | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          quarter: string
          year?: string | null
          collaborative_ideas_count?: number | null
          total_ideas_count?: number | null
          collaboration_rate?: number | null
          idea_id?: string | null
          idea_name?: string | null
          original_submitter?: string | null
          contributors?: string[] | null
          submission_date?: string | null
          collaboration_score?: number | null
          status?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          quarter?: string
          year?: string | null
          collaborative_ideas_count?: number | null
          total_ideas_count?: number | null
          collaboration_rate?: number | null
          idea_id?: string | null
          idea_name?: string | null
          original_submitter?: string | null
          contributors?: string[] | null
          submission_date?: string | null
          collaboration_score?: number | null
          status?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_socialization_forums: {
        Row: {
          id: string
          product: string
          forum_name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product: string
          forum_name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product?: string
          forum_name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      action_items: {
        Row: {
          id: string
          user_id: string
          product: string
          quarter: string
          text: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product: string
          quarter: string
          text: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product?: string
          quarter?: string
          text?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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